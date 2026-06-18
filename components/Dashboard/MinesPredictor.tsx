import React, { useState, useEffect } from 'react';
import { fetchMinesIntelligence } from '../../services/geminiService';
import { MinesFeed } from '../../types';
import { 
  Grid, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
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
        await new Promise(r => setTimeout(r, 120));
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
      case 'SAFE': return 'bg-white text-zinc-950 border-white shadow-sm font-medium';
      case 'RISKY': return 'bg-zinc-900/30 border-zinc-800 text-zinc-600';
      case 'CRITICAL': return 'bg-zinc-900/10 border-zinc-900 text-zinc-705';
      default: return 'bg-zinc-950 border-zinc-900 text-zinc-800';
    }
  };

  const safeNodesCount = (feed?.nodes || []).filter(n => n.status === 'SAFE').length || 0;
  const sessionConfidence = Math.round((safeNodesCount / 25) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upper Grid Layout Screen */}
      <div className="border border-zinc-805 bg-zinc-900/40 p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        
        {/* Main Control Panel Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-800/80 pb-6 mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-zinc-800 bg-zinc-950 text-[10px] font-mono text-zinc-400 tracking-wider">
              <Grid className="w-3.5 h-3.5" /> DECRYPTION MODULE
            </div>
            <h3 className="text-lg font-medium tracking-tight text-white pt-1">Spatial Mines Topology</h3>
            <p className="text-xs text-zinc-500 font-mono">Neural dispersion analysis maps safest regional paths with high statistical confidence.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto self-stretch md:self-auto font-mono">
            <div className="space-y-1 flex-1 md:flex-none">
              <label className="text-[9px] text-zinc-500 uppercase tracking-widest block">Mines Factor</label>
              <select 
                value={mineCount}
                onChange={(e) => setMineCount(parseInt(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-zinc-500 transition-colors cursor-pointer"
              >
                {[1, 3, 5, 7, 10, 15, 20].map(c => <option key={c} value={c}>{c} Mines</option>)}
              </select>
            </div>
            <button 
              onClick={runNeuralScan}
              disabled={analyzing}
              className="flex-1 md:flex-none h-9 px-4 mt-3 bg-white hover:bg-zinc-200 text-zinc-950 rounded text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3 h-3 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Scanning' : 'Scan Topology'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Grid Box */}
          <div className="lg:col-span-7 flex items-center justify-center border border-zinc-800/40 bg-zinc-950/40 p-8 rounded-xl">
            <div className="grid grid-cols-5 gap-2.5 w-full max-w-[340px]">
              {Array.from({ length: 25 }).map((_, i) => {
                const node = (feed?.nodes || []).find(n => n.index === i);
                const isRecommended = (feed?.recommendedPath || []).includes(i);
                const isScanning = scanningIndex === i;

                return (
                  <div 
                    key={i}
                    className={`aspect-square rounded border flex flex-col items-center justify-center transition-all duration-200 relative overflow-hidden ${
                      isScanning ? 'border-zinc-400 bg-zinc-800 scale-105' :
                      node ? getNodeColor(node.status) : 'bg-transparent border-zinc-905 text-zinc-800'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute inset-0 bg-zinc-400/5 animate-pulse pointer-events-none" />
                    )}
                    <span className="text-[9px] font-mono text-zinc-500 mb-0.5">{i}</span>
                    {node && node.status === 'SAFE' && (
                       <Zap className="w-3 h-3 text-zinc-950 stroke-[2]" />
                    )}
                    {isRecommended && (
                      <div className="absolute top-1 right-1">
                        <div className="w-1.5 h-1.5 bg-zinc-650 rounded-full animate-ping" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Metrics Panel */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="border border-zinc-800 bg-zinc-950/20 p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-zinc-400" /> Operational Accuracy
              </h4>
              <div className="space-y-3 font-mono text-xs">
                 <div className="flex justify-between items-center text-zinc-400">
                    <span className="uppercase text-[10px]">Confidence density</span>
                    <span className="text-zinc-200">{sessionConfidence}%</span>
                 </div>
                 <div className="h-[2px] bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${sessionConfidence}%` }} />
                 </div>
                 
                 <div className="pt-2 space-y-2">
                   <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Recommended path cells</p>
                   <div className="flex flex-wrap gap-1.5">
                     {feed?.recommendedPath?.map(idx => (
                       <div key={idx} className="px-2.5 py-0.5 bg-zinc-800 border border-zinc-700/60 rounded text-zinc-200 font-mono text-[10px]">
                         Cell #{idx}
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/30 border border-zinc-800/60 rounded-xl space-y-2">
               <div className="flex items-center gap-1.5 text-zinc-300 font-mono">
                  <Lock className="w-3.5 h-3.5" />
                  <h5 className="text-[10px] font-bold uppercase tracking-wider">Dynamic Parameters</h5>
               </div>
               <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                 Grid status: <span className="text-white font-semibold">{feed?.sessionVolatility || 'SYNCING'}</span>. Regional predictive models are updated on initial session state cycles. Cell weights change instantly when active mines are configured on consecutive steps.
               </p>
            </div>
            
            {feed && feed.groundingSources && feed.groundingSources.length > 0 && (
              <div className="p-4 border border-zinc-800 bg-zinc-950/30 rounded-lg space-y-2 overflow-hidden">
                <p className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Grounding Nodes</p>
                <div className="space-y-1.5">
                  {feed.groundingSources?.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 hover:text-white truncate">
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
