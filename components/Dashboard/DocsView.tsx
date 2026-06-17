import React, { useState } from 'react';
import { 
  Compass, 
  TrendingUp, 
  Database, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Clipboard, 
  Check, 
  AlertTriangle,
  BookOpen,
  Info
} from 'lucide-react';

const DocsView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- Table for Signal Logs
CREATE TABLE signal_logs (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  timestamp TIMESTAMPTZ,
  status TEXT,
  risk_rating TEXT,
  total_prob FLOAT8,
  grounding_sources JSONB,
  slips JSONB,
  payout_multiplier FLOAT8
);

-- Table for 6-hour Sports Cache
CREATE TABLE cached_matches (
  id TEXT PRIMARY KEY,
  league TEXT,
  home_team TEXT,
  away_team TEXT,
  match_time TEXT,
  probabilities JSONB,
  confidence FLOAT8,
  volatility TEXT,
  value_indicator FLOAT8,
  source_url TEXT,
  is_premium BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    {
      title: "Tactical Dual-Core AI Model",
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      content: "NEON-STAT leverages high-coherence neural networks (Gemini series) with active Google Search grounding. The core ingests current soccer statistics, injuries, recent fixture results, and real-time news to accurately evaluate betting opportunities without relying on stale static data."
    },
    {
      title: "Neural Market Decryptor",
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      content: "Initiates deep scanning of specialized soccer events. Instead of simple historic modeling, this component evaluates subtle variables such as positional entropy, squad volatility, and motivational thresholds to yield actionable value indicators."
    },
    {
      title: "Supabase Integration Engine",
      icon: <Database className="w-5 h-5 text-indigo-400" />,
      content: "For high durable reliability, and to persist Signal Logs and cached Sport Feeds, establish connection parameters to your cloud Supabase database. Simply set both SUPABASE_URL and SUPABASE_ANON_KEY inside the system environment."
    },
    {
      title: "Durable DB Migration (SQL)",
      icon: <Terminal className="w-5 h-5 text-fuchsia-400" />,
      content: "Deploy the following relational schema inside your Supabase SQL Editor. This activates reliable historical log queries and configures efficient 6-hour soccer match caching."
    },
    {
      title: "The Parlay Machine Architect",
      icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
      content: "Generates custom parlays aligned directly with chosen sports risk indices. Select from Conservative, Balanced, Aggressive, or Extreme. The optimizer automatically groups fixtures with highest value coefficients."
    },
    {
      title: "Local Integrity & Cache Safeties",
      icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
      content: "Accounts are shielded with dynamic cryptographic hashes. To secure resources and coordinate APIs, match feeds are cached for exactly 6 hours before requiring a neural refresh."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest">
          <BookOpen className="w-3.5 h-3.5" /> Operations Manual v4.2.1
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">System Configuration Manual</h2>
        <p className="text-sm text-slate-400 leading-relaxed font-mono tracking-wide uppercase font-semibold">
          Learn how to customize the NEON-STAT tactical suite and operate your neural persistence databases securely.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5">
        {sections.map((section, idx) => (
          <div key={idx} className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 sm:p-8 space-y-4 hover:border-slate-800 hover:bg-slate-950/60 transition-all duration-300">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-slate-900 bg-slate-950/80">
                {section.icon}
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">{section.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-mono text-xs text-slate-400/90 whitespace-normal">
                  {section.content}
                </p>
                {section.title === "Durable DB Migration (SQL)" && (
                  <div className="mt-4 rounded-xl border border-slate-900 bg-slate-950 p-4 relative group overflow-hidden">
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={handleCopySQL}
                        className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white transition-all flex items-center gap-1"
                        title="Copy schema SQL"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-3 h-3" />
                            <span>Copy SQL</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-cyan-500/90 overflow-x-auto leading-relaxed pt-6 select-all max-h-[220px]">
                      {sqlSchema}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-3 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">System Cache Constraints</h4>
          <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
            Feeds undergo standard 6-hour caching. A manual database sync payload can be triggered on demand by clicking the Refresh icon in your viewport.
          </p>
        </div>
      </div>

      <footer className="pt-8 border-t border-slate-900 text-center font-mono">
        <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.4em]">
          End of Guide // System Manual Document // NEON-STAT PRO
        </p>
      </footer>
    </div>
  );
};

export default DocsView;
