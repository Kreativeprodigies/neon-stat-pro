import { MatchAnalysis, AITicket, RiskLevel, BuiltSlip, MatchFeed, LottoIntelligence, AviatorFeed, MinesFeed, UsageMetadata } from "../types";

// ------------------------------------------------------------------
//  Hugging Face client (no external library, direct fetch)
// ------------------------------------------------------------------

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || "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";
const HF_BASE_URL = "https://api-inference.huggingface.co/v1/chat/completions";

// Default models
const DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";
const TICKET_MODEL = "meta-llama/Llama-3.1-70B-Instruct"; // requires PRO subscription or higher

// ------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------

const stripMarkdown = (text: string) => {
  return text.replace(/```json\n?|\n?```/g, "").trim();
};

// Rough token estimation (4 chars per token)
const estimateUsage = (text: string, system?: string): UsageMetadata => {
  const promptTokens = (system?.length || 0) / 4 + 30;
  const completionTokens = text.length / 4;
  return {
    promptTokens: Math.round(promptTokens),
    candidatesTokens: Math.round(completionTokens),
    totalTokens: Math.round(promptTokens + completionTokens),
  };
};

// ------------------------------------------------------------------
//  Core Hugging Face chat completion call
// ------------------------------------------------------------------

async function callHuggingFace(
  userPrompt: string,
  systemInstruction?: string,
  temperature: number = 0.2,
  model: string = DEFAULT_MODEL,
  jsonResponse: boolean = true
): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY is not set in environment variables.");
  }

  // Build messages
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  // For JSON output, we append a strong directive to the user prompt
  const finalPrompt = jsonResponse
    ? `${userPrompt}\n\nIMPORTANT: Output ONLY valid JSON, no other text, no markdown.`
    : userPrompt;
  messages.push({ role: "user", content: finalPrompt });

  const payload = {
    model,
    messages,
    temperature,
    max_tokens: 4096,
    // Some models support response_format; we include it but it may be ignored
    ...(jsonResponse ? { response_format: { type: "json_object" } } : {}),
  };

  try {
    const response = await fetch(HF_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Hugging Face model");
    }
    return content;
  } catch (error) {
    console.error("Hugging Face call error:", error);
    throw error;
  }
}

// ------------------------------------------------------------------
//  Exported functions (matching original signatures)
// ------------------------------------------------------------------

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

    // Grounding sources not available without search tool
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

// ------------------------------------------------------------------
//  Disabled legacy modules (kept for compatibility)
// ------------------------------------------------------------------

export const fetchLiveAviatorHistory = async (): Promise<AviatorFeed> => {
  throw new Error("Module Disabled");
};

export const fetchLottoIntelligence = async (): Promise<LottoIntelligence> => {
  throw new Error("Module Disabled");
};

export const fetchMinesIntelligence = async (mineCount: number): Promise<MinesFeed> => {
  throw new Error("Module Disabled");
};
