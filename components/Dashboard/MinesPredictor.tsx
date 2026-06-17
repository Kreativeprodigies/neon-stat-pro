import React, { useState, useEffect } from 'react';
import { fetchMinesIntelligence } from '../../services/geminiService';
import { MinesFeed } from '../../types';
import { 
  Grid, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  ExternalLink,
  Sliders,
  ChevronRight,
  Info,
  Lock,
  Zap,
  Gauge
} from 'lucide-react';

const MinesPredictor: React.FC = () => {
  const [mineCount, setMineCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState<MinesFeed | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);

  const runNeuralScan = async () => {
    setAnalyzing(true);
    setLoading(true);
    try {
      for(let i=0; i<5; i++) {
        setScanningIndex(Math.floor(Math.random() * 25));
        await new Promise(r => setTimeout(r, 200));
      }
      const data = await fetchMinesIntelligence(mineCount);
      setFeed(data);
    } catch (err) {
      console.error("Mines scan failed", err);
    } finally {
      setLoading(false);
      setAnalyzing(false);
      setScanningIndex(null);
    }
  };

  useEffect(() => {
    runNeuralScan();
  }, []);

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'SAFE': return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]';
      case 'RISKY': return 'bg-amber-500/5 border-amber-500/20 text-amber-500/60';
      case 'CRITICAL': return 'bg-rose-500/5 border-rose-500/20 text-rose-500/60';
      default: return 'bg-slate-950 border-slate-900 text-slate-800';
    }
  };

  const safeNodesCount = (feed?.nodes || []).filter(n => n.status === 'SAFE').length || 0;
  const sessionConfidence = Math.round((safeNodesCount / 25) * 100);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Upper Grid Layout Screen */}
      <div className="border border-slate-900 bg-slate-950/40 p-6 sm:p-8 rounded-xl relative overflow-hidden">
        
        {/* Main Control Panel Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-6 mb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <Grid className="w-3.5 h-3.5" /> Silicon Probing Engine
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white pt-1">Grid Pattern Decryption</h3>
            <p className="text-xs text-slate-500 font-mono">Neural spatial modeling for high-accuracy mines mapping algorithms</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto self-stretch md:self-auto font-mono">
            <div className="space-y-1 flex-1 md:flex-none">
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Mine Set Weight</label>
              <select 
                value={mineCount}
                onChange={(e) => setMineCount(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-xs font-bold text-cyan-400 outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                {[1, 3, 5, 7, 10, 15, 20].map(c => <option key={c} value={c}>{c} Mines</option>)}
              </select>
            </div>
            <button 
              onClick={runNeuralScan}
              disabled={analyzing}
              className="flex-1 md:flex-none h-10 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Scanning...' : 'Trigger Scan'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Grid Box */}
          <div className="lg:col-span-7 flex items-center justify-center border border-slate-900/60 bg-slate-950/20 p-6 rounded-xl">
            <div className="grid grid-cols-5 gap-3 w-full max-w-[360px]">
              {Array.from({ length: 25 }).map((_, i) => {
                const node = (feed?.nodes || []).find(n => n.index === i);
                const isRecommended = (feed?.recommendedPath || []).includes(i);
                const isScanning = scanningIndex === i;

                return (
                  <div 
                    key={i}
                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-300 relative group overflow-hidden ${
                      isScanning ? 'border-cyan-400 bg-cyan-500/10 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.2)]' :
                      node ? getNodeColor(node.status) : 'bg-slate-950 border-slate-900 text-slate-800'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none" />
                    )}
                    <span className="text-[9px] font-mono text-slate-600 font-extrabold mb-0.5">{i}</span>
                    {node && node.status === 'SAFE' && (
                       <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    )}
                    {isRecommended && (
                      <div className="absolute top-1 right-1">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Metrics Panel */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-lg space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Gauge className="w-4 h-4 text-cyan-400" /> Coherence Metrics
              </h4>
              <div className="space-y-3 font-mono text-xs">
                 <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-500 uppercase">Probing Confidence</span>
                    <span className="text-slate-200">{sessionConfidence}% Accuracy</span>
                 </div>
                 <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${sessionConfidence}%` }} />
                 </div>
                 
                 <div className="pt-3 space-y-2">
                   <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Coherent Recommended Path</p>
                   <div className="flex flex-wrap gap-2">
                     {feed?.recommendedPath?.map(idx => (
                       <div key={idx} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 font-bold font-mono text-[10px]">
                         CELL #{idx}
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
            </div>

            <div className="p-5 bg-cyan-500/5 border border-cyan-500/10 rounded-lg space-y-3">
               <div className="flex items-center gap-2 text-cyan-400 font-mono">
                  <Lock className="w-4 h-4" />
                  <h5 className="text-[10px] font-bold uppercase tracking-wider">Volatility Compliance</h5>
               </div>
               <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                 Grid status: <span className="text-cyan-400 font-bold">{feed?.sessionVolatility || 'ACQUIRING'}</span>. The Neural engine identifies regional stability matrices based on mock session seed states. Results represent static probability weights. Node boundaries can shift during active round inputs. Use dynamic stops.
               </p>
            </div>
            
            {feed && feed.groundingSources && feed.groundingSources.length > 0 && (
              <div className="p-4 border border-slate-900 bg-slate-950/30 rounded-lg space-y-2 overflow-hidden">
                <p className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">Grounding Nodes</p>
                <div className="space-y-1.5">
                  {feed.groundingSources?.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-cyan-400 truncate">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate underline font-bold leading-none">{s.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MinesPredictor;
