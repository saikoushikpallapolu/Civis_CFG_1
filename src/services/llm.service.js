import { ApiError } from "../utils/ApiError.js";

const GEMINI_MODEL = "gemini-3.6-flash";

/**
 * Helper to call Gemini REST API with JSON response enforcement
 */
async function callGemini(promptText) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, "GEMINI_API_KEY is not configured in server environment");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: promptText }],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.4,
            },
        }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new ApiError(
            502,
            `Gemini API call failed (${response.status}): ${errData.error?.message || "Unknown error"}`
        );
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
        throw new ApiError(502, "Gemini returned an empty response");
    }

    try {
        return JSON.parse(rawContent);
    } catch (parseErr) {
        throw new ApiError(500, "Failed to parse structured JSON from LLM response");
    }
}

/**
 * Analyze policy document text and generate suggested consultation questions.
 * Produces both objective (MCQ) and subjective (free-text) questions.
 * @param {string} policyText - Raw text extracted from document or pasted by admin
 * @returns {Promise<Object>} Formatted consultation draft with suggested questions
 */
export async function generateQuestionsFromPolicy(policyText) {
    if (!policyText || policyText.trim().length < 20) {
        throw new ApiError(400, "Policy document text is too short to generate meaningful consultation questions");
    }

    // Limit text length to prevent excessive tokens (first 25,000 characters is plenty for a consultation)
    const truncatedText = policyText.slice(0, 25000);

    const prompt = `
You are an expert civic policy communicator for Civis, an official citizen consultation and public feedback platform.
A government official has uploaded a policy document to create a public consultation for ordinary citizens.

Analyze the policy document below and generate a structured consultation form that ANY citizen can easily understand:
1. "title": An engaging, crystal-clear, plain-language title (max 6 to 10 words).
   - CRITICAL: Do NOT use complex legalistic phrases, act numbers, gazette codes, or bureaucratic jargon.
   - Good examples: "Cleaner Air in City Centers: Vehicle Rules 2026", "Solar Power for Municipal Schools", "Safer Walking & Cycling Corridors".
   - Bad examples: "S.O. 412(E) Implementation Directive under National Ambient Standards Act".
2. "summary": A simple, compelling 2-sentence explanation in plain English. State clearly what is proposed and how citizen opinion will influence the final decision.
3. "category": A clean, standardized civic portfolio name (e.g., "Environment & Climate", "Urban Infrastructure & Transport", "Public Health", "Digital Governance", "Education").
4. "questions": 4 to 6 balanced, unbiased consultation questions in simple, everyday language:
   - Objective questions ("single_choice" or "multi_choice"): For measuring quantitative sentiment. Provide 3-5 intuitive options.
   - Subjective questions ("text"): For gathering qualitative feedback, local community issues, and suggestions. Options must be an empty array [].

Each question object MUST follow this exact schema:
{
  "questionId": "q1",
  "text": "Clear, plain-language question prompt without confusing jargon",
  "type": "single_choice" | "multi_choice" | "text",
  "options": ["Option A", "Option B"] or [],
  "required": true | false
}

Respond ONLY with valid JSON matching this schema:
{
  "title": "string",
  "summary": "string",
  "category": "string",
  "questions": [
    {
      "questionId": "string",
      "text": "string",
      "type": "single_choice" | "multi_choice" | "text",
      "options": ["string"],
      "required": true
    }
  ]
}

POLICY DOCUMENT CONTENT:
"""
${truncatedText}
"""
`;

    return await callGemini(prompt);
}

/**
 * AI Correlation Engine:
 * Analyzes structured objective answers and free-text opinions to produce:
 * 1. Overall sentiment distribution (% positive, neutral, negative)
 * 2. Top recurring themes
 * 3. Executive summary for policymakers
 * 4. Segmented correlation breakdown (slicing text comments by MCQ options)
 * @param {Object} consultation - Consultation document with questions definition
 * @param {Array} responses - Array of citizen response documents
 * @returns {Promise<Object>} Structured analysis document ready for frontend charts & cards
 */
export async function generateCorrelationAnalysis(consultation, responses) {
    if (!responses || responses.length === 0) {
        throw new ApiError(400, "Cannot generate analysis without citizen responses");
    }

    // Build a compact summary of questions
    const questionCatalog = consultation.questions.map((q) => ({
        questionId: q.questionId,
        text: q.text,
        type: q.type,
        options: q.options || [],
    }));

    // Package citizen submissions in a concise format for the LLM
    // Sample if large (cap at 60 responses to stay well within token limits)
    const sampledResponses = responses.slice(0, 60).map((r, idx) => {
        const citizenAnswers = {};
        (r.answers || []).forEach((a) => {
            citizenAnswers[a.questionId] = a.value;
        });
        return {
            id: `Respondent_${idx + 1}`,
            answers: citizenAnswers,
        };
    });

    const prompt = `
You are the AI Chief Analyst for the Civis Citizen Feedback Analytics Platform.
Your mission is to bridge the gap between objective multiple-choice choices and subjective free-text comments to produce decision-ready insights for lawmakers.

CONSULTATION CONTEXT:
Title: "${consultation.title}"
Category: "${consultation.category}"
Description: "${consultation.description}"

QUESTION DEFINITIONS:
${JSON.stringify(questionCatalog, null, 2)}

CITIZEN RESPONSES (${responses.length} total, showing sample of ${sampledResponses.length}):
${JSON.stringify(sampledResponses, null, 2)}

TASK:
Analyze all citizen submissions and generate a comprehensive synthesis matching this EXACT JSON schema:
{
  "overallSentiment": {
    "positive": 65,  // Integer percentage (0-100)
    "neutral": 20,   // Integer percentage (0-100)
    "negative": 15   // Integer percentage (0-100, sum should roughly equal 100)
  },
  "topThemes": [
    "Theme 1 (e.g. Reduced Commute Times)",
    "Theme 2 (e.g. Fare Affordability)",
    "Theme 3 (e.g. Last-Mile Safety)"
  ],
  "themeAnalysis": [
    {
      "theme": "Reduced Commute Times",
      "sentiment": "positive", // "positive", "neutral", "negative", or "mixed"
      "prevalence": 75, // Percentage of respondents (0-100) touching upon this theme
      "description": "Majority of respondents praise the proposed dedicated rapid transit lines."
    }
  ],
  "executiveSummary": "A concise 2-3 sentence executive summary of citizen feedback highlighting consensus and primary points of contention for policymakers.",
  "actionableInsights": [
    {
      "recommendation": "Deploy GPS real-time bus tracking before fare adjustments",
      "priority": "High", // "High", "Medium", or "Low"
      "area": "Passenger Experience & Technology"
    }
  ],
  "segmentBreakdown": [
    {
      "questionId": "q1", // The objective questionId being analyzed
      "option": "Strongly Support", // The specific option selected
      "sentiment": {
        "positive": 90,
        "neutral": 10,
        "negative": 0
      },
      "themes": [
        "Faster travel",
        "Environmental benefit"
      ],
      "summary": "Supporters overwhelmingly believe dedicated corridors will reduce congestion.",
      "sampleQuotes": [
        "Up to 2 verbatim or representative citizen quotes (under 20 words) from citizens who picked this option."
      ]
    }
  ]
}

CRITICAL RULES:
- "themeAnalysis": extract 3-5 major themes with their sentiment and prevalence percentage (for rendering frontend theme bar charts).
- "actionableInsights": provide 2-4 concrete, prioritized policy recommendations synthesized from citizen comments.
- "segmentBreakdown": For each major objective question, produce an entry for each major option that received responses. Correlate what citizens who picked THAT specific option wrote in their text comments. Show WHY people disagree, not just that they disagree.
- Return ONLY valid JSON matching the schema above.
`;

    return await callGemini(prompt);
}

const LANGUAGE_NAMES = {
    hi: "Hindi (हिंदी)",
    te: "Telugu (తెలుగు)",
    ta: "Tamil (தமிழ்)",
    mr: "Marathi (मराठी)",
    bn: "Bengali (বাংলা)",
    en: "English",
};

/**
 * Translate consultation title, description, and questions into an Indian regional language.
 * Preserves exact questionId and choice order so responses can be mapped deterministically.
 * @param {Object} consultation - Consultation document or object
 * @param {string} targetLang - Target language code ('hi' | 'te' | 'ta' | 'mr' | 'bn')
 * @returns {Promise<Object>} Translated consultation content
 */
export async function translateConsultationContent(consultation, targetLang) {
    const langName = LANGUAGE_NAMES[targetLang] || targetLang;

    const payloadToTranslate = {
        title: consultation.title,
        description: consultation.description,
        category: consultation.category,
        questions: (consultation.questions || []).map((q) => ({
            questionId: q.questionId,
            text: q.text,
            options: q.options || [],
        })),
    };

    const prompt = `
You are a certified, professional civic translator specializing in official Indian governance and public policy communication.
Translate the following public policy consultation into **${langName}**.

REQUIREMENTS:
1. Translate "title": Make it simple, clear, engaging, and in natural everyday ${langName} without convoluted jargon.
2. Translate "description": Translate the statement of intent / summary clearly so any citizen reading ${langName} can easily comprehend the proposed bill.
3. Translate "category": Translate into the standard ${langName} governmental portfolio term.
4. Translate each item in "questions":
   - Translate the "text" prompt into natural ${langName}.
   - Translate each string in "options" into ${langName}.
   - CRITICAL: KEEP "questionId" EXACTLY AS-IS without altering it.
   - PRESERVE the exact array order of questions and options.

JSON TO TRANSLATE:
${JSON.stringify(payloadToTranslate, null, 2)}

Respond ONLY with valid JSON matching this exact structure:
{
  "title": "translated title in ${langName}",
  "description": "translated description in ${langName}",
  "category": "translated category in ${langName}",
  "questions": [
    {
      "questionId": "exact original questionId",
      "text": "translated question prompt in ${langName}",
      "options": ["translated option 1 in ${langName}", "translated option 2 in ${langName}"]
    }
  ]
}
`;

    return await callGemini(prompt);
}

/**
 * Fast batch translation for a list of consultation titles, descriptions, and categories.
 * Used for instant multilingual rendering on the home page, citizen dashboard, and admin table.
 * @param {Array<Object>} items - Array of { id, title, description, category }
 * @param {string} targetLang - Target language code ('hi' | 'te' | 'ta' | 'mr' | 'bn')
 * @returns {Promise<Array<Object>>} Translated items matching input ids
 */
export async function batchTranslateConsultationTitles(items, targetLang) {
    if (!items || items.length === 0) return [];
    const langName = LANGUAGE_NAMES[targetLang] || targetLang;

    const payload = items.map(it => ({
        id: String(it._id || it.id),
        title: it.title,
        description: it.description?.slice(0, 300) || "",
        category: it.category,
    }));

    const prompt = `
You are a professional civic translator for the Government of India.
Translate the titles, descriptions, and categories of the following public policy consultations into **${langName}**.

REQUIREMENTS:
1. "title": Simple, crystal-clear, plain-language translation in ${langName}.
2. "description": Concise, clear translation in ${langName}.
3. "category": Standard civic portfolio name in ${langName}.
4. Keep the exact "id" corresponding to each item.

CONSULTATIONS TO TRANSLATE:
${JSON.stringify(payload, null, 2)}

Respond ONLY with a valid JSON array matching this schema:
[
  {
    "id": "item id",
    "title": "translated title in ${langName}",
    "description": "translated description in ${langName}",
    "category": "translated category in ${langName}"
  }
]
`;

    try {
        const result = await callGemini(prompt);
        return Array.isArray(result) ? result : [];
    } catch (err) {
        console.error("Batch title translation failed:", err.message);
        return [];
    }
}


