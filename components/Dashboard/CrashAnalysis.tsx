
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_CRASH_DATA } from '../../services/mockData';

const CrashAnalysis: React.FC = () => {
  const chartData = MOCK_CRASH_DATA.map((s, i) => ({
    round: i + 1,
    multiplier: s.value
  })).reverse();

  const average = (MOCK_CRASH_DATA.reduce((acc, curr) => acc + curr.value, 0) / MOCK_CRASH_DATA.length).toFixed(2);
  const max = Math.max(...MOCK_CRASH_DATA.map(s => s.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fadeIn">
      <div className="lg:col-span-2 glass rounded-[48px] border border-white/5 p-10 relative overflow-hidden group">
        <div className="scan-line" />
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-10 flex items-center justify-between">
          Volatility Diagnostic Map
          <span className="text-[10px] mono font-black text-slate-600 tracking-[0.4em] uppercase">Node History: 40 Rounds</span>
        </h3>
        <div className="h-72 w-full opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="crashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="round" hide />
              <YAxis hide domain={[0, 'dataMax + 1']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                labelClassName="font-black text-slate-500 text-[10px] uppercase"
              />
              <Area type="monotone" dataKey="multiplier" stroke="#06b6d4" fillOpacity={1} fill="url(#crashGrad)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-10">
        <div className="glass p-10 rounded-[40px] border border-white/5">
          <h4 className="text-[10px] mono font-black text-slate-600 uppercase tracking-[0.4em] mb-8">Neural Risk Indices</h4>
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] mono font-black uppercase">
                <span className="text-slate-500">Volatility Score</span>
                <span className="text-amber-500">MED-HIGH</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-amber-500/80 w-3/5 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] mono font-black uppercase">
                <span className="text-slate-500">Entropy Stability</span>
                <span className="text-lime-500">HIGH</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-lime-500/80 w-[85%] shadow-[0_0_10px_rgba(132,204,22,0.5)]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 rounded-[40px] p-10 border border-slate-900 shadow-2xl space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{average}x</p>
              <p className="text-[9px] mono text-slate-700 uppercase font-black tracking-widest">Global Mean</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-4xl font-black text-cyan-500 italic tracking-tighter leading-none">{max}x</p>
              <p className="text-[9px] mono text-slate-700 uppercase font-black tracking-widest">Session Peak</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 p-8 bg-amber-500/5 border border-amber-500/10 rounded-[40px] flex items-start gap-6 relative overflow-hidden">
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-3xl">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <h5 className="text-base font-black text-white uppercase italic tracking-tighter mb-2">No Future State Prediction</h5>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Volatility Lab diagnostics analyze historical state transitions and cluster entropy. RNG-based systems remain independent of past outcomes. 
            All insights are for strategic review and risk assessment purposes only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrashAnalysis;
