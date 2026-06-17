import { HfInference } from "@huggingface/inference";
import { MatchAnalysis, AITicket, RiskLevel, BuiltSlip, MatchFeed, LottoIntelligence, AviatorFeed, MinesFeed, UsageMetadata } from "../types";

// Initialize Hugging Face Inference client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

// Default model – can be overridden per use case
const DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";
// For heavier tasks use a larger model if available
const TICKET_MODEL = "meta-llama/Llama-3.1-70B-Instruct"; // requires PRO subscription or higher

// Helper: strip markdown code fences
const stripMarkdown = (text: string) => {
  return text.replace(/```json\n?|\n?```/g, "").trim();
};

// Helper: estimate token usage (rough approximation)
const estimateUsage = (text: string, system?: string): UsageMetadata => {
  const promptTokens = (system?.length || 0) / 4 + 30; // crude
  const completionTokens = text.length / 4;
  return {
    promptTokens: Math.round(promptTokens),
    candidatesTokens: Math.round(completionTokens),
    totalTokens: Math.round(promptTokens + completionTokens),
  };
};

// Generic call to Hugging Face text generation
async function callHuggingFace(
  userPrompt: string,
  systemInstruction?: string,
  temperature: number = 0.2,
  model: string = DEFAULT_MODEL,
  jsonResponse: boolean = true
): Promise<string> {
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: userPrompt });

  // For JSON output, ask the model to respond only with valid JSON
  const finalPrompt = jsonResponse
    ? `${userPrompt}\n\nIMPORTANT: Output ONLY valid JSON, no other text.`
    : userPrompt;

  try {
    const response = await hf.chatCompletion({
      model,
      messages: [
        ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
        { role: "user", content: finalPrompt },
      ],
      temperature,
      max_tokens: 4096,
      response_format: jsonResponse ? { type: "json_object" } : undefined, // supported by some models
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Hugging Face call error:", error);
    throw error;
  }
}

export const fetchLiveMatches = async (): Promise<MatchFeed> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `CRITICAL INSTRUCTION: You must use your knowledge to find the REAL, ACTUAL soccer schedule for today (${today}) and tomorrow. DO NOT hallucinate or invent matches.

    Find 15 major upcoming or live top-tier SOCCER (Football) matches for today and tomorrow. 
    Strictly include soccer leagues only: Premier League, La Liga, Serie A, Bundesliga, Champions League, and South African PSL.
    
    For each match:
    1. Analyze recent team form (last 5 matches).
    2. Check head-to-head records.
    3. Consider home/away advantage.
    4. Calculate win/draw/loss probabilities based on this analysis.
    5. Estimate "confidence" based on the predictability of the match.
    6. Identify "value" where your calculated probability is higher than typical market odds.
    
    DO NOT include any other sports. Provide full probabilities and confidence scores. Output JSON in the exact schema:
    {
      "matches": [
        {
          "id": "string",
          "league": "string",
          "homeTeam": "string",
          "awayTeam": "string",
          "time": "string",
          "probabilities": {
            "homeWin": number,
            "draw": number,
            "awayWin": number,
            "over15": number,
            "over25": number,
            "bothToScore": number
          },
          "confidence": number,
          "volatility": "string",
          "valueIndicator": number,
          "sourceUrl": "string"
        }
      ]
    }`;

    const system = "You are NEON-STAT, an elite quantitative sports betting AI. You analyze soccer matches with cold, calculated precision. You focus on data, form, and tactical mismatches.";

    const responseText = await callHuggingFace(prompt, system, 0.2, DEFAULT_MODEL, true);
    const parsed = JSON.parse(stripMarkdown(responseText) || '{"matches":[]}');
    const matches = (parsed.matches || []).map((m: any, index: number) => ({
      ...m,
      id: m.id || `live-${index}-${Date.now()}`,
      isPremium: index % 3 === 0
    })) as MatchAnalysis[];

    // No grounding sources without search tool
    return {
      matches,
      groundingSources: [],
      usage: estimateUsage(responseText, system)
    };
  } catch (error) {
    console.error("fetchLiveMatches error:", error);
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
    CRITICAL: Use your knowledge to verify that these matches are REAL and actually happening today or tomorrow. DO NOT invent matches.
    
    ${riskPrompt} 
    Number of soccer matches: ${matchCount}.
    ${context}
    
    Analyze team form, head-to-head records, and key player injuries (using your knowledge) to validate your selections.
    Ensure the selections are logically consistent and offer good value.
    
    Output JSON in the exact schema:
    {
      "title": "string",
      "description": "string",
      "totalProb": number,
      "slips": [
        {
          "matchTitle": "string",
          "combinedProb": number,
          "selections": [
            { "label": "string", "prob": number }
          ]
        }
      ]
    }`;

    const system = "You are NEON-STAT, an elite quantitative sports betting AI. You construct high-value parlays by finding hidden edges in the market. You are analytical, ruthless, and precise.";

    const responseText = await callHuggingFace(prompt, system, 0.4, TICKET_MODEL, true);
    const data = JSON.parse(stripMarkdown(responseText) || "{}");
    const sanitizedTotalProb = typeof data.totalProb === 'number' && data.totalProb > 0 ? data.totalProb : 0.005;

    return {
      id: `ai-${Date.now()}`,
      ...data,
      totalProb: sanitizedTotalProb,
      riskRating: risk,
      groundingSources: [], // no search tool
      usage: estimateUsage(responseText, system)
    };
  } catch (error) {
    console.error("AI Ticket Build Error:", error);
    return null;
  }
};

export const getQuantInsight = async (match: MatchAnalysis): Promise<string> => {
  try {
    const prompt = `Perform a deep tactical SOCCER audit for the match: ${match.homeTeam} vs ${match.awayTeam}.
    The calculated probabilities are: Home Win ${(match.probabilities.homeWin*100).toFixed(0)}%, Draw ${(match.probabilities.draw*100).toFixed(0)}%, Away Win ${(match.probabilities.awayWin*100).toFixed(0)}%.
    Provide a concise, analytical summary explaining WHY these probabilities make sense, focusing on tactical mismatches, form, or injuries. Max 300 characters. No markdown.`;

    const system = "You are NEON-STAT, an elite quantitative sports betting AI. Provide cold, analytical, and highly technical tactical insights.";

    const responseText = await callHuggingFace(prompt, system, 0.5, DEFAULT_MODEL, false);
    return responseText || "Neural analysis stream inconclusive for this node.";
  } catch (error) {
    console.error("getQuantInsight error:", error);
    return "Neural link timeout. Tactical buffer empty.";
  }
};

// Aviator, Lotto, and Mines intelligence functions retained in service but disabled in UI
export const fetchLiveAviatorHistory = async (): Promise<AviatorFeed> => { throw new Error("Module Disabled"); };
export const fetchLottoIntelligence = async (): Promise<LottoIntelligence> => { throw new Error("Module Disabled"); };
export const fetchMinesIntelligence = async (mineCount: number): Promise<MinesFeed> => { throw new Error("Module Disabled"); };
