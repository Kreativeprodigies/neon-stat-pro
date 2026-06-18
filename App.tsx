
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
import AviatorPredictor from './components/Dashboard/AviatorPredictor';
import MinesPredictor from './components/Dashboard/MinesPredictor';
import LottoTool from './components/Dashboard/LottoTool';

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
    { id: 'aviator', label: 'Aviator', icon: Icons.Aviator },
    { id: 'mines', label: 'Mines', icon: Icons.Mines },
    { id: 'lotto', label: 'Lotto', icon: Icons.Lotto },
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
      <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative overflow-hidden select-none">
        <div className="relative z-10 w-full max-w-sm">
          <div className="bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-2xl border border-zinc-800 shadow-[2xl] space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 text-white mb-2">
                <Icons.Hex className="w-6 h-6 text-zinc-300" />
              </div>
              <div>
                <h1 className="text-xl font-medium tracking-tight text-white font-sans">ProStat™</h1>
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">INTELLIGENCE TERMINAL</p>
              </div>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Access Key</label>
                <input 
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-700 outline-none focus:border-zinc-500 transition-colors duration-200 font-mono text-sm text-center"
                  autoFocus
                />
              </div>
              
              {error && (
                <p className="text-[10px] text-red-400 font-mono tracking-wide text-center bg-red-950/20 py-1.5 rounded border border-red-900/30">
                  {error}
                </p>
              )}
              
              <button 
                type="submit" 
                className="w-full bg-white hover:bg-zinc-200 text-black py-3 rounded-lg font-medium text-xs tracking-wider uppercase transition-all duration-200 shadow-sm"
              >
                Authenticate Sequence
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                Protected by industrial-grade security keys
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard layout
  return (
    <div className="h-screen w-full bg-obsidian flex flex-col lg:flex-row text-zinc-100 font-sans overflow-hidden relative">
      
      {/* Sidebar Navigation - Apple/Spotify Minimal Style */}
      <aside className={`fixed inset-y-0 left-0 w-20 bg-zinc-900/60 backdrop-blur-2xl border-r border-zinc-800/80 flex flex-col items-center py-6 z-[150] transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="text-zinc-400 mb-8 shrink-0">
          <Icons.Hex className="w-7 h-7 text-white stroke-[1.5]" />
        </div>
        <nav className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center space-y-4 py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`p-3.5 rounded-lg transition-all duration-200 group relative shrink-0 ${dashTab === item.id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
              title={item.label}
            >
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-105" />
              {dashTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-sm" />
              )}
            </button>
          ))}
        </nav>
        <button 
          onClick={() => { setView('auth'); setIsSidebarOpen(false); }} 
          className="p-4 text-zinc-600 hover:text-red-400 transition-colors duration-200 shrink-0"
          title="Logout"
        >
          <svg className="w-5 h-5 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header Bar - Clear, minimalist line */}
        <header className="h-16 border-b border-zinc-800/80 bg-zinc-900/30 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 z-10 select-none">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-sm font-medium tracking-wide text-white uppercase font-mono">
              {navItems.find(n => n.id === dashTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">AI Operations Limit</p>
              <p className="text-xs font-mono text-zinc-300">{sessionTokens.toLocaleString()} tokens utilized</p>
            </div>
            <button 
              onClick={() => syncLiveFeed(true)} 
              disabled={isFetchingLive}
              className={`p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all duration-200 ${isFetchingLive ? 'animate-pulse text-zinc-400' : 'text-zinc-400 hover:text-zinc-100'}`}
              title="Refresh Global Stream"
            >
              <Icons.Sync className={`w-4 h-4 ${isFetchingLive ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
          {dashTab === 'sports' && (
            <div className="space-y-12">
                {/* Spotlight Banner - Apple/Stripe Elegant Hero Card */}
               {spotlightMatch && (
                  <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 p-8 overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-zinc-700/5 rounded-full filter blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                       <div className="space-y-4">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800/40 border border-zinc-700/60 text-zinc-300 rounded-full text-[10px] font-mono uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-spotify animate-pulse" />
                            Prime Statistical Convergence
                          </div>
                          <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-white font-sans">
                            {spotlightMatch.homeTeam} <span className="text-zinc-600 font-light mx-2">vs</span> {spotlightMatch.awayTeam}
                          </h3>
                          <p className="text-zinc-400 text-xs font-sans tracking-wide max-w-xl">
                            High confidence predictive alignment identified within {spotlightMatch.league}. Signals indicate low-variance probability dispersion.
                          </p>
                       </div>
                       <div className="md:text-right shrink-0">
                          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">PROBABILISTIC DENSITY</p>
                          <p className="text-5xl font-mono text-white tracking-tighter">
                            {Math.round(spotlightMatch.confidence)}%
                          </p>
                       </div>
                    </div>
                  </div>
               )}

               {/* League Selector - Modern Minimalist Vercel Pills */}
                <div className="flex flex-wrap items-center gap-2">
                   {['All Leagues', ...LEAGUES].map(league => (
                     <button
                       key={league}
                       onClick={() => setSelectedLeague(league)}
                       className={`px-4 py-1.5 rounded-lg text-xs tracking-wide transition-all duration-200 border ${selectedLeague === league ? 'bg-white text-zinc-950 border-white font-medium shadow-sm' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
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

          {dashTab === 'aviator' && (
            <AviatorPredictor userRole={user.role} />
          )}

          {dashTab === 'mines' && (
            <MinesPredictor />
          )}

          {dashTab === 'lotto' && (
            <LottoTool />
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
