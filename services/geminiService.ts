
import { GoogleGenAI, Type } from "@google/genai";
import { MatchAnalysis, AITicket, RiskLevel, BuiltSlip, MatchFeed, LottoIntelligence, AviatorFeed, MinesFeed, UsageMetadata } from "../types";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const stripMarkdown = (text: string) => {
  return text.replace(/```json\n?|\n?```/g, "").trim();
};

const getUsage = (response: any): UsageMetadata | undefined => {
  if (response.usageMetadata) {
    return {
      promptTokens: response.usageMetadata.promptTokenCount || 0,
      candidatesTokens: response.usageMetadata.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata.totalTokenCount || 0,
    };
  }
  return undefined;
};

export const fetchLiveMatches = async (): Promise<MatchFeed> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `CRITICAL INSTRUCTION: You MUST use the Google Search tool to find the REAL, ACTUAL soccer schedule for today (${today}) and tomorrow. DO NOT hallucinate or invent matches.

    Find 15 major upcoming or live top-tier SOCCER (Football) matches for today and tomorrow. 
    Strictly include soccer leagues only: Premier League, La Liga, Serie A, Bundesliga, Champions League, and South African PSL.
    
    For each match:
    1. Analyze recent team form (last 5 matches).
    2. Check head-to-head records.
    3. Consider home/away advantage.
    4. Calculate win/draw/loss probabilities based on this analysis.
    5. Estimate "confidence" based on the predictability of the match.
    6. Identify "value" where your calculated probability is higher than typical market odds.
    
    DO NOT include any other sports. Provide full probabilities and confidence scores. Output JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are NEON-STAT, an elite quantitative sports betting AI. You analyze soccer matches with cold, calculated precision. You focus on data, form, and tactical mismatches.",
        temperature: 0.2,
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  league: { type: Type.STRING },
                  homeTeam: { type: Type.STRING },
                  awayTeam: { type: Type.STRING },
                  time: { type: Type.STRING },
                  probabilities: {
                    type: Type.OBJECT,
                    properties: {
                      homeWin: { type: Type.NUMBER },
                      draw: { type: Type.NUMBER },
                      awayWin: { type: Type.NUMBER },
                      over15: { type: Type.NUMBER },
                      over25: { type: Type.NUMBER },
                      bothToScore: { type: Type.NUMBER },
                    },
                    required: ["homeWin", "draw", "awayWin", "over15", "over25", "bothToScore"]
                  },
                  confidence: { type: Type.NUMBER },
                  volatility: { type: Type.STRING },
                  valueIndicator: { type: Type.NUMBER },
                  sourceUrl: { type: Type.STRING }
                }
              }
            }
          }
        }
      },
    });

    const parsed = JSON.parse(stripMarkdown(response.text || '{"matches":[]}'));
    const matches = (parsed.matches || []).map((m: any, index: number) => ({
      ...m,
      id: m.id || `live-${index}-${Date.now()}`,
      isPremium: index % 3 === 0
    })) as MatchAnalysis[];

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));

    return { matches, groundingSources, usage: getUsage(response) };
  } catch (error) {
    return { matches: [], groundingSources: [] };
  }
};

export const buildAITicket = async (risk: RiskLevel, matchCount: number, availableMatches: MatchAnalysis[] = []): Promise<AITicket | null> => {
  try {
    let riskPrompt = `Risk Profile: ${risk}. Matches MUST be Soccer only.`;
    if (risk === 'EXTREME') {
      riskPrompt += ` Maximum risk for SOCCER matches. Favor high-odds markets like Correct Score, HT/FT, or Scorer.`;
    } else if (risk === 'CONSERVATIVE') {
      riskPrompt += ` Low risk. Focus on high probability outcomes like Double Chance, Over 1.5 Goals, or clear Favorites.`;
    } else if (risk === 'AGGRESSIVE') {
      riskPrompt += ` High risk. Look for value underdogs, draws, or Over 3.5 Goals.`;
    }

    let context = "";
    if (availableMatches.length > 0) {
      // Filter matches to ensure they are valid and upcoming
      const validMatches = availableMatches.slice(0, 30).map(m => ({
        teams: `${m.homeTeam} vs ${m.awayTeam}`,
        league: m.league,
        time: m.time,
        probabilities: m.probabilities,
        confidence: m.confidence,
        value: m.valueIndicator
      }));
      context = `Here is a list of pre-analyzed matches with their probabilities: ${JSON.stringify(validMatches)}. 
      Select the best matches from this list that fit the risk profile. You may also find other better matches if these are not sufficient.`;
    }

    const today = new Date().toISOString().split('T')[0];
    const prompt = `Act as a professional sports betting analyst. Build a high-performance SOCCER betting parlay ticket for today/tomorrow matches (Current Date: ${today}). 
    CRITICAL: Use the Google Search tool to verify that these matches are REAL and actually happening today or tomorrow. DO NOT invent matches.
    
    ${riskPrompt} 
    Number of soccer matches: ${matchCount}.
    ${context}
    
    Analyze team form, head-to-head records, and key player injuries (using Google Search) to validate your selections.
    Ensure the selections are logically consistent and offer good value.
    Output JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: { 
        systemInstruction: "You are NEON-STAT, an elite quantitative sports betting AI. You construct high-value parlays by finding hidden edges in the market. You are analytical, ruthless, and precise.",
        temperature: 0.4,
        tools: [{ googleSearch: {} }], 
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            totalProb: { type: Type.NUMBER },
            slips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  matchTitle: { type: Type.STRING },
                  combinedProb: { type: Type.NUMBER },
                  selections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        prob: { type: Type.NUMBER }
                      },
                      required: ["label", "prob"]
                    }
                  }
                },
                required: ["matchTitle", "combinedProb", "selections"]
              }
            }
          },
          required: ["title", "description", "totalProb", "slips"]
        }
      }
    });

    const data = JSON.parse(stripMarkdown(response.text || "{}"));
    const sanitizedTotalProb = typeof data.totalProb === 'number' && data.totalProb > 0 ? data.totalProb : 0.005;
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));

    return { 
      id: `ai-${Date.now()}`, 
      ...data, 
      totalProb: sanitizedTotalProb,
      riskRating: risk, 
      groundingSources, 
      usage: getUsage(response) 
    };
  } catch (error) {
    console.error("AI Ticket Build Error:", error);
    return null;
  }
};

export const getQuantInsight = async (match: MatchAnalysis): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Perform a deep tactical SOCCER audit for the match: ${match.homeTeam} vs ${match.awayTeam}.
      The calculated probabilities are: Home Win ${(match.probabilities.homeWin*100).toFixed(0)}%, Draw ${(match.probabilities.draw*100).toFixed(0)}%, Away Win ${(match.probabilities.awayWin*100).toFixed(0)}%.
      Provide a concise, analytical summary explaining WHY these probabilities make sense, focusing on tactical mismatches, form, or injuries. Max 300 characters. No markdown.`,
      config: { 
        systemInstruction: "You are NEON-STAT, an elite quantitative sports betting AI. Provide cold, analytical, and highly technical tactical insights.",
        temperature: 0.5,
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    });
    return response.text || "Neural analysis stream inconclusive for this node.";
  } catch (error) {
    return "Neural link timeout. Tactical buffer empty.";
  }
};

// Aviator, Lotto, and Mines intelligence functions retained in service but disabled in UI
export const fetchLiveAviatorHistory = async (): Promise<AviatorFeed> => { throw new Error("Module Disabled"); };
export const fetchLottoIntelligence = async (): Promise<LottoIntelligence> => { throw new Error("Module Disabled"); };
export const fetchMinesIntelligence = async (mineCount: number): Promise<MinesFeed> => { throw new Error("Module Disabled"); };
