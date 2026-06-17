
import React, { useState, useEffect } from 'react';
import { RiskLevel, AITicket, BuiltSlip, MatchAnalysis } from '../../types';
import { buildAITicket } from '../../services/geminiService';
import { 
  Activity, 
  TrendingUp, 
  Hexagon, 
  Sparkles, 
  CheckCircle2, 
  Circle,
  Loader2, 
  Grid, 
  HelpCircle,
  Cpu,
  BadgePercent,
  Compass,
  CornerDownRight,
  BookMarked
} from 'lucide-react';

interface Props {
  onDeploy: (ticket: AITicket) => void;
  availableMatches?: MatchAnalysis[];
}

type GenerationStep = 'IDLE' | 'ANALYZING' | 'OPTIMIZING' | 'VALIDATING' | 'READY';

const AITicketBuilder: React.FC<Props> = ({ onDeploy, availableMatches = [] }) => {
  const [risk, setRisk] = useState<RiskLevel>('BALANCED');
  const [matchCount, setMatchCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<AITicket | null>(null);
  const [step, setStep] = useState<GenerationStep>('IDLE');
  const [progress, setProgress] = useState(0);

  const steps: { key: GenerationStep; label: string; icon: any }[] = [
    { key: 'ANALYZING', label: 'Soccer Market Database Scan', icon: Compass },
    { key: 'OPTIMIZING', label: 'Risk & Volatility Hedging', icon: TrendingUp },
    { key: 'VALIDATING', label: 'Neural Validation & Calibration', icon: Cpu },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setTicket(null);
    setStep('ANALYZING');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      setTimeout(() => setStep('OPTIMIZING'), 1200);
      setTimeout(() => setStep('VALIDATING'), 2400);
      
      const result = await buildAITicket(risk, matchCount, availableMatches);
      
      if (result) {
        clearInterval(interval);
        setProgress(100);
        setStep('READY');
        setTicket(result);
      } else {
        clearInterval(interval);
        setStep('IDLE');
      }
    } catch (err) {
      console.error("Ticket building failed", err);
      clearInterval(interval);
      setStep('IDLE');
    } finally {
      setLoading(false);
    }
  };

  const calculateOdds = (prob: number) => {
    if (!prob || isNaN(prob) || prob <= 0) return "1.00";
    return (1 / prob).toFixed(2);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 mb-3">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Quantitative Systems
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Parlay Machine Architect
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed mt-2 uppercase font-mono tracking-wider font-semibold">
          Assemble highly calibrated soccer parlays customized per risk index. The engine extracts statistical alphas strictly of top leagues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PROFILE CONTROLS */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-900 pb-2">Parameters</h3>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">Soccer Risk Profile</label>
              <div className="grid grid-cols-2 gap-2">
                {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE', 'EXTREME'] as RiskLevel[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRisk(r)}
                    className={`py-3 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                      risk === r 
                      ? 'bg-cyan-505 border-cyan-500 text-cyan-400 font-extrabold shadow-sm bg-cyan-500/5' 
                      : 'text-slate-500 border-slate-900 hover:text-slate-350 hover:border-slate-800 bg-slate-950'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Aggregate Match Vectors</span>
                <span className="text-sm font-black text-white">{matchCount} Matchups</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={matchCount}
                onChange={(e) => setMatchCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-slate-800"
              />
              <div className="flex justify-between text-[8px] font-mono text-slate-600 font-bold">
                <span>MIN: 2</span>
                <span>MAX: 10</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-bold uppercase text-xs tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calibrating System...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Synthesize Parlay Slip
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PARLAY SLIP SCREEN */}
        <div className="lg:col-span-7 xl:col-span-8 h-full">
          {ticket && !loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-98 duration-400">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-5 gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                      {ticket.riskRating} Parlay Vector
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight mt-2">{ticket.title}</h3>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                     <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Combined Odds</p>
                     <p className="text-3xl font-black text-cyan-400 tracking-tight mt-1">{calculateOdds(ticket.totalProb)}x</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ticket.slips?.map((slip, i) => (
                    <div key={i} className="bg-slate-950/80 p-5 rounded-lg border border-slate-900 space-y-3">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-900/50 pb-1 italic truncate">
                         {slip.matchTitle}
                       </span>
                       <div className="space-y-2">
                          {slip.selections?.map((sel, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-900">
                              <span className="text-xs font-semibold text-slate-200">{sel.label}</span>
                              <span className="text-xs font-mono font-bold text-cyan-400">{(sel.prob * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>

               <div className="pt-4 border-t border-slate-900 flex justify-end">
                 <button 
                    onClick={() => onDeploy(ticket)}
                    className="w-full py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                 >
                    <BookMarked className="w-4 h-4 text-slate-800" />
                    Archive Machine Parlay to Log
                 </button>
               </div>
            </div>
          ) : step !== 'IDLE' ? (
            <div className="rounded-xl border border-slate-850 bg-slate-950/40 p-8 h-full min-h-[400px] flex flex-col justify-center max-w-xl mx-auto space-y-8 animate-in fade-in duration-300">
               {/* High Tech Step Incrementor Checklist */}
               <div className="space-y-4">
                 <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-900">
                   <Cpu className="w-4 h-4 text-cyan-400 animate-spin-slow" /> Core Optimization Steps
                 </h4>
                 
                 <div className="space-y-3">
                   {steps.map((s, idx) => {
                     // Check step progress
                     const isDone = (step === 'OPTIMIZING' && idx === 0) || 
                                    (step === 'VALIDATING' && idx <= 1) || 
                                    (step === 'READY' && idx <= 2);
                     const isActive = (step === 'ANALYZING' && idx === 0) || 
                                      (step === 'OPTIMIZING' && idx === 1) || 
                                      (step === 'VALIDATING' && idx === 2);
                     
                     const StepIcon = s.icon;
                     
                     return (
                       <div 
                         key={s.key} 
                         className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                           isActive ? 'border-cyan-500/30 bg-cyan-500/5 text-slate-100' : 
                           isDone ? 'border-slate-900/60 bg-slate-950 text-slate-400' : 
                           'border-slate-950 bg-slate-950/20 text-slate-600'
                         }`}
                       >
                         <div className="flex items-center gap-3">
                           <StepIcon className={`w-4 h-4 ${isActive ? 'text-cyan-400 animate-pulse' : isDone ? 'text-emerald-500' : 'text-slate-700'}`} />
                           <span className="text-xs font-semibold">{s.label}</span>
                         </div>
                         
                         <div>
                           {isDone ? (
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                           ) : isActive ? (
                             <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                           ) : (
                             <Circle className="w-4 h-4 text-slate-800" />
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>

               {/* Multi bar tracking progress */}
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
                   <span>Processing Sigma Payload</span>
                   <span>{Math.round(progress)}%</span>
                 </div>
                 <div className="h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                    <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                 </div>
               </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-900 h-full min-h-[400px] flex flex-col items-center justify-center p-6 text-center text-slate-500 select-none bg-slate-950/20">
              <Activity className="w-10 h-10 mb-3 text-slate-700" />
              <h4 className="text-base font-bold text-slate-450 tracking-tight">Parlay Workspace Empty</h4>
              <p className="text-xs max-w-xs text-slate-500 font-mono font-medium tracking-wide leading-relaxed uppercase mt-1">
                Customize the Sports risk indices on the left parameters sidebar to initialize building parlay bet-slips.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITicketBuilder;

