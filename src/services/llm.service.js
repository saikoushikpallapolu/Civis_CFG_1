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
You are an expert civic policy advisor for Civis, an Indian citizen consultation and feedback analytics platform.
A government official or foundation admin has uploaded the following policy document to create a public consultation.

Analyze the policy document below and generate a structured consultation form.
The form must include:
1. "title": A concise, citizen-friendly public consultation title.
2. "summary": A clear 2-3 sentence overview explaining what the policy proposes and why citizen feedback is needed.
3. "category": The most appropriate category (e.g., "Urban Mobility & Transport", "Environment & Pollution", "Public Health", "Education", "Civic Infrastructure", "Digital Governance").
4. "questions": A curated list of 4 to 6 questions balanced between:
   - Objective questions ("single_choice" or "multi_choice"): For measuring quantitative support, agreement levels, frequency, or demographic usage. Each must provide 3-5 distinct options (e.g. ["Strongly Support", "Support", "Neutral", "Oppose", "Strongly Oppose"]).
   - Subjective questions ("text"): For gathering qualitative feedback, specific local concerns, reasons for dissent, or alternative suggestions. Options must be an empty array [].
   
Each question object MUST follow this exact schema:
{
  "questionId": "q1", // unique string (q1, q2, q3...)
  "text": "Clear, unbiased question prompt",
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
