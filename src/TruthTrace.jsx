import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Search, 
  Link as LinkIcon, 
  FileText, 
  History as HistoryIcon, 
  Info, 
  Cpu, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Globe,
  Database
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Components
const Navbar = ({ activeView, setActiveView }) => {
  return (
    <nav className="flex justify-between items-center px-[10%] py-6 sticky top-0 z-50 bg-brand-dark/80 backdrop-blur-md border-b border-slate-800">
      <div 
        className="group flex items-center gap-3 cursor-pointer select-none"
        onClick={() => setActiveView('home')}
      >
        <div className="relative w-10 h-10 border border-brand-teal/30 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-brand-teal group-hover:scale-110">
          <div className="absolute inset-0 bg-brand-teal/5 group-hover:bg-brand-teal/10 transition-colors" />
          <div className="relative transition-transform duration-700 group-hover:rotate-180">
             <Eye className="w-6 h-6 text-brand-teal/60 group-hover:text-brand-teal transition-colors" />
             <div className="absolute -inset-1 border border-dashed border-brand-teal/20 rounded-full animate-spin-slow opacity-0 group-hover:opacity-100" />
          </div>
        </div>
        <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-teal transition-colors">
          TRUTH <span className="text-brand-teal group-hover:text-white">TRACE</span>
        </span>
      </div>

      <div className="flex gap-8">
        {[
          { id: 'home', label: 'Home', icon: Search },
          { id: 'about', label: 'About', icon: Info },
          { id: 'history', label: 'History', icon: HistoryIcon }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] transition-all duration-300 hover:text-brand-teal",
              activeView === item.id ? "text-brand-teal" : "text-brand-muted"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

const HomePage = ({ onSearchSuccess }) => {
  const [tab, setTab] = useState('url');
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [tab]: inputValue
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze content');
      }

      setResult(data);
      onSearchSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-[10px] font-bold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
          </span>
          ✨ NoCap Engine v2.1
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tighter">
          Verify the Truth in Milliseconds
        </h1>
        <p className="text-brand-muted text-lg max-w-2xl mx-auto leading-relaxed">
          Our advanced neural networks dissect news patterns to distinguish between factual reporting and deceptive misinformation with surgical precision.
        </p>
      </div>

      <div className="bg-brand-card/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group mb-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal/50 to-transparent opacity-30" />
        
        <div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-slate-800/50">
          <button 
            type="button"
            onClick={() => { setTab('url'); setInputValue(''); setResult(null); setError(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300",
              tab === 'url' ? "bg-brand-teal text-brand-dark shadow-lg shadow-brand-teal/20" : "text-brand-muted hover:text-white"
            )}
          >
            <LinkIcon className="w-4 h-4" />
            Analyze URL
          </button>
          <button 
            type="button"
            onClick={() => { setTab('text'); setInputValue(''); setResult(null); setError(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300",
              tab === 'text' ? "bg-brand-teal text-brand-dark shadow-lg shadow-brand-teal/20" : "text-brand-muted hover:text-white"
            )}
          >
            <FileText className="w-4 h-4" />
            Paste Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {tab === 'url' ? (
            <input 
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://www.news-source.com/article-path"
              className="w-full bg-black/40 border border-slate-800 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-teal/50 focus:ring-4 focus:ring-brand-teal/5 transition-all"
              required
            />
          ) : (
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste the full news article text here for deep-trace analysis..."
              className="w-full h-48 bg-black/40 border border-slate-800 rounded-2xl p-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-teal/50 focus:ring-4 focus:ring-brand-teal/5 transition-all resize-none"
              required
            />
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-semibold animate-pulse">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isAnalyzing}
            className={cn(
              "w-full py-4 bg-brand-teal text-brand-dark font-black text-lg rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-teal/20 group",
              isAnalyzing ? "opacity-50 cursor-wait" : "hover:bg-[#1de4cc] hover:scale-[1.01] active:scale-[0.99]"
            )}
          >
            {isAnalyzing ? "ANALYZING TRACE..." : "FETCH & ANALYZE"}
            <Zap className={cn("w-5 h-5 fill-current", isAnalyzing ? "animate-bounce" : "group-hover:animate-pulse")} />
          </button>
        </form>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className={cn(
            "bg-brand-card/70 backdrop-blur-xl border-t-4 rounded-3xl p-10 shadow-2xl relative overflow-hidden",
            result.prediction === 'REAL NEWS' ? "border-emerald-500" : "border-rose-500"
          )}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[3px] text-brand-muted mb-2 block">
                  TRACE ANALYSIS RESULT
                </span>
                <h2 className={cn(
                  "text-4xl font-black tracking-tighter",
                  result.prediction === 'REAL NEWS' ? "text-emerald-400" : "text-rose-400"
                )}>
                  {result.prediction}
                </h2>
              </div>
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg",
                result.prediction === 'REAL NEWS' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500"
              )}>
                {result.prediction === 'REAL NEWS' ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">NoCap Engine Score</span>
                    <span className={cn(
                        "text-xl font-black",
                        result.prediction === 'REAL NEWS' ? "text-emerald-400" : "text-rose-400"
                    )}>{result.score}%</span>
                    </div>
                    <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-slate-800">
                    <div 
                        className={cn(
                        "h-full transition-all duration-1000 ease-out shadow-[0_0_15px_currentColor]",
                        result.prediction === 'REAL NEWS' ? "bg-emerald-500 text-emerald-500" : "bg-rose-500 text-rose-500"
                        )}
                        style={{ width: `${result.score}%` }}
                    />
                    </div>
                </div>

                <div className="bg-black/20 p-4 rounded-xl border border-slate-800/50 flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border",
                        result.source_credibility.includes("HIGH") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
                        result.source_credibility.includes("LOW") ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}>
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest block mb-0.5">Source Credibility</span>
                        <span className="text-sm font-bold text-white">{result.source_credibility}</span>
                    </div>
                </div>
              </div>

              <div className="p-6 bg-black/40 border border-slate-800 rounded-2xl">
                <h4 className="text-xs font-black text-brand-teal uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Database className="w-3 h-3" />
                    Extracted Signal Snippet
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  "{result.news_snippet}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AboutPage = () => {
  const cards = [
    {
      title: 'NoCap Engine',
      desc: 'A multi-signal NLP model trained on millions of articles to detect deceptive writing patterns and unverified claims.',
      icon: Cpu, 
    },
    {
      title: 'Source Credibility',
      desc: 'Cross-references publishers against a continuously updated registry of trusted and flagged domains.',
      icon: ShieldCheck,
    },
    {
      title: 'Real-Time Analysis',
      desc: 'Results in under two seconds — paste a URL or text and get a clear authenticity score.',
      icon: Zap,
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-20 px-6 animate-in fade-in zoom-in-95 duration-700">
      <div className="max-w-3xl mb-16">
        <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">
          About TRUTH TRACE
        </h1>
        <p className="text-[#94A3B8] text-lg leading-relaxed">
          TRUTH TRACE is an AI-powered fact verification tool built to combat misinformation. 
          Our NoCap Engine (v2.1) is meticulously trained on the <span className="text-brand-teal font-bold">fakenewsdataset.csv</span> corpus, 
          combining language analysis, source credibility scoring, and 
          explainable AI to help readers understand <em className="italic text-white">why</em> a piece 
          of content might be misleading.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <div 
            key={i} 
            className="bg-[#0c1220] border border-slate-800/80 p-8 rounded-2xl hover:border-brand-teal/40 transition-colors group"
          >
            <div className="mb-6">
              <card.icon className="w-8 h-8 text-brand-teal" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">
              {card.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const HistoryPage = ({ records, isLoading }) => {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-6 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Scan Tracking Records</h2>
          <p className="text-brand-muted text-sm">Real-time log of recent content authenticity traces.</p>
        </div>
        <div className="text-brand-teal text-xs font-bold bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal/20">
          {records.length} TOTAL TRACES
        </div>
      </div>
      
      <div className="bg-brand-card/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="divide-y divide-slate-800">
          {isLoading ? (
            <div className="p-20 text-center animate-pulse">
                <Search className="w-12 h-12 text-brand-teal mx-auto mb-4 animate-bounce" />
                <p className="text-brand-muted">Fetching persistent history records...</p>
            </div>
          ) : records.length > 0 ? records.map((record, i) => (
            <div key={i} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4 max-w-[60%]">
                <div className={cn(
                  "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] shrink-0",
                  record.prediction === 'REAL NEWS' ? 'text-emerald-500' : 'text-rose-500'
                )} />
                <div className="truncate">
                  <h4 className="text-white font-bold mb-1 group-hover:text-brand-teal transition-colors truncate">
                    {record.title}
                  </h4>
                  <span className="text-[10px] text-brand-muted uppercase font-bold tracking-widest">
                    Trace ID: {record.id} • {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border whitespace-nowrap",
                    record.prediction === 'REAL NEWS' ? colors.emerald : colors.rose
                  )}>
                    {record.prediction}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 tracking-tighter">
                    SCORE: {record.score}% • {record.source_credibility.split(' ')[0]}
                  </span>
                </div>
                <button className="text-slate-600 hover:text-white transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center">
              <HistoryIcon className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-brand-muted font-semibold">No trace records found. Start an analysis to see data here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TruthTrace() {
  const [activeView, setActiveView] = useState('home');
  const [records, setRecords] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('http://localhost:5000/history');
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark selection:bg-brand-teal/30 selection:text-brand-teal">
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="pb-20">
        {activeView === 'home' && <HomePage onSearchSuccess={fetchHistory} />}
        {activeView === 'about' && <AboutPage />}
        {activeView === 'history' && <HistoryPage records={records} isLoading={isLoadingHistory} />}
      </main>

      <footer className="fixed bottom-0 w-full py-4 bg-brand-dark/80 backdrop-blur-md border-t border-slate-800/50 text-center">
        <p className="text-[10px] text-brand-muted font-bold tracking-[4px] uppercase">
          TRUTH TRACE — Powered by the <span className="text-brand-teal">NoCap Engine</span>
        </p>
      </footer>
    </div>
  );
}
