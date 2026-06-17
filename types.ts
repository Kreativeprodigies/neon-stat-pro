
export type UserRole = 'FREE' | 'PREMIUM' | 'ADMIN';
export type RiskLevel = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE' | 'EXTREME';
export type GameStatus = 'WIN' | 'LOSS' | 'PENDING' | 'UPCOMING';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  credits: number;
}

export interface UsageMetadata {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
}

export interface ProbabilitySet {
  homeWin: number;
  draw: number;
  awayWin: number;
  over15: number;
  over25: number;
  bothToScore: number;
}

export interface MatchAnalysis {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  probabilities: ProbabilitySet;
  confidence: number;
  volatility: 'LOW' | 'MED' | 'HIGH';
  isPremium: boolean;
  valueIndicator: number;
  sourceUrl?: string;
}

export interface MatchFeed {
  matches: MatchAnalysis[];
  groundingSources: { title: string; uri: string }[];
  usage?: UsageMetadata;
}

export interface AviatorFeed {
  history: number[];
  prediction: number;
  reliability: number;
  sessionRisk: 'STABLE' | 'VOLATILE' | 'EXTREME';
  groundingSources: { title: string; uri: string }[];
  usage?: UsageMetadata;
}

export interface BetSelection {
  matchId: string;
  label: string;
  prob: number;
}

export interface BuiltSlip {
  matchId: string;
  matchTitle: string;
  selections: BetSelection[];
  combinedProb: number;
  status?: GameStatus;
}

export interface AITicket {
  id: string;
  title: string;
  description: string;
  slips: BuiltSlip[];
  totalProb: number;
  riskRating: RiskLevel;
  groundingSources: { title: string; uri: string }[];
  usage?: UsageMetadata;
}

export interface HistoryItem extends AITicket {
  timestamp: string;
  status: GameStatus;
  payoutMultiplier?: number;
}

export interface GameStat {
  timestamp: string;
  value: number;
  type: 'CRASH' | 'SPIN';
}

export interface LottoDraw {
  gameName: string;
  date: string;
  numbers: number[];
  bonus: number[];
}

export interface LottoIntelligence {
  recentDraws: LottoDraw[];
  hotNumbers: number[];
  coldNumbers: number[];
  groundingSources: { title: string; uri: string }[];
  usage?: UsageMetadata;
}

export interface MinesNode {
  index: number;
  status: 'SAFE' | 'RISKY' | 'CRITICAL';
}

export interface MinesFeed {
  nodes: MinesNode[];
  recommendedPath: number[];
  sessionVolatility: 'LOW' | 'MED' | 'HIGH';
  groundingSources: { title: string; uri: string }[];
  usage?: UsageMetadata;
}
