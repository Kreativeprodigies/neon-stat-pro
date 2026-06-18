import { HistoryItem, MatchAnalysis, GameStatus } from '../types';

const LOGS_KEY = 'neonstat_signal_logs';
const MATCHES_KEY = 'neonstat_cached_matches';
const CACHE_TIME_KEY = 'neonstat_matches_last_updated';

/**
 * Persists a full signal log object. 
 */
export const saveSignalLog = async (log: HistoryItem): Promise<boolean> => {
  try {
    const logs = await fetchSignalLogs();
    const updated = [log, ...logs.filter(item => item.id !== log.id)];
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error(`Local Database Error (saveSignalLog):`, err);
    return false;
  }
};

/**
 * Updates status and slips for a specific log ID.
 */
export const updateSignalLogStatus = async (id: string, status: GameStatus, slips: any[]): Promise<boolean> => {
  try {
    const logs = await fetchSignalLogs();
    const updated = logs.map(item => {
      if (item.id === id) {
        return { ...item, status, slips };
      }
      return item;
    });
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error(`Local Database Error (updateSignalLogStatus):`, err);
    return false;
  }
};

/**
 * Fetches all signal logs.
 */
export const fetchSignalLogs = async (): Promise<HistoryItem[]> => {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as HistoryItem[];
  } catch (err) {
    console.error(`Local Database Error (fetchSignalLogs):`, err);
    return [];
  }
};

/**
 * Deletes a log.
 */
export const deleteSignalLog = async (id: string): Promise<boolean> => {
  try {
    const logs = await fetchSignalLogs();
    const updated = logs.filter(item => item.id !== id);
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error(`Local Database Error (deleteSignalLog):`, err);
    return false;
  }
};

/**
 * Sports Data Caching with 6-hour TTL logic handled in App.tsx
 */
export const getCachedMatches = async (): Promise<{ matches: MatchAnalysis[], lastUpdated: string | null }> => {
  try {
    const storedMatches = localStorage.getItem(MATCHES_KEY);
    const lastUpdated = localStorage.getItem(CACHE_TIME_KEY);
    
    if (!storedMatches) {
      return { matches: [], lastUpdated: null };
    }
    
    return {
      matches: JSON.parse(storedMatches) as MatchAnalysis[],
      lastUpdated
    };
  } catch (err) {
    console.error(`Local Database Error (getCachedMatches):`, err);
    return { matches: [], lastUpdated: null };
  }
};

export const clearMatchCache = async (): Promise<void> => {
  try {
    localStorage.removeItem(MATCHES_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
  } catch (err) {
    console.error(`Local Database Error (clearMatchCache):`, err);
  }
};

export const saveMatchesToCache = async (matches: MatchAnalysis[]): Promise<void> => {
  try {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    localStorage.setItem(CACHE_TIME_KEY, new Date().toISOString());
  } catch (err) {
    console.error(`Local Database Error (saveMatchesToCache):`, err);
  }
};
