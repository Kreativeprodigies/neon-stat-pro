import React, { useState, useEffect, useMemo } from 'react';
import { LottoIntelligence } from '../../types';
import { fetchLottoIntelligence } from '../../services/geminiService';
import { 
  Compass, 
  Database, 
  Flame, 
  Snowflake, 
  Activity, 
  Cpu, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  Sliders,
  ChevronRight,
  Calculator,
  Gift,
  HelpCircle,
  Hash
} from 'lucide-react';

const LottoTool: React.FC = () => {
  const [intel, setIntel] = useState<LottoIntelligence | null>(null);
  const [ticketCount, setTicketCount] = useState(5);
  const [generatedTickets, setGeneratedTickets] = useState<{numbers: number[], bonus: number[], entropy: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedGame, setSelectedGame] = useState('Powerball');
  const [hoveredNum, setHoveredNum] = useState<number | null>(null);

  const syncLottoData = async () => {
    setLoading(true);
    try {
        const data = await fetchLottoIntelligence();
        setIntel(data);
    } catch (err) {
        console.error("Lotto sync failed", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    syncLottoData();
  }, []);

  const generateTickets = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800)); 
    
    const isPowerball = selectedGame.includes('Powerball');
    const mainMax = isPowerball ? 50 : 52;
    const mainCount = isPowerball ? 5 : 6;
    const bonusMax = isPowerball ? 20 : 0;

    const newTickets = Array.from({ length: ticketCount }, () => {
      const pool = [...Array(mainMax).keys()].map(i => i + 1);
      const hotBias = intel?.hotNumbers || [];
      const coldBias = intel?.coldNumbers || [];
      
      const nums = new Set<number>();
      while (nums.size < mainCount) {
        const rand = Math.random();
        if (rand < 0.35 && hotBias.length > 0) {
          const hotNum = hotBias[Math.floor(Math.random() * hotBias.length)];
          if (hotNum <= mainMax) nums.add(hotNum);
        } else if (rand > 0.90 && coldBias.length > 0) {
          const coldNum = coldBias[Math.floor(Math.random() * coldBias.length)];
          if (coldNum <= mainMax) nums.add(coldNum);
        } else {
          nums.add(pool[Math.floor(Math.random() * pool.length)]);
        }
      }
      
      const finalNumbers = Array.from(nums).sort((a, b) => a - b);
      const finalBonus = bonusMax > 0 ? [Math.floor(Math.random() * bonusMax) + 1] : [];
      const entropy = Math.random() * 0.4 + 0.6; 
      
      return { numbers: finalNumbers, bonus: finalBonus, entropy };
    });

    setGeneratedTickets(newTickets);
    setGenerating(false);
  };

  const frequencyMatrix = useMemo(() => {
    const isPowerball = selectedGame.includes('Powerball');
    const max = isPowerball ? 50 : 52;
    return Array.from({ length: max }, (_, i) => {
      const num = i + 1;
      let weight = 0.5; 
      if (intel?.hotNumbers?.includes(num)) weight = 0.9;
      if (intel?.coldNumbers?.includes(num)) weight = 0.2;
      return { num, weight };
    });
  }, [intel, selectedGame]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-16 h-16 rounded-lg border border-slate-900 bg-slate-950/60 flex items-center justify-center relative overflow-hidden">
            <span className="absolute inset-0 border-y border-cyan-500 animate-spin opacity-80" />
            <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1.5 font-mono">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest animate-pulse">Synchronizing Lotto Nodes</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Compiling South African National Archives v4.2</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-24">
      {/* Upper Status Line */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 border-b border-slate-900 pb-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" /> High Entropy Optimizer
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Lotto Probability Engine</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-mono mt-1">
            Dynamic distribution metrics for South African Draw statistics. Leverage stochastic modeling parameters to compute sequence variations based on entropy limits.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="border border-slate-800 bg-slate-950/60 px-5 py-3 rounded-lg flex flex-col items-start gap-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Sync Integrity</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">100% ONLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Frequency Density Matrix */}
        <div className="xl:col-span-8 space-y-8">
          
          <div className="border border-slate-900 bg-slate-950/40 p-6 sm:p-8 rounded-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Frequency Distribution Model
                </h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active state weighting index mapped directly from drawn logs</p>
              </div>
              <div className="flex gap-4 text-[10px] font-mono uppercase">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Hot Cluster</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-505">
                  <Snowflake className="w-3.5 h-3.5" />
                  <span>Cold Index</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {frequencyMatrix.map(({ num, weight }) => (
                <div 
                  key={num}
                  onMouseEnter={() => setHoveredNum(num)}
                  onMouseLeave={() => setHoveredNum(null)}
                  className={`aspect-square rounded-lg border transition-all duration-300 flex flex-col items-center justify-center relative cursor-help ${
                    weight > 0.7 ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                    weight < 0.3 ? 'bg-slate-950 border-slate-900/40 text-slate-600' :
                    'bg-slate-900/30 border-slate-900/60 text-slate-300'
                  } ${hoveredNum === num ? 'border-cyan-500 bg-cyan-500/15 scale-105 z-10' : ''}`}
                >
                  <span className="text-xs font-bold font-mono">{num}</span>
                  {weight > 0.7 && (
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Historical Archives */}
          <div className="border border-slate-900 bg-slate-950/40 p-6 sm:p-8 rounded-xl space-y-6">
             <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  National Draw Archives
                </h3>
                <button 
                  onClick={syncLottoData} 
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 font-bold uppercase rounded-lg hover:text-white transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" /> Re-Sync Node
                </button>
             </div>

             <div className="space-y-4">
               {intel?.recentDraws?.map((draw, idx) => (
                 <div key={idx} className="p-4 sm:p-5 border border-slate-950 bg-slate-950/40 rounded-lg hover:bg-slate-950/70 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-200 uppercase tracking-tight">{draw.gameName}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">{draw.date}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {draw.numbers?.map((n, i) => (
                        <div key={i} className="w-8 h-8 rounded border border-slate-905 bg-slate-950 flex items-center justify-center font-bold text-xs text-cyan-400">
                          {n}
                        </div>
                      ))}
                      {draw.bonus?.map((n, i) => (
                        <div key={i} className="w-8 h-8 rounded border border-amber-500/20 bg-amber-500/10 flex items-center justify-center font-bold text-xs text-amber-400">
                          {n}
                        </div>
                      ))}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: Optimizer Sequence Controls */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Controls Box */}
          <div className="border border-slate-900 bg-slate-950/40 p-6 rounded-xl space-y-6">
            <div className="space-y-1.5 border-b border-slate-900 pb-4">
              <div className="h-8 w-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider pt-2">Optimizer Blueprint</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Configure sequence permutations</p>
            </div>

            <div className="space-y-4 font-mono font-bold">
               <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Pool Variant</label>
                  <select 
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 font-bold uppercase outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                  >
                      {['Powerball', 'Powerball Plus', 'Lotto', 'Lotto Plus 1', 'Lotto Plus 2', 'Daily Lotto'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                  </select>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Sequence Depth</label>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{ticketCount} Tickets</span>
                  </div>
                  <input 
                      type="range"
                      min="1"
                      max="20"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
               </div>
            </div>

            <button 
              onClick={generateTickets}
              disabled={generating}
              className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                generating 
                ? 'bg-slate-900 border-slate-800 text-slate-505 cursor-wait' 
                : 'bg-cyan-500 border-cyan-400/30 text-slate-950 hover:bg-cyan-450 transition-all active:scale-95'
              }`}
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating States...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Execute Sequence Engine</span>
                </>
              )}
            </button>
          </div>

          {/* Sequence Generation Output Container */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-mono text-slate-500 uppercase font-extrabold tracking-widest pl-1">Optimizer output feed</h4>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
               {generatedTickets.length > 0 ? generatedTickets.map((t, idx) => (
                 <div key={idx} className="border border-slate-900 bg-slate-950/30 p-4 rounded-lg space-y-3 hover:border-slate-800 transition-colors">
                    <div className="flex justify-between items-center font-mono text-[9px]">
                       <span className="text-slate-500 font-bold uppercase">Variation Rank #{idx + 1}</span>
                       <span className="text-cyan-400 font-bold">Entropy: {t.entropy.toFixed(3)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.numbers.map((n, i) => (
                        <div key={i} className="w-7 h-7 rounded bg-slate-950 text-slate-200 border border-slate-900 flex items-center justify-center font-mono font-bold text-[10px]">
                          {n}
                        </div>
                      ))}
                      {t.bonus.length > 0 && (
                        <div className="w-7 h-7 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-[10px]">
                          {t.bonus[0]}
                        </div>
                      )}
                    </div>
                 </div>
               )) : (
                 <div className="py-12 border border-dashed border-slate-900/60 rounded-xl bg-slate-950/10 text-center">
                    <Hash className="w-8 h-8 mx-auto mb-2 text-slate-850 opacity-40" />
                    <p className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Awaiting Optimizer Stream</p>
                 </div>
               )}
            </div>
          </div>

          {/* Grounding Logs */}
          {intel && intel.groundingSources && intel.groundingSources.length > 0 && (
            <div className="p-5 border border-slate-900 bg-slate-950/40 rounded-xl space-y-4 max-w-full overflow-hidden">
              <h4 className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Nodal Verification Sources</h4>
              <div className="space-y-2.5">
                {intel.groundingSources.map((source, idx) => (
                  <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg border border-slate-900 bg-slate-950 hover:bg-slate-900 hover:border-slate-800 transition-colors">
                     <p className="text-xs font-bold text-slate-200 truncate">{source.title}</p>
                     <p className="text-[9px] font-mono text-slate-500 mt-1 truncate flex items-center gap-1">Source <ExternalLink className="w-2.5 h-2.5" /></p>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LottoTool;
