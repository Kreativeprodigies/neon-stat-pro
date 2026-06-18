import { 
  MatchAnalysis, 
  AITicket, 
  RiskLevel, 
  BuiltSlip, 
  MatchFeed, 
  LottoIntelligence, 
  AviatorFeed, 
  MinesFeed, 
  UsageMetadata, 
  MinesNode,
  LottoDraw
} from "../types.js";

/**
 * Client-Side Proxy interface for server-side AI processing
 */

/**
 * Local implementation of soccer schedule matching matches generated on current client clock
 */
export const getProperSoccerMatches = (now: Date): { league: string; homeTeam: string; awayTeam: string; time: string; sourceUrl: string }[] => {
  const leaguesPool = [
    { name: 'Premier League', source: 'https://www.skysports.com/premier-league-fixtures' },
    { name: 'La Liga', source: 'https://www.skysports.com/la-liga-fixtures' },
    { name: 'Serie A', source: 'https://www.skysports.com/serie-a-fixtures' },
    { name: 'Bundesliga', source: 'https://www.skysports.com/bundesliga-fixtures' },
    { name: 'Champions League', source: 'https://www.skysports.com/champions-league-fixtures' },
    { name: 'PSL', source: 'https://www.kickoff.com' }
  ];

  const matchups: Record<string, [string, string][]> = {
    'Premier League': [
      ['Man City', 'Liverpool'],
      ['Arsenal', 'Chelsea'],
      ['Man United', 'Tottenham'],
      ['Aston Villa', 'Newcastle'],
      ['West Ham', 'Chelsea'],
      ['Everton', 'Liverpool'],
      ['Arsenal', 'Man City'],
      ['Tottenham', 'Newcastle']
    ],
    'La Liga': [
      ['Real Madrid', 'Barcelona'],
      ['Atletico Madrid', 'Sevilla'],
      ['Villarreal', 'Real Sociedad'],
      ['Athletic Bilbao', 'Girona'],
      ['Barcelona', 'Atletico Madrid'],
      ['Real Betis', 'Valencia']
    ],
    'Serie A': [
      ['Inter Milan', 'AC Milan'],
      ['Juventus', 'Napoli'],
      ['Roma', 'Lazio'],
      ['Atalanta', 'Fiorentina'],
      ['AC Milan', 'Juventus'],
      ['Bologna', 'Napoli']
    ],
    'Bundesliga': [
      ['Bayern Munich', 'Dortmund'],
      ['Bayer Leverkusen', 'RB Leipzig'],
      ['Stuttgart', 'Frankfurt'],
      ['Dortmund', 'Bayer Leverkusen'],
      ['Bayern Munich', 'Stuttgart']
    ],
    'Champions League': [
      ['Real Madrid', 'PSG'],
      ['Bayern Munich', 'Arsenal'],
      ['Liverpool', 'Inter Milan'],
      ['Man City', 'Barcelona'],
      ['Atletico Madrid', 'Juventus']
    ],
    'PSL': [
      ['Mamelodi Sundowns', 'Orlando Pirates'],
      ['Kaizer Chiefs', 'Mamelodi Sundowns'],
      ['Orlando Pirates', 'Kaizer Chiefs'],
      ['SuperSport United', 'Cape Town City'],
      ['Golden Arrows', 'Secunda Stars'],
      ['Chippa United', 'Polokwane City']
    ]
  };

  const matches: { league: string; homeTeam: string; awayTeam: string; time: string; sourceUrl: string }[] = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 0; i < 15; i++) {
    const isToday = i % 2 === 0;
    const daysOffset = isToday ? 0 : 1;
    const kickOff = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000 + (i * 1.5) * 60 * 60 * 1000);
    
    const leagueObj = leaguesPool[i % leaguesPool.length];
    const pairPool = matchups[leagueObj.name];
    const pair = pairPool[(i + now.getDate()) % pairPool.length];
    
    const day = kickOff.getDate();
    const month = months[kickOff.getMonth()];
    const year = kickOff.getFullYear();
    const hours = kickOff.getHours().toString().padStart(2, '0');
    
    matches.push({
      league: leagueObj.name,
      homeTeam: pair[0],
      awayTeam: pair[1],
      time: `${day} ${month} ${year}, ${hours}:00 GMT`,
      sourceUrl: leagueObj.source
    });
  }

  return matches;
};

/**
 * Fetches soccer schedule using secure Server API
 */
export const fetchLiveMatches = async (): Promise<MatchFeed> => {
  const response = await fetch("/api/live-matches");
  if (!response.ok) {
    throw new Error(`Server returned HTTP status ${response.status} from live matches endpoint.`);
  }
  return await response.json();
};

/**
 * Builds AI Ticket using secure Server API
 */
export const buildAITicket = async (risk: RiskLevel, matchCount: number, availableMatches: MatchAnalysis[] = []): Promise<AITicket | null> => {
  const response = await fetch("/api/ai-ticket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ risk, matchCount, availableMatches })
  });
  if (!response.ok) {
    throw new Error(`Server returned HTTP status ${response.status} from parlay ticket builder.`);
  }
  return await response.json();
};

/**
 * Gets advanced tactical insight for sports fixtures using secure Server API
 */
export const getQuantInsight = async (match: MatchAnalysis): Promise<string> => {
  const response = await fetch("/api/quant-insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ match })
  });
  if (!response.ok) {
    throw new Error(`Server returned HTTP status ${response.status} from tactical insights endpoint.`);
  }
  const data = await response.json();
  return data.insight;
};

/**
 * Prediction for Aviator crash metrics using secure Server API
 */
export const fetchLiveAviatorHistory = async (): Promise<AviatorFeed> => {
  const response = await fetch("/api/aviator-history");
  if (!response.ok) {
    throw new Error(`Server returned HTTP status ${response.status} from aviator telemetry endpoint.`);
  }
  return await response.json();
};

/**
 * Lotto statistics using secure Server API
 */
export const fetchLottoIntelligence = async (): Promise<LottoIntelligence> => {
  const response = await fetch("/api/lotto-intelligence");
  if (!response.ok) {
    throw new Error(`Server returned HTTP status ${response.status} from lotteries engine.`);
  }
  return await response.json();
};

/**
 * Mines game node analytics using secure Server API
 */
export const fetchMinesIntelligence = async (mineCount: number): Promise<MinesFeed> => {
  const response = await fetch(`/api/mines-intelligence?mineCount=${mineCount}`);
  if (!response.ok) {
    throw new Error(`Server returned HTTP status ${response.status} from mines board neural mapper.`);
  }
  return await response.json();
};
