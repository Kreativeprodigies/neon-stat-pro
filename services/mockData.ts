
import { MatchAnalysis, GameStat, HistoryItem } from '../types';

export const LEAGUES = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League', 'PSL'];

export const MOCK_ANALYSES: MatchAnalysis[] = [
  {
    id: 'm1',
    league: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    time: '25 Jan 26, 22:00 GMT',
    probabilities: { homeWin: 0.58, draw: 0.22, awayWin: 0.20, over15: 0.82, over25: 0.61, bothToScore: 0.55 },
    confidence: 88,
    volatility: 'LOW',
    isPremium: false,
    valueIndicator: 7.2
  },
  {
    id: 'm2',
    league: 'Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Man City',
    time: '26 Jan 26, 21:00 GMT',
    probabilities: { homeWin: 0.31, draw: 0.28, awayWin: 0.41, over15: 0.89, over25: 0.68, bothToScore: 0.72 },
    confidence: 72,
    volatility: 'HIGH',
    isPremium: true,
    valueIndicator: 8.5
  },
  {
    id: 'm3',
    league: 'Serie A',
    homeTeam: 'Inter Milan',
    awayTeam: 'Juventus',
    time: '26 Jan 26, 19:30 GMT',
    probabilities: { homeWin: 0.45, draw: 0.32, awayWin: 0.23, over15: 0.65, over25: 0.42, bothToScore: 0.38 },
    confidence: 81,
    volatility: 'MED',
    isPremium: true,
    valueIndicator: 6.1
  },
  {
    id: 'm-psl-1',
    league: 'PSL',
    homeTeam: 'Mamelodi Sundowns',
    awayTeam: 'Kaizer Chiefs',
    time: '27 Jan 26, 15:00 GMT',
    probabilities: { homeWin: 0.62, draw: 0.25, awayWin: 0.13, over15: 0.75, over25: 0.48, bothToScore: 0.42 },
    confidence: 91,
    volatility: 'LOW',
    isPremium: false,
    valueIndicator: 7.8
  }
];

export const MOCK_CRASH_DATA: GameStat[] = Array.from({ length: 40 }, (_, i) => ({
  timestamp: new Date(Date.now() - i * 60000).toISOString(),
  value: Math.random() < 0.2 ? 1.0 : parseFloat((Math.random() * 4 + 1).toFixed(2)),
  type: 'CRASH'
}));

export const MOCK_AVIATOR_HISTORY: number[] = [
  1.23, 4.56, 1.02, 2.33, 1.88, 12.44, 1.50, 2.11, 1.00, 3.44,
  5.67, 1.12, 1.90, 2.45, 1.05, 10.20, 1.44, 2.88, 1.11, 4.22,
  1.33, 1.01, 2.15, 6.78, 1.89, 1.44, 3.11, 1.09, 2.56, 1.77
];

export const MOCK_LOTTO = {
  hotNumbers: [7, 23, 11, 44, 19, 32],
  coldNumbers: [2, 15, 38, 41, 5, 27]
};

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'hist-3',
    title: 'Live Tactical Sync',
    description: 'Real-time parlay identifying immediate value in ongoing UCL fixtures.',
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    riskRating: 'BALANCED',
    totalProb: 0.08,
    groundingSources: [{ title: 'UCL Live Center', uri: 'https://www.uefa.com' }],
    slips: [
      {
        matchId: 'm4',
        matchTitle: 'Liverpool vs AC Milan',
        combinedProb: 0.55,
        status: 'WIN',
        selections: [{ matchId: 'm4', label: 'Liverpool Win', prob: 0.55 }]
      },
      {
        matchId: 'm5',
        matchTitle: 'Barcelona vs Bayern',
        combinedProb: 0.45,
        status: 'PENDING',
        selections: [{ matchId: 'm5', label: 'Over 2.5', prob: 0.45 }]
      }
    ]
  },
  {
    id: 'hist-4',
    title: 'Upcoming Alpha Batch',
    description: 'Strategic long-term hold for the next session of weekend qualifiers.',
    timestamp: new Date(Date.now() + 3600000).toISOString(),
    status: 'UPCOMING',
    riskRating: 'CONSERVATIVE',
    totalProb: 0.22,
    groundingSources: [{ title: 'Fifa Qualifiers Stats', uri: 'https://www.fifa.com' }],
    slips: [
      {
        matchId: 'm6',
        matchTitle: 'England vs Brazil',
        combinedProb: 0.48,
        status: 'UPCOMING',
        selections: [{ matchId: 'm6', label: 'Draw No Bet', prob: 0.48 }]
      }
    ]
  }
];
