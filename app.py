from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import joblib
import re
import nltk
import sqlite3
import datetime
from urllib.parse import urlparse
from newspaper import Article, Config

from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

# Ensure stopwords are available
try:
    stop_words = set(stopwords.words('english'))
except LookupError:
    nltk.download('stopwords')
    stop_words = set(stopwords.words('english'))

print("Starting Flask app...")
app = Flask(__name__)
CORS(app)

# Database Setup
def init_db():
    conn = sqlite3.connect('history.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS history
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT,
                  prediction TEXT,
                  score REAL,
                  source_credibility TEXT,
                  timestamp DATETIME)''')
    conn.commit()
    conn.close()

init_db()

# Newspaper configuration
user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
config = Config()
config.browser_user_agent = user_agent
config.request_timeout = 20

# Load model and vectorizer
model = joblib.load('model.pkl')
vectorizer = joblib.load('vectorizer.pkl')

ps = PorterStemmer()

# Source Credibility Dictionary (Mock Registry)
TRUSTED_DOMAINS = ['nytimes.com', 'reuters.com', 'apnews.com', 'bbc.com', 'theguardian.com', 'wsj.com', 'bloomberg.com']
FLAGGED_DOMAINS = ['infowars.com', 'naturalnews.com', 'thegatewaypundit.com']

def get_source_credibility(url):
    if not url:
        return "Not Applicable (Direct Text)"
    
    domain = urlparse(url).netloc.lower()
    if any(trusted in domain for trusted in TRUSTED_DOMAINS):
        return "HIGH (Trusted Publisher)"
    if any(flagged in domain for flagged in FLAGGED_DOMAINS):
        return "LOW (Flagged Source)"
    return "NEUTRAL (Unverified Source)"

def preprocess(text):
    text = re.sub('[^a-zA-Z]', ' ', str(text))
    text = text.lower()
    text = text.split()
    text = [ps.stem(word) for word in text if word not in stop_words]
    return ' '.join(text)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json if request.is_json else request.form
    news_text = data.get('text') or data.get('news')
    news_url = data.get('url')
    
    final_text = ""
    error = None

    if news_url:
        try:
            article = Article(news_url, config=config)
            article.download()
            article.parse()
            final_text = article.text
            title = article.title or news_url
            if not final_text:
                error = "Access Denied or No Content: Try pasting the text manually."
        except Exception as e:
            error = f"Connection Timeout: {str(e)}"
    else:
        final_text = news_text
        title = (news_text[:50] + "...") if news_text and len(news_text) > 50 else news_text

    if error:
        return jsonify({'error': error}), 400 if request.is_json else render_template('index.html', error=error)

    if not final_text:
        msg = "Trace analysis requires input."
        return jsonify({'error': msg}), 400 if request.is_json else render_template('index.html', error=msg)

    processed = preprocess(final_text)
    vector_input = vectorizer.transform([processed])
    prediction = model.predict(vector_input)[0]
    probability = model.predict_proba(vector_input)[0]
    authenticity_score = round(max(probability) * 100, 2)
    source_credibility = get_source_credibility(news_url)

    result = 'REAL NEWS' if prediction == 1 else 'FAKE NEWS'

    # Save to Database
    conn = sqlite3.connect('history.db')
    c = conn.cursor()
    c.execute("INSERT INTO history (title, prediction, score, source_credibility, timestamp) VALUES (?, ?, ?, ?, ?)",
              (title, result, authenticity_score, source_credibility, datetime.datetime.now()))
    conn.commit()
    conn.close()

    response_data = {
        'prediction': result,
        'score': authenticity_score,
        'source_credibility': source_credibility,
        'news_snippet': final_text[:500] + "..." if len(final_text) > 500 else final_text
    }

    if request.is_json:
        return jsonify(response_data)

    return render_template('index.html', prediction_text=result, score=authenticity_score, 
                           news=news_text if not news_url else response_data['news_snippet'], url=news_url)

@app.route('/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect('history.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM history ORDER BY timestamp DESC LIMIT 50")
    rows = c.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        history.append({
            'id': f"#TX-{row['id'] + 1000}",
            'title': row['title'],
            'prediction': row['prediction'],
            'score': row['score'],
            'source_credibility': row['source_credibility'],
            'timestamp': row['timestamp']
        })
    return jsonify(history)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
