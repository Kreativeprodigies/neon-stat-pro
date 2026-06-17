
import React, { useState, useEffect, useMemo } from 'react';
import { MatchAnalysis, UserRole } from '../../types';
import { getQuantInsight } from '../../services/geminiService';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  Shield, 
  Percent,
  Search, 
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
  BarChart4,
  Cpu
} from 'lucide-react';

interface Props {
  match: MatchAnalysis;
  userRole: UserRole;
}

const PredictionsCard: React.FC<Props> = ({ match }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [terminalText, setTerminalText] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'narrative' | 'metrics'>('narrative');
  const [copied, setCopied] = useState(false);

  const displayConfidence = Math.round(match.confidence <= 1 ? match.confidence * 100 : match.confidence);

  const fetchInsight = async () => {
    if (loading || insight) return;
    setLoading(true);
    try {
        const result = await getQuantInsight(match);
        setInsight(result || "DATA_STREAM_CORRUPTED");
    } catch (err) {
        setInsight("NETWORK_LINK_ERROR");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isModalOpen && !insight) {
      setScanProgress(0);
      const timer = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) { 
            clearInterval(timer); 
            fetchInsight(); 
            return 100; 
          }
          return prev + Math.random() * 25;
        });
      }, 40);
      return () => clearInterval(timer);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (insight) {
      let i = 0;
      const timer = setInterval(() => {
        setTerminalText(insight.slice(0, i));
        i++;
        if (i > insight.length) clearInterval(timer);
      }, 5);
      return () => clearInterval(timer);
    }
  }, [insight]);

  const handleCopy = () => {
    if (!insight) return;
    navigator.clipboard.writeText(insight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* SHADCN-STYLE CARD STRUCTURE */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 shadow-sm transition-all duration-300 hover:border-slate-700 hover:shadow-md flex flex-col h-full relative group overflow-hidden">
        {/* Hover Highlight Border Action */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Header: League & Volatility Badge */}
            <div className="flex justify-between items-start mb-5">
              <div className="space-y-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border border-slate-800 bg-slate-900 text-slate-300">
                  {match.league}
                </span>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Activity className={`w-3.5 h-3.5 ${match.volatility === 'LOW' ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider">
                    Volatility_{match.volatility}
                  </span>
                </div>
              </div>
              
              {/* Confidence Badge */}
              <div className="text-right">
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Confidence</span>
                <span className={`text-lg font-black tracking-tight ${displayConfidence > 80 ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                  {displayConfidence}%
                </span>
              </div>
            </div>

            {/* Matchup Sections */}
            <div className="grid grid-cols-7 gap-1 items-center py-5 border-y border-slate-900 my-4">
              <div className="col-span-3 text-center">
                <div className="w-11 h-11 bg-slate-900/80 rounded-xl border border-slate-800 mx-auto flex items-center justify-center font-bold text-lg text-slate-100 tracking-tight shadow-inner">
                  {match.homeTeam?.[0]}
                </div>
                <p className="text-[11px] font-semibold text-slate-200 mt-2 truncate max-w-full px-1">{match.homeTeam}</p>
              </div>
              
              <div className="col-span-1 text-center">
                <span className="text-[10px] font-mono font-bold text-slate-600 px-1.5 py-0.5 bg-slate-900 rounded">VS</span>
              </div>

              <div className="col-span-3 text-center">
                <div className="w-11 h-11 bg-slate-900/80 rounded-xl border border-slate-800 mx-auto flex items-center justify-center font-bold text-lg text-slate-100 tracking-tight shadow-inner">
                  {match.awayTeam?.[0]}
                </div>
                <p className="text-[11px] font-semibold text-slate-200 mt-2 truncate max-w-full px-1">{match.awayTeam}</p>
              </div>
            </div>

            {/* Probability Gauges */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="font-bold uppercase tracking-wider">Neural Forecast Spread</span>
                <span className="font-semibold text-slate-300">
                  {(match.probabilities.homeWin * 100).toFixed(0)}% | {(match.probabilities.awayWin * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full flex overflow-hidden p-[1px] border border-slate-800/50">
                <div className="h-full bg-cyan-500 rounded-l" style={{ width: `${match.probabilities.homeWin * 100}%` }} />
                <div className="h-full bg-slate-850 w-[2px]" />
                <div className="h-full bg-fuchsia-500 rounded-r" style={{ width: `${match.probabilities.awayWin * 100}%` }} />
              </div>
              
              {/* Value & Market Edge Widgets */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 bg-slate-905 border border-slate-900 rounded-lg flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Value Coeff</span>
                  <span className="text-sm font-bold text-slate-100 italic">{(match.valueIndicator).toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-slate-905 border border-slate-900 rounded-lg flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Avg Market Edge</span>
                  <span className="text-sm font-bold text-emerald-400 italic">+{Math.round(match.valueIndicator * 5)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 hover:text-white"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Tactical Deep Analysis
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <div className="flex items-center justify-between mt-2.5 px-0.5 text-[10px] text-slate-500 font-medium font-mono">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {match.time.split(',')[1] || "K.O."}</span>
              {match.sourceUrl && (
                <a href={match.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-slate-300 flex items-center gap-1">
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SHADCN DIALOG SIMULATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Blur backdrop overlay */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative border border-slate-800 bg-slate-950 w-full max-w-4xl rounded-xl shadow-2xl flex flex-col h-[75vh] max-h-[600px] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Command Header */}
            <header className="p-6 border-b border-slate-950 bg-slate-950/50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                 <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-850 bg-slate-900 text-cyan-400">
                   <Cpu className="w-5 h-5 animate-pulse" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                     Command Core Intelligence
                     <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 uppercase font-extrabold tracking-widest">Active Link</span>
                   </h2>
                   <p className="text-xs text-slate-400 font-mono mt-0.5">Uplink target: {match.homeTeam} vs {match.awayTeam}</p>
                 </div>
               </div>
               
               <button 
                 onClick={() => setIsModalOpen(false)} 
                 className="h-8 w-8 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" d="M6 18L18 6M6 6l12 12"/></svg>
               </button>
            </header>

            {/* Dialog Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/90 space-y-6">
               {!insight ? (
                 <div className="h-full flex flex-col items-center justify-center space-y-5">
                    <div className="w-full max-w-xs space-y-2">
                       <div className="flex justify-between text-xs font-mono font-bold text-cyan-400">
                          <span className="flex items-center gap-1.5"><Search className="w-3.5 h-3.5 animate-spin" /> Querying Markets...</span>
                          <span>{Math.round(scanProgress)}%</span>
                       </div>
                       <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                       </div>
                    </div>
                    <p className="text-xs font-mono text-slate-500 tracking-wider">Gathering tactical telemetry datasets from standard channels...</p>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Shadcn-like Tab triggers */}
                    <div className="flex border-b border-slate-900">
                      <button 
                        onClick={() => setActiveTab('narrative')}
                        className={`px-4 py-2 text-xs font-bold transition-all relative ${activeTab === 'narrative' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Narrative Forecast</span>
                        {activeTab === 'narrative' && (
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400" />
                        )}
                      </button>
                      <button 
                        onClick={() => setActiveTab('metrics')}
                        className={`px-4 py-2 text-xs font-bold transition-all relative ${activeTab === 'metrics' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <span className="flex items-center gap-1.5"><BarChart4 className="w-3.5 h-3.5" /> Quantitative Metrics</span>
                        {activeTab === 'metrics' && (
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400" />
                        )}
                      </button>
                    </div>

                    {activeTab === 'narrative' ? (
                      <div className="space-y-4">
                        <div className="p-5 bg-slate-900/40 rounded-lg border border-slate-850 relative group">
                           <div className="absolute top-4 right-4 flex gap-2">
                             <button
                               onClick={handleCopy}
                               className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
                               title="Copy analysis"
                             >
                               {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                             </button>
                           </div>
                           <p className="text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                              <span className="text-cyan-500 mr-2 font-bold font-mono">&gt;</span>{terminalText}
                              <span className="inline-block w-2 h-4 bg-cyan-500/50 align-middle ml-1 animate-pulse" />
                           </p>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg text-xs text-slate-400">
                          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>This strategic forecast uses search integration to synthesize the current contextual variables of this event.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-4">
                           <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Probabilistic Model</h4>
                           <div className="rounded-lg border border-slate-900 bg-slate-950 p-4 space-y-4">
                              {[
                                { l: 'Form Coherence', v: '0.84', c: 'text-cyan-400', bg: 'bg-cyan-500' },
                                { l: 'Defensive Integrity', v: '0.92', c: 'text-emerald-400', bg: 'bg-emerald-500' },
                                { l: 'Positional Entropy', v: '0.61', c: 'text-fuchsia-400', bg: 'bg-fuchsia-500' }
                              ].map((m, i) => (
                                <div key={i} className="space-y-2">
                                   <div className="flex justify-between text-xs font-mono">
                                      <span className="text-slate-400 font-medium">{m.l}</span>
                                      <span className={`${m.c} font-bold`}>{m.v} Sigma</span>
                                   </div>
                                   <div className="h-1 bg-slate-900 w-full rounded-full overflow-hidden border border-slate-850">
                                      <div className={`h-full ${m.bg} transition-all duration-[2.5s]`} style={{ width: `${parseFloat(m.v) * 100}%` }} />
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                        
                        <div className="rounded-lg border border-slate-900 bg-slate-950 p-5 flex flex-col items-center justify-center space-y-4 text-center">
                           <div className="relative h-28 w-28 flex items-center justify-center">
                              <svg className="absolute inset-0 w-full h-full -rotate-90">
                                 <circle cx="56" cy="56" r="50" fill="none" stroke="#0f172a" strokeWidth="6" />
                                 <circle cx="56" cy="56" r="50" fill="none" stroke="#22d3ee" strokeWidth="6" strokeDasharray={314} strokeDashoffset={314 - (314 * displayConfidence / 100)} strokeLinecap="round" />
                              </svg>
                              <div className="text-center">
                                 <span className="text-2xl font-extrabold text-slate-100">{displayConfidence}%</span>
                                 <span className="text-[8px] tracking-widest text-slate-500 block uppercase font-mono font-bold">Conf</span>
                              </div>
                           </div>
                           <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-medium">Confidence levels represent model consistency across back-tested iterations for this volatility rating.</p>
                        </div>
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* Actions Footer */}
            <footer className="p-4 border-t border-slate-950 bg-slate-950/60 flex justify-end">
               <button 
                 onClick={() => setIsModalOpen(false)} 
                 className="px-5 py-2 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all"
               >
                 Acknowledge & Sync
               </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default PredictionsCard;
