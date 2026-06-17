import { createClient } from '@supabase/supabase-js';
import { HistoryItem, MatchAnalysis, GameStatus } from '../types';

// Connection details provided by the user
const SUPABASE_URL = 'https://cpwdukeeahumcjadlmpm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PPT4QeblE6T5PTAWbDup-Q_GKYweAGx';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const logError = (context: string, error: any) => {
  // Suppress network errors for invalid/paused Supabase projects to allow silent fallback
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
    return;
  }
  console.error(`Supabase Error (${context}):`, error?.message || error);
};

/**
 * Persists a full signal log object. 
 */
export const saveSignalLog = async (log: HistoryItem): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('signal_logs')
      .upsert({
        id: log.id,
        title: log.title,
        description: log.description,
        timestamp: log.timestamp,
        status: log.status,
        risk_rating: log.riskRating,
        total_prob: log.totalProb,
        grounding_sources: log.groundingSources, 
        slips: log.slips,
        payout_multiplier: log.payoutMultiplier
      }, { onConflict: 'id' });
    
    if (error) {
      logError('saveSignalLog', error);
      return false;
    }
    return true;
  } catch (err) {
    logError('saveSignalLog Critical', err);
    return false;
  }
};

/**
 * Updates status and slips for a specific log ID.
 */
export const updateSignalLogStatus = async (id: string, status: GameStatus, slips: any[]): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('signal_logs')
      .update({ 
        status, 
        slips
      })
      .eq('id', id);
    
    if (error) {
      logError('updateSignalLogStatus', error);
      return false;
    }
    return true;
  } catch (err) {
    logError('updateSignalLogStatus Critical', err);
    return false;
  }
};

/**
 * Fetches all signal logs.
 */
export const fetchSignalLogs = async (): Promise<HistoryItem[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('signal_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      logError('fetchSignalLogs', error);
      return [];
    }
    
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      timestamp: row.timestamp,
      status: row.status as GameStatus,
      riskRating: row.risk_rating,
      totalProb: row.total_prob,
      groundingSources: typeof row.grounding_sources === 'string' ? JSON.parse(row.grounding_sources) : row.grounding_sources,
      slips: typeof row.slips === 'string' ? JSON.parse(row.slips) : row.slips,
      payoutMultiplier: row.payout_multiplier
    }));
  } catch (err) {
    logError('fetchSignalLogs Critical', err);
    return [];
  }
};

/**
 * Deletes a log.
 */
export const deleteSignalLog = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('signal_logs')
      .delete()
      .eq('id', id);
    
    if (error) {
      logError('deleteSignalLog', error);
      return false;
    }
    return true;
  } catch (err) {
    logError('deleteSignalLog Critical', err);
    return false;
  }
};

/**
 * Sports Data Caching with 6-hour TTL logic handled in App.tsx
 */
export const getCachedMatches = async (): Promise<{ matches: MatchAnalysis[], lastUpdated: string | null }> => {
  if (!supabase) return { matches: [], lastUpdated: null };
  try {
    const { data, error } = await supabase
      .from('cached_matches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      logError('getCachedMatches', error);
      return { matches: [], lastUpdated: null };
    }
    
    if (!data || data.length === 0) return { matches: [], lastUpdated: null };

    const matches = data.map(row => ({
      id: row.id,
      league: row.league,
      homeTeam: row.home_team,
      awayTeam: row.away_team,
      time: row.match_time,
      probabilities: typeof row.probabilities === 'string' ? JSON.parse(row.probabilities) : row.probabilities,
      confidence: row.confidence,
      volatility: row.volatility,
      valueIndicator: row.value_indicator,
      sourceUrl: row.source_url,
      isPremium: row.is_premium
    })) as MatchAnalysis[];

    return { matches, lastUpdated: data[0].created_at };
  } catch (err) {
    logError('getCachedMatches Critical', err);
    return { matches: [], lastUpdated: null };
  }
};

export const clearMatchCache = async (): Promise<void> => {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('cached_matches')
      .delete()
      .neq('id', 'placeholder_to_match_all');
    if (error) throw error;
  } catch (err) {
    logError('clearMatchCache', err);
  }
};

export const saveMatchesToCache = async (matches: MatchAnalysis[]): Promise<void> => {
  if (!supabase || matches.length === 0) return;
  try {
    const rows = matches.map(m => ({
      id: m.id,
      league: m.league,
      home_team: m.homeTeam,
      away_team: m.awayTeam,
      match_time: m.time,
      probabilities: m.probabilities,
      confidence: m.confidence,
      volatility: m.volatility,
      value_indicator: m.valueIndicator,
      source_url: m.sourceUrl,
      is_premium: m.isPremium
    }));

    const { error } = await supabase
      .from('cached_matches')
      .upsert(rows, { onConflict: 'id' });
    
    if (error) {
      logError('saveMatchesToCache', error);
    }
  } catch (err) {
    logError('saveMatchesToCache Critical', err);
  }
};