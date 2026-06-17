
import React, { useState, useEffect, useMemo } from 'react';
import { HistoryItem, GameStatus } from '../../types';
import { updateSignalLogStatus } from '../../services/supabaseService';
import { formatTerminalDate } from '../../App';
import { 
  Database, 
  Trash2, 
  Maximize2, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Clock,
  Skull,
  Trophy,
  AlertCircle
} from 'lucide-react';

interface Props {
  historyItems: HistoryItem[];
  onUpdateHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  onDeleteLog?: (id: string) => void;
}

const HistoryView: React.FC<Props> = ({ historyItems, onUpdateHistory, onDeleteLog }) => {
  const [selectedLog, setSelectedLog] = useState<HistoryItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      onUpdateHistory(current => {
        let hasChanges = false;
        const updated = (current || []).map(item => {
          if (item.status === 'UPCOMING' && Math.random() < 0.1) {
             hasChanges = true;
             const newItem = { 
               ...item, 
               status: 'PENDING' as GameStatus,
               slips: (item.slips || []).map(s => ({ ...s, status: 'PENDING' as GameStatus }))
             };
             updateSignalLogStatus(newItem.id, newItem.status, newItem.slips);
             return newItem;
          }
          if (item.status === 'PENDING') {
            const newSlips = (item.slips || []).map(slip => {
              if (slip.status === 'PENDING' && Math.random() < 0.15) {
                hasChanges = true;
                return { ...slip, status: (Math.random() > 0.4 ? 'WIN' : 'LOSS') as GameStatus };
              }
              return slip;
            });

            if (hasChanges) {
              const allResolved = newSlips.every(s => s.status === 'WIN' || s.status === 'LOSS');
              const hasLoss = newSlips.some(s => s.status === 'LOSS');
              const finalStatus = (allResolved ? (hasLoss ? 'LOSS' : 'WIN') : 'PENDING') as GameStatus;
              
              const newItem = {
                ...item,
                slips: newSlips,
                status: finalStatus
              };
              updateSignalLogStatus(newItem.id, newItem.status, newItem.slips);
              return newItem;
            }
          }
          return item;
        });

        if (hasChanges) {
          setIsSyncing(true);
          setTimeout(() => setIsSyncing(false), 2000);
          return updated;
        }
        return current;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [onUpdateHistory]);

  const getStatusBadge = (status: GameStatus) => {
    switch(status) {
      case 'WIN': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
            <Trophy className="w-3 h-3 text-emerald-400" /> Win
          </span>
        );
      case 'LOSS': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-505 bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-widest">
            <Skull className="w-3 h-3 text-rose-400" /> Loss
          </span>
        );
      case 'PENDING': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest animate-pulse">
            <RefreshCw className="w-3 h-3 text-cyan-400" /> Scanning
          </span>
        );
      case 'UPCOMING': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
            <Clock className="w-3 h-3 text-amber-400" /> Pending
          </span>
        );
      default: return null;
    }
  };

  const winRate = useMemo(() => {
    if (!historyItems) return 0;
    const resolvedItems = historyItems.filter(h => h.status === 'WIN' || h.status === 'LOSS');
    if (resolvedItems.length === 0) return 0;
    const wins = resolvedItems.filter(h => h.status === 'WIN').length;
    return (wins / resolvedItems.length) * 100;
  }, [historyItems]);

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-500 pb-24 px-1 sm:px-0">
      {/* HEADER STATISTICS BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 border-b border-slate-900 pb-6">
        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Neural Archive Records</h2>
          <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px]">
            <span className="text-slate-500 uppercase tracking-wider font-semibold">Post-Match Statistical Core Registry</span>
            {isSyncing && (
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold uppercase tracking-widest uppercase text-[9px]">Syncing Database</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none border border-slate-800 bg-slate-950/60 px-5 py-3 rounded-lg flex flex-col items-start gap-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-black uppercase tracking-wider">Session Alpha WinRate</span>
            <span className={`text-xl font-bold tracking-tight ${winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{winRate.toFixed(1)}%</span>
          </div>
          <div className="flex-1 sm:flex-none border border-slate-800 bg-slate-950/60 px-5 py-3 rounded-lg flex flex-col items-start gap-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-black uppercase tracking-wider font-semibold">Active Slips</span>
            <span className="text-xl font-bold tracking-tight text-cyan-400">{(historyItems || []).length} Keys</span>
          </div>
        </div>
      </div>

      {/* REPOSITORY GRID */}
      <div className="grid grid-cols-1 gap-6">
        {(!historyItems || historyItems.length === 0) ? (
          <div className="py-20 text-center border border-dashed border-slate-900 rounded-xl bg-slate-95c bg-slate-950/20">
            <Database className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <h4 className="text-base font-bold text-slate-400">No Historical Records Found</h4>
            <p className="text-xs text-slate-500 font-mono mt-1.5 max-w-xs mx-auto leading-relaxed">
              Synthesize and commit a tactical parlay ticket inside the builder to initialize your system archives.
            </p>
          </div>
        ) : (
          historyItems.map((item) => (
            <div key={item.id} className="border border-slate-900 bg-slate-950/40 p-5 sm:p-6 rounded-xl hover:bg-slate-950/60 hover:border-slate-800 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
              
              <div className="flex flex-col lg:flex-row gap-6 relative z-10 justify-between items-stretch">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(item.status)}
                      <h4 className="text-lg font-bold text-slate-100 tracking-tight">{item.title}</h4>
                    </div>
                    {onDeleteLog && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteLog(item.id); }}
                        className="p-1.5 rounded-lg border border-slate-900 bg-slate-950 text-slate-500 hover:text-rose-400 hover:border-rose-400/20 hover:bg-rose-500/5 transition-all text-xs"
                        title="Delete Signal Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-mono italic max-w-3xl">
                     &gt; {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    {item.slips?.map((slip, idx) => (
                      <div key={idx} className="border border-slate-900 bg-slate-950 p-3.5 rounded-lg flex flex-col gap-2 min-w-[200px] flex-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold tracking-tight truncate max-w-[150px]">{slip.matchTitle}</span>
                          <span className={`h-2 w-2 rounded-full ${
                            slip.status === 'WIN' ? 'bg-emerald-500 animate-pulse' : 
                            slip.status === 'LOSS' ? 'bg-rose-500' : 
                            'bg-slate-600'
                          }`} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {slip.selections?.map((sel, sidx) => (
                            <span key={sidx} className="text-[10px] font-bold text-cyan-400 uppercase font-mono">
                              {sel.label} <span className="text-[8px] opacity-60 ml-0.5">{(sel.prob * 100).toFixed(0)}%</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:w-60 flex flex-col sm:flex-row lg:flex-col justify-between items-center lg:items-end lg:border-l border-slate-900 lg:pl-6 shrink-0 gap-4 sm:gap-0 mt-4 lg:mt-0 pt-4 lg:pt-0">
                  <div className="text-center lg:text-right space-y-1">
                    <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest">Profile Index</p>
                    <p className={`text-xs font-bold font-mono tracking-wide ${
                      item.riskRating === 'AGGRESSIVE' ? 'text-amber-400' : 
                      item.riskRating === 'EXTREME' ? 'text-fuchsia-400' :
                      item.riskRating === 'BALANCED' ? 'text-cyan-400' : 'text-emerald-400'
                    }`}>{item.riskRating}</p>
                  </div>
                  <div className="text-center lg:text-right space-y-1">
                    <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest">Expected Multiplier</p>
                    <p className="text-2xl font-black text-rose-100 italic leading-none">{item.payoutMultiplier ? `${item.payoutMultiplier}x` : '1.00x'}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedLog(item)}
                    className="w-full text-xs font-bold text-slate-350 hover:text-white border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg bg-slate-900/50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    Neural Breakdown
                  </button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* DIALOG BREAKDOWN MATRIX */}
      {selectedLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setSelectedLog(null)} />
           <div className="relative border border-slate-800 bg-slate-950 w-full max-w-5xl rounded-xl shadow-2xl flex flex-col h-[80vh] max-h-[680px] overflow-hidden animate-in zoom-in-95 duration-300">
              
              <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                 {/* Left Sidebar Info Card */}
                 <aside className="lg:w-80 bg-slate-950 border-r border-slate-900 p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 text-cyan-400">
                          <Layers className="w-4 h-4" />
                          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest">Telemetry Log Core</span>
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-slate-100 tracking-tight">Audit Checklist</h3>
                          <div className="inline-block px-2 py-0.5 mt-2 bg-slate-900 rounded border border-slate-850 text-[10px] font-mono text-slate-400 truncate max-w-full">
                             ID: {selectedLog.id}
                          </div>
                       </div>

                       <div className="space-y-4 pt-4 border-t border-slate-900">
                          <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Strategic Sources</p>
                          <div className="space-y-2">
                             {selectedLog.groundingSources?.map((source, i) => (
                                <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="block p-3 rounded-lg border border-slate-900 bg-slate-950 hover:bg-slate-900 hover:border-slate-800 transition-colors">
                                   <p className="text-xs font-bold text-slate-200 truncate">{source.title}</p>
                                   <p className="text-[9px] font-mono text-slate-500 mt-1 truncate flex items-center gap-1">Link <ExternalLink className="w-2.5 h-2.5" /></p>
                                </a>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-900 space-y-4">
                       <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                             <span>Confidence Margin</span>
                             <span className="font-bold text-slate-300">{(selectedLog.totalProb * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                             <div className="h-full bg-cyan-500" style={{ width: `${selectedLog.totalProb * 100}%` }} />
                          </div>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-slate-500">
                          <span>Archive Date</span>
                          <span>{formatTerminalDate(selectedLog.timestamp)}</span>
                       </div>
                    </div>
                 </aside>

                 {/* Main Analysis Screen */}
                 <div className="flex-1 flex flex-col min-w-0 bg-slate-950/90">
                    <header className="p-6 border-b border-slate-900 flex items-center justify-between shrink-0">
                       <div className="flex items-center gap-4">
                          {getStatusBadge(selectedLog.status)}
                          <h2 className="text-xl font-bold text-white tracking-tight truncate max-w-md">{selectedLog.title}</h2>
                       </div>
                       <button 
                         onClick={() => setSelectedLog(null)} 
                         className="h-8 w-8 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" d="M6 18L18 6M6 6l12 12"/></svg>
                       </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                       <div className="p-5 bg-slate-900/30 rounded-lg border border-slate-900 relative">
                          <p className="text-sm text-slate-200 leading-relaxed font-mono italic">
                             <span className="text-cyan-400 mr-2 font-bold font-mono">&gt;</span>
                             {selectedLog.description}
                          </p>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Nodal Detail Analysis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {selectedLog.slips?.map((slip, i) => (
                                <div key={i} className="bg-slate-950 border border-slate-900 rounded-lg p-5 space-y-4">
                                   <div className="flex justify-between items-start">
                                      <p className="text-sm font-bold text-slate-100 truncate max-w-[200px]">{slip.matchTitle}</p>
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                                         slip.status === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                      }`}>{slip.status}</span>
                                   </div>
                                   
                                   <div className="space-y-2 border-y border-slate-900/50 py-2.5">
                                      {slip.selections?.map((sel, idx) => (
                                         <div key={idx} className="flex justify-between items-center text-xs">
                                            <span className="text-cyan-400 font-mono font-bold">{sel.label}</span>
                                            <span className="text-slate-500 font-mono">{(sel.prob * 100).toFixed(0)}%</span>
                                         </div>
                                      ))}
                                   </div>

                                   <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                                      <span>Model Confidence</span>
                                      <span className="text-slate-200">{(slip.combinedProb * 100).toFixed(1)}%</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <footer className="p-4 border-t border-slate-900 bg-slate-950/60 flex items-center justify-between">
                       <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SECURED INTEGRITY SEAL
                       </span>
                       <button 
                         onClick={() => setSelectedLog(null)} 
                         className="px-5 py-2 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all"
                       >
                         Close Audit Panel
                       </button>
                    </footer>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;

