
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip as RechartsTooltip } from 'recharts';
import { LEAGUES, MOCK_HISTORY } from './services/mockData';
import { MatchAnalysis, User, HistoryItem, AITicket, UsageMetadata, BuiltSlip } from './types';
import { fetchLiveMatches } from './services/geminiService';
import { fetchSignalLogs, saveSignalLog, deleteSignalLog, getCachedMatches, saveMatchesToCache, clearMatchCache } from './services/supabaseService';
import { Icons } from './constants';
import AITicketBuilder from './components/Dashboard/AITicketBuilder';
import HistoryView from './components/Dashboard/HistoryView';
import PredictionsCard from './components/Dashboard/PredictionsCard';
import DocsView from './components/Dashboard/DocsView';

// Helper function to format dates for the terminal UI
export const formatTerminalDate = (date: Date | string | null | undefined) => {
  if (!date) return 'DATE_PENDING';
  const d = typeof date === 'string' ? new Date(date) : date;
  // Check if d is a valid Date object
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return String(date);
  }
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}, ${hours}:${minutes} UTC`;
};

const App: React.FC = () => {
  const [view, setView] = useState<'auth' | 'dash'>('auth');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<User>({ id: 'u1', name: 'Commander_Zero', role: 'PREMIUM', credits: 100 });
  const [dashTab, setDashTab] = useState('sports');
  const [selectedLeague, setSelectedLeague] = useState<string>('All Leagues');
  const [matches, setMatches] = useState<MatchAnalysis[]>([]);
  const [groundingSources, setGroundingSources] = useState<{title: string, uri: string}[]>([]);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [lastCacheSync, setLastCacheSync] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tickerOffset, setTickerOffset] = useState(0);

  // Simple authentication handler for the restricted uplink
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'GodIsGood') {
      setView('dash');
      setError('');
    } else {
      setError('ACCESS_DENIED // TOKEN_INVALID');
    }
  };

  // Syncs the live match feed using caching to optimize Gemini API usage
  const syncLiveFeed = async (force = false) => {
    if (isFetchingLive) return;
    setIsFetchingLive(true);
    try {
        const { matches: cached, lastUpdated } = await getCachedMatches();
        const now = Date.now();
        const cacheTime = lastUpdated ? new Date(lastUpdated).getTime() : 0;
        const isCacheValid = lastUpdated && (now - cacheTime < 6 * 60 * 60 * 1000);

        if (!force && isCacheValid && cached.length > 0) {
          setMatches(cached);
          setLastCacheSync(lastUpdated);
        } else {
          const feed = await fetchLiveMatches();
          if (feed && feed.matches && feed.matches.length > 0) {
            await clearMatchCache();
            await saveMatchesToCache(feed.matches);
            setMatches(feed.matches);
            setGroundingSources(feed.groundingSources || []);
            setLastCacheSync(new Date().toISOString());
            if (feed.usage) setSessionTokens(prev => prev + feed.usage!.totalTokens);
          }
        }
    } catch (err) {
        console.error("Link Failure:", err);
    }
    setTimeout(() => setIsFetchingLive(false), 1000);
  };

  useEffect(() => {
    if (view === 'dash') {
      syncLiveFeed();
      fetchSignalLogs().then(logs => setHistory(logs.length ? logs : (MOCK_HISTORY || [])));
    }
  }, [view]);

  // Terminal UI Ticker animation
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerOffset(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const filteredMatches = useMemo(() => {
    return selectedLeague === 'All Leagues' ? matches : (matches || []).filter(m => m.league === selectedLeague);
  }, [matches, selectedLeague]);

  const spotlightMatch = useMemo(() => {
    if (!matches.length) return null;
    return [...matches].sort((a, b) => b.confidence - a.confidence)[0];
  }, [matches]);

  const navItems = [
    { id: 'sports', label: 'Telemetry', icon: Icons.Sports },
    { id: 'ai-architect', label: 'Architect', icon: Icons.Hex },
    { id: 'history', label: 'Archive', icon: Icons.Dashboard },
    { id: 'docs', label: 'Manual', icon: Icons.Lock },
  ];

  const handleNavClick = (id: string) => {
    setDashTab(id);
    setIsSidebarOpen(false);
  };

  // Login screen
  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative overflow-hidden text-slate-100 selection:bg-electric/30">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-electric/5 to-transparent" />
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-terminal p-10 rounded-2xl border border-electric/10 shadow-2xl space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-electric/10 rounded-xl border border-electric/20 text-electric animate-float">
                <Icons.Hex className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter italic text-glow-electric">NEON-STAT</h1>
                <p className="text-[10px] mono text-slate-500 uppercase tracking-widest font-bold">Secure Uplink v4.8</p>
              </div>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input 
                  type="password"
                  placeholder="ENCRYPTED_KEY"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-slate-700 outline-none focus:border-electric/50 font-mono text-sm"
                />
              </div>
              {error && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest text-center">{error}</p>}
              <button type="submit" className="w-full bg-electric text-slate-950 py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 transition-all text-sm shadow-[0_0_20px_rgba(0,242,255,0.3)]">
                Connect Session
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard layout
  return (
    <div className="h-screen w-full bg-obsidian flex flex-col lg:flex-row text-slate-100 font-sans overflow-hidden">
      <div className="absolute inset-0 binary-overlay opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 w-20 bg-slate-950/80 backdrop-blur-3xl border-r border-white/5 flex flex-col items-center py-8 z-[150] transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="text-electric mb-12 animate-pulse"><Icons.Hex className="w-8 h-8" /></div>
        <nav className="flex-1 space-y-6">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`p-4 rounded-xl transition-all group relative ${dashTab === item.id ? 'bg-electric/10 text-electric' : 'text-slate-600 hover:text-white'}`}
              title={item.label}
            >
              <item.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${dashTab === item.id ? 'drop-shadow-[0_0_8px_#00f2ff]' : ''}`} />
              {dashTab === item.id && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-electric rounded-r-full shadow-[0_0_15px_#00f2ff]" />
              )}
            </button>
          ))}
        </nav>
        <button 
          onClick={() => { setView('auth'); setIsSidebarOpen(false); }} 
          className="p-4 text-slate-700 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header Bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/40 backdrop-blur-xl shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-xl font-black italic uppercase text-white tracking-tight">
              {navItems.find(n => n.id === dashTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[10px] mono text-slate-500 font-black uppercase tracking-widest">Neural Load</p>
              <p className="text-sm font-black text-electric italic">{sessionTokens.toLocaleString()} TOKENS</p>
            </div>
            <button 
              onClick={() => syncLiveFeed(true)} 
              disabled={isFetchingLive}
              className={`p-3 rounded-xl bg-white/5 border border-white/10 hover:border-electric/30 transition-all ${isFetchingLive ? 'animate-pulse text-electric' : 'text-slate-400 hover:text-white'}`}
            >
              <Icons.Sync className={`w-5 h-5 ${isFetchingLive ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 relative">
          {dashTab === 'sports' && (
            <div className="space-y-12">
               {/* Alpha Node Spotlight */}
               {spotlightMatch && (
                  <div className="relative glass-terminal rounded-[40px] border border-electric/20 p-10 overflow-hidden group">
                    <div className="scanline" />
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                       <div className="space-y-4">
                          <span className="px-4 py-1 bg-electric/10 border border-electric/30 text-electric rounded-full text-[10px] mono font-black uppercase tracking-widest">Alpha_Node_Spotlight</span>
                          <h3 className="text-4xl lg:text-6xl font-black italic uppercase text-white tracking-tighter leading-none">
                            {spotlightMatch.homeTeam} <span className="text-slate-700 mx-4">VS</span> {spotlightMatch.awayTeam}
                          </h3>
                          <p className="text-slate-400 font-medium italic">&gt; Strategic market convergence detected in {spotlightMatch.league}.</p>
                       </div>
                       <div className="text-center lg:text-right shrink-0">
                          <p className="text-[10px] mono text-slate-500 font-black uppercase tracking-[0.4em] mb-2">Neural confidence</p>
                          <p className="text-6xl lg:text-8xl font-black italic text-electric tracking-tighter drop-shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                            {Math.round(spotlightMatch.confidence)}%
                          </p>
                       </div>
                    </div>
                  </div>
               )}

               {/* League Selector */}
               <div className="flex flex-wrap items-center gap-4">
                  {['All Leagues', ...LEAGUES].map(league => (
                    <button
                      key={league}
                      onClick={() => setSelectedLeague(league)}
                      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedLeague === league ? 'bg-electric text-slate-950 border-electric shadow-[0_0_15px_rgba(0,242,255,0.3)]' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                    >
                      {league}
                    </button>
                  ))}
               </div>

               {/* Tactical Predictions Feed */}
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
                  {filteredMatches.map(match => (
                    <PredictionsCard key={match.id} match={match} userRole={user.role} />
                  ))}
               </div>
            </div>
          )}

          {dashTab === 'ai-architect' && (
            <AITicketBuilder 
              availableMatches={matches}
              onDeploy={async (ticket) => {
              const success = await saveSignalLog(ticket);
              if (success) {
                setHistory(prev => [ticket, ...prev]);
                setDashTab('history');
              }
            }} />
          )}

          {dashTab === 'history' && (
            <HistoryView 
              historyItems={history} 
              onUpdateHistory={setHistory} 
              onDeleteLog={async (id) => {
                const ok = await deleteSignalLog(id);
                if (ok) setHistory(prev => prev.filter(h => h.id !== id));
              }}
            />
          )}

          {dashTab === 'docs' && <DocsView />}
        </div>
      </main>
    </div>
  );
};

export default App;
