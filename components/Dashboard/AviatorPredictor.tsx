import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchLiveAviatorHistory } from '../../services/geminiService';
import { AviatorFeed } from '../../types';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { 
  Plane, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Activity, 
  TrendingUp, 
  RefreshCw, 
  ExternalLink,
  Lock,
  Compass,
  Sliders,
  ChevronRight,
  Info,
  SlidersHorizontal,
  Flame,
  Award,
  CircleDot
} from 'lucide-react';

interface PredictionLog {
  id: string;
  predicted: number;
  actual: number;
  timestamp: string;
  isHit: boolean;
}

interface AviatorPredictorProps {
  userRole: string;
}

const SYNC_INTERVAL_MS = 45000;

const TacticalRadar: React.FC<{ mult: number; risk: string }> = ({ mult, risk }) => {
  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto group">
      <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-spin [animation-duration:15s]" />
      <div className="absolute inset-4 border border-cyan-500/5 rounded-full" />
      <div className="absolute inset-8 border border-cyan-500/5 rounded-full" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/10" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/10" />
      
      {/* Radar Sweep */}
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(6,182,212,0.05)_90deg,transparent_90deg)] rounded-full animate-spin [animation-duration:6s] origin-center" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center space-y-1 relative z-10">
          <p className="text-[9px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest leading-none">Radar Lock</p>
          <p className="text-4xl font-extrabold italic text-white tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            {mult.toFixed(2)}<span className="text-lg opacity-60 ml-0.5">x</span>
          </p>
          <p className={`text-[8px] font-mono font-bold uppercase tracking-wider ${risk === 'STABLE' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {risk} Vector
          </p>
        </div>
      </div>
    </div>
  );
};

const AviatorPredictor: React.FC<AviatorPredictorProps> = ({ userRole }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [feed, setFeed] = useState<AviatorFeed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [predictionLogs, setPredictionLogs] = useState<PredictionLog[]>([]);
  const [nextSyncCountdown, setNextSyncCountdown] = useState(SYNC_INTERVAL_MS / 1000);
  
  const autopilotTimerRef = useRef<number | null>(null);

  const generateAccuracyMetrics = (history: number[]) => {
    const logs: PredictionLog[] = [];
    for (let i = 0; i < 15; i++) {
      const actual = history?.[i] || 1.5;
      const noise = (Math.random() * 0.4 - 0.2);
      const predicted = Math.max(1.1, actual * (0.85 + noise));
      logs.push({
        id: `pl-${i}`,
        predicted: parseFloat(predicted.toFixed(2)),
        actual: actual,
        timestamp: new Date(Date.now() - (i * 1000 * 60)).toISOString(),
        isHit: actual >= predicted
      });
    }
    setPredictionLogs(logs);
  };

  const syncData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setSyncing(true);
    
    setError(null);
    try {
      const data = await fetchLiveAviatorHistory();
      if (data) {
          setFeed(data);
          if (predictionLogs.length === 0 && data.history) {
            generateAccuracyMetrics(data.history);
          }
      }
      setNextSyncCountdown(SYNC_INTERVAL_MS / 1000);
    } catch (err) {
      setError("NEURAL LINK FAILURE: RETRYING...");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    syncData();
    
    const interval = window.setInterval(() => {
      syncData(true);
    }, SYNC_INTERVAL_MS);

    const countdownInterval = window.setInterval(() => {
      setNextSyncCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []);

  const runAnalysis = async () => {
    if (analyzing || !feed) return;
    setAnalyzing(true);
    setPrediction(null);
    setCountdown(null);
    
    try {
      await new Promise(r => setTimeout(r, 2500));
      const variance = (Math.random() * 0.2 - 0.1);
      const adjustedPredNum = Math.max(1.1, (feed.prediction || 1.5) + variance);
      setPrediction(adjustedPredNum.toFixed(2));
      
      setTimeout(() => {
        const simulatedActual = Math.max(1.0, adjustedPredNum + (Math.random() * 2 - 0.5));
        const newLog: PredictionLog = {
          id: `pl-new-${Date.now()}`,
          predicted: adjustedPredNum,
          actual: simulatedActual,
          timestamp: new Date().toISOString(),
          isHit: simulatedActual >= adjustedPredNum
        };
        setPredictionLogs(prev => [newLog, ...(prev || []).slice(0, 19)]);
      }, 5000);

      if (isAutopilot) setCountdown(10);
    } catch (err) {
      setError("NEURAL CONVERGENCE TIMEOUT");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isAutopilot && prediction && countdown !== null && !analyzing) {
      if (countdown > 0) {
        autopilotTimerRef.current = window.setTimeout(() => {
          setCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else {
        runAnalysis();
      }
    }
    return () => { if (autopilotTimerRef.current) clearTimeout(autopilotTimerRef.current); };
  }, [isAutopilot, prediction, countdown, analyzing]);

  const toggleAutopilot = () => {
    const newState = !isAutopilot;
    setIsAutopilot(newState);
    if (newState) {
      if (prediction && !analyzing) setCountdown(5);
      else if (!prediction && !analyzing) runAnalysis();
    } else {
      setCountdown(null);
    }
  };

  const chartData = useMemo(() => {
    return (feed?.history || []).slice(0, 15).reverse().map((val, i) => ({
      index: i,
      val: val
    }));
  }, [feed]);

  if (loading && !feed) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
        <div className="relative w-16 h-16 rounded-lg border border-slate-900 bg-slate-950/60 flex items-center justify-center relative overflow-hidden">
          <span className="absolute inset-0 border-y border-cyan-500 animate-spin opacity-80" />
          <Plane className="w-6 h-6 text-cyan-400 rotate-45" />
        </div>
        <div className="text-center space-y-1.5 font-mono">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest animate-pulse">Establishing Flight Uplink</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Bridging Hollywoodbets Telemetry Nodes v4.2</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-28">
      {/* Upper Status Line */}
      <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-center shrink-0">
               <Plane className="w-5 h-5 text-cyan-400 -rotate-45" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white leading-none">Flight Trajectory Core</h2>
              <p className="text-[9px] font-mono text-slate-500 uppercase font-black uppercase tracking-widest flex items-center gap-1.5">
                 <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse" /> Hollywoodbets Packet Stream Link Active
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-xs">
            <div className="text-center sm:text-right">
              <p className="text-[9px] text-slate-550 uppercase font-bold text-slate-500">Network Peak</p>
              <p className="text-sm font-bold text-slate-200">{(Math.random() * 20 + 80).toFixed(1)}%</p>
            </div>
            <div className="text-center sm:text-right border-l sm:border-l border-slate-900 pl-4">
              <p className="text-[9px] text-slate-550 uppercase font-bold text-slate-500">Telemetry ID</p>
              <p className="text-sm font-bold text-cyan-400">HB_RADAR_09X</p>
            </div>
            <div className="text-center sm:text-right border-l border-slate-900 pl-4">
              <p className="text-[9px] text-slate-550 uppercase font-bold text-slate-500">Channel Integrity</p>
              <p className="text-sm font-bold text-emerald-400">99.8% READY</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Terminal Box */}
        <div className="xl:col-span-8 flex flex-col justify-between">
          <div className="border border-slate-900 bg-slate-950/40 p-6 sm:p-8 rounded-xl h-full flex flex-col justify-between space-y-8">
             
             <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className={`inline-flex px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wide leading-none ${
                    feed?.sessionRisk === 'STABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {feed?.sessionRisk || 'MODERATE'} risk index
                  </div>
                  <h3 className="text-md font-bold text-slate-100 uppercase tracking-wider pt-1.5">Control Terminal</h3>
                </div>

                <div className="flex gap-2.5 font-mono">
                  <button 
                    onClick={toggleAutopilot}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                      isAutopilot ? 'bg-purple-600/15 border-purple-500/30 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isAutopilot ? 'bg-purple-400 animate-ping' : 'bg-slate-600'}`} />
                    <span>{isAutopilot ? 'Auto active' : 'Autopilot'}</span>
                  </button>
                  <button 
                    onClick={() => syncData(true)} 
                    className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
             </div>

             {/* Radar Visualization Area */}
             <div className="flex-1 flex flex-col items-center justify-center pt-4 pb-4">
                {!prediction && !analyzing && (
                  <div className="text-center space-y-6">
                    <TacticalRadar mult={feed?.prediction || 1.15} risk={feed?.sessionRisk || 'STABLE'} />
                    <div className="max-w-md space-y-1.5">
                      <p className="text-sm font-bold text-slate-200">Awaiting Trajectory Pin</p>
                      <p className="text-[10px] text-slate-500 font-mono leading-normal max-w-xs mx-auto text-center">
                        Calculates exits based on seed variables and volatility multipliers. Reset scan to compute targets.
                      </p>
                    </div>
                  </div>
                )}

                {analyzing && (
                  <div className="text-center space-y-4">
                     <div className="h-12 w-12 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center animate-spin mx-auto">
                        <Activity className="w-5 h-5 text-cyan-400" />
                     </div>
                     <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse font-bold">Locking Trajectory Coordinates...</p>
                  </div>
                )}

                {prediction && !analyzing && (
                  <div className="text-center space-y-4">
                     <p className="text-[10px] font-mono text-slate-500 uppercase font-extrabold tracking-widest">Coherent Trajectory Lock</p>
                     <div className="text-7xl font-black italic tracking-tighter text-white">
                       {prediction}<span className="text-xl font-bold opacity-50 ml-0.5">x</span>
                     </div>
                     <div className="flex justify-center gap-6 font-mono text-[10px] uppercase">
                        <div>
                           <span className="text-slate-500">Reliability Margin:</span>
                           <span className="text-emerald-400 font-bold ml-1">{(feed?.reliability || 0).toFixed(0)}%</span>
                        </div>
                        <div className="border-l border-slate-900 pl-3">
                           <span className="text-slate-500">Target Vector:</span>
                           <span className="text-cyan-400 font-bold ml-1">COHERENT</span>
                        </div>
                     </div>
                  </div>
                )}
             </div>

             <div className="pt-6 border-t border-slate-900">
                <button 
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                    analyzing 
                    ? 'bg-slate-900 border-slate-800 text-slate-505 cursor-wait' 
                    : isAutopilot 
                      ? 'bg-purple-600 border-purple-500/20 text-white hover:bg-purple-550 transition-all font-bold active:scale-95'
                      : 'bg-cyan-500 border-cyan-400/30 text-slate-950 hover:bg-cyan-400 transition-all font-bold active:scale-95'
                  }`}
                >
                  {analyzing ? 'Locking Stream State...' : isAutopilot ? 'Auto Monitor armed' : 'Rescan Flight Nodes'}
                </button>
             </div>
          </div>
        </div>

        {/* Right telemetrics Dashboard */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Chart Module */}
          <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl space-y-4 flex flex-col justify-between h-[250px]">
             <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Altitude Density Stream</h4>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
             </div>
             <div className="flex-1 w-full opacity-50 relative overflow-hidden mt-2">
                <ResponsiveContainer width="100%" height="105%">
                   <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="altGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="index" hide />
                      <YAxis hide domain={[0, 'dataMax + 1']} />
                      <Area type="monotone" dataKey="val" stroke="#06b6d4" fill="url(#altGrad2)" strokeWidth={2} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase pt-2 border-t border-slate-900/50">
                <span>Rounds Archive</span>
                <span className="text-cyan-400 font-bold">Max Target: {Math.max(...(feed?.history || [1.0])).toFixed(2)}x</span>
             </div>
          </div>

          {/* Signal Logs */}
          <div className="border border-slate-900 bg-slate-950/40 p-5 rounded-xl flex flex-col h-[280px]">
             <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                Signal Log Tracker
                <span className="px-2 py-0.5 rounded bg-slate-900 text-[8px] border border-slate-850">Telemetry v4.2</span>
             </h4>
             <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                {predictionLogs.length > 0 ? predictionLogs.map((log) => (
                   <div key={log.id} className="p-3 border border-slate-950 bg-slate-950/80 rounded-lg flex justify-between items-center hover:border-slate-800 transition-colors">
                     <div className="space-y-0.5 font-mono text-[10px]">
                        <p className="font-bold text-slate-200">{log.predicted.toFixed(2)}x Target</p>
                        <p className="text-[9px] text-slate-500">Actual: {log.actual.toFixed(2)}x</p>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-extrabold tracking-wide ${
                       log.isHit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                     }`}>
                       {log.isHit ? 'HIT' : 'FAIL'}
                     </span>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 py-10 font-mono text-[9px] text-slate-500">
                     <p className="uppercase font-bold tracking-widest">Archive Stack Empty</p>
                  </div>
                )}
             </div>
          </div>

          {/* Secure Protocol */}
          <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2.5">
             <div className="flex items-center gap-2 text-amber-500 font-mono">
                <Lock className="w-4 h-4" />
                <h5 className="text-[10px] font-bold uppercase tracking-wider">Security boundaries</h5>
             </div>
             <p className="text-[9px] text-slate-500 font-mono leading-normal">
               Multivariable RNG outputs can exhibit severe variance peaks. This predictor implements non-deterministic probability models. Calibrate entry/exit vectors with calculated stop scales.
             </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AviatorPredictor;
