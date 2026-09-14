import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Consultation } from "../models/consultation.model.js";
import { extractPolicyText } from "../utils/fileExtractor.js";
import { generateQuestionsFromPolicy, translateConsultationContent, batchTranslateConsultationTitles } from "../services/llm.service.js";
import mongoose from "mongoose";

/**
 * @desc    AI Feature: Extract policy text from document/input & generate suggested questions
 * @route   POST /api/v1/consultations/generate-questions
 * @access  Private (Admin only)
 */
export const generateQuestions = asyncHandler(async (req, res) => {
    const rawText = req.body?.policyText || req.body?.text;
    const file = req.file || (Array.isArray(req.files) ? req.files[0] : null);

    // 1. Extract text from uploaded PDF/TXT or raw text input
    const extractedText = await extractPolicyText(file, rawText);

    // 2. Call Gemini to generate suggested questions & metadata
    const generatedData = await generateQuestionsFromPolicy(extractedText);

    return res.status(200).json(
        new ApiResponse(
            200,
            generatedData,
            "Policy analyzed and suggested questions generated successfully"
        )
    );
});

/**
 * @desc    Create a new consultation with approved/custom questions
 * @route   POST /api/v1/consultations
 * @access  Private (Admin only)
 */
export const createConsultation = asyncHandler(async (req, res) => {
    const { title, description, category, questions = [], status = "open" } = req.body;
    const finalDescription = (description || req.body?.summary || "").trim();

    if (!title?.trim() || !finalDescription || !category?.trim()) {
        throw new ApiError(400, "Title, description (or summary), and category are required");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
        throw new ApiError(400, "At least one question is required to publish a consultation");
    }

    // Validate each question structure
    const validatedQuestions = questions.map((q, idx) => {
        if (!q.text?.trim()) {
            throw new ApiError(400, `Question at position ${idx + 1} must have valid text prompt`);
        }
        if (!["text", "single_choice", "multi_choice"].includes(q.type)) {
            throw new ApiError(400, `Invalid type for question "${q.text}". Must be 'text', 'single_choice', or 'multi_choice'`);
        }
        if (["single_choice", "multi_choice"].includes(q.type) && (!Array.isArray(q.options) || q.options.length < 2)) {
            throw new ApiError(400, `Choice-based question "${q.text}" must have at least 2 options`);
        }

        return {
            questionId: q.questionId || `q_${idx + 1}_${Date.now()}`,
            text: q.text.trim(),
            type: q.type,
            options: q.type === "text" ? [] : q.options.map(opt => String(opt).trim()),
            required: Boolean(q.required),
        };
    });

    const consultation = await Consultation.create({
        title: title.trim(),
        description: finalDescription,
        category: category.trim(),
        status,
        questions: validatedQuestions,
        createdBy: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                ...consultation.toObject(),
                consultation,
            },
            "Consultation created and published successfully"
        )
    );
});

/**
 * @desc    Get all consultations with optional status and category filters
 * @route   GET /api/v1/consultations
 * @access  Public
 */
export const getAllConsultations = asyncHandler(async (req, res) => {
    const { status, category, search, q, lang } = req.query;

    const filter = {};
    if (status) {
        filter.status = status;
    }

    if (category?.trim()) {
        filter.category = new RegExp(category.trim(), "i");
    }

    const searchTerm = (search || q || "").trim();
    if (searchTerm) {
        filter.$or = [
            { title: new RegExp(searchTerm, "i") },
            { description: new RegExp(searchTerm, "i") },
        ];
    }

    const consultations = await Consultation.find(filter)
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 })
        .lean();

    // Attach response counts to each consultation
    const consultationIds = consultations.map(c => c._id);
    const { Response } = await import("../models/response.model.js");
    const counts = await Response.aggregate([
        { $match: { consultationId: { $in: consultationIds } } },
        { $group: { _id: "$consultationId", count: { $sum: 1 } } }
    ]);

    const countMap = new Map(counts.map(item => [item._id.toString(), item.count]));

    // If a regional language is requested (e.g. 'te', 'hi', 'ta', 'mr', 'bn')
    const targetLang = lang && lang !== "en" ? lang : null;
    let translatedMap = new Map();

    if (targetLang && consultations.length > 0) {
        // Identify any consultations missing translation in targetLang
        const missing = [];
        consultations.forEach(c => {
            const tr = c.translations && c.translations[targetLang];
            if (tr?.title) {
                translatedMap.set(c._id.toString(), tr);
            } else {
                missing.push(c);
            }
        });

        if (missing.length > 0) {
            try {
                const batchTranslated = await batchTranslateConsultationTitles(missing, targetLang);
                for (const item of batchTranslated) {
                    translatedMap.set(item.id, item);
                    // Persist to DB for instant future repeat loads
                    Consultation.findByIdAndUpdate(item.id, {
                        $set: {
                            [`translations.${targetLang}.title`]: item.title,
                            [`translations.${targetLang}.description`]: item.description,
                            [`translations.${targetLang}.category`]: item.category,
                        },
                    }).catch(err => console.error("Error saving title translation:", err.message));
                }
            } catch (err) {
                console.error("Batch title translation error:", err.message);
            }
        }
    }

    const consultationsWithCounts = consultations.map(c => {
        const idStr = c._id.toString();
        const tr = targetLang ? translatedMap.get(idStr) || (c.translations && c.translations[targetLang]) : null;

        return {
            ...c,
            title: tr?.title || c.title,
            category: tr?.category || c.category,
            description: tr?.description || c.description,
            originalTitle: c.title,
            responseCount: countMap.get(idStr) || 0,
        };
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                consultations: consultationsWithCounts,
            },
            "Consultations retrieved successfully"
        )
    );
});

/**
 * @desc    Get single consultation by ID for dynamic form rendering
 * @route   GET /api/v1/consultations/:id
 * @access  Public
 */
export const getConsultationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid consultation ID");
    }

    const consultation = await Consultation.findById(id).populate("createdBy", "name email role");

    if (!consultation) {
        throw new ApiError(404, "Consultation not found");
    }

    return res.status(200).json(
        new ApiResponse(200, consultation, "Consultation fetched successfully")
    );
});

/**
 * @desc    Update consultation details, status, or questions
 * @route   PATCH /api/v1/consultations/:id
 * @access  Private (Admin only)
 */
export const updateConsultation = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid consultation ID");
    }

    const consultation = await Consultation.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if (!consultation) {
        throw new ApiError(404, "Consultation not found");
    }

    return res.status(200).json(
        new ApiResponse(200, consultation, "Consultation updated successfully")
    );
});

/**
 * @desc    Delete a consultation
 * @route   DELETE /api/v1/consultations/:id
 * @access  Private (Admin only)
 */
export const deleteConsultation = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid consultation ID");
    }

    const consultation = await Consultation.findByIdAndDelete(id);

    if (!consultation) {
        throw new ApiError(404, "Consultation not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Consultation deleted successfully")
    );
});

/**
 * @desc    Get or generate on-demand translation of a consultation into regional language
 * @route   POST /api/v1/consultations/:id/translate
 * @access  Public
 */
export const translateConsultation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { targetLang } = req.body;

    if (!targetLang) {
        throw new ApiError(400, "targetLang is required (e.g. 'hi', 'te', 'ta', 'mr', 'bn')");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid consultation ID");
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
        throw new ApiError(404, "Consultation not found");
    }

    if (targetLang === "en") {
        return res.status(200).json(
            new ApiResponse(200, {
                title: consultation.title,
                description: consultation.description,
                category: consultation.category,
                questions: consultation.questions,
                cached: true,
            }, "English content returned")
        );
    }

    // 1. Check if translation is already cached in MongoDB
    if (consultation.translations && typeof consultation.translations.get === "function" && consultation.translations.get(targetLang)) {
        const cached = consultation.translations.get(targetLang);
        return res.status(200).json(
            new ApiResponse(200, {
                title: cached.title,
                description: cached.description,
                category: cached.category,
                questions: cached.questions,
                cached: true,
            }, `Translation retrieved from cache (${targetLang})`)
        );
    }

    // 2. Not cached: invoke Gemini to translate
    const translatedContent = await translateConsultationContent(consultation, targetLang);

    // 3. Cache translation in MongoDB for instant future loads
    try {
        if (!consultation.translations) {
            consultation.translations = new Map();
        }
        consultation.translations.set(targetLang, translatedContent);
        await consultation.save();
    } catch (saveErr) {
        console.error("Failed to cache translation in MongoDB:", saveErr.message);
    }

    return res.status(200).json(
        new ApiResponse(200, {
            ...translatedContent,
            cached: false,
        }, `Translation generated and cached successfully (${targetLang})`)
    );
});

/**
 * @desc    AI Feature: Translate a draft consultation before it is published
 * @route   POST /api/v1/consultations/translate-draft
 * @access  Private (Admin only)
 */
export const translateDraftContent = asyncHandler(async (req, res) => {
    const { title, description, summary, category, questions = [], targetLang } = req.body;

    if (!targetLang) {
        throw new ApiError(400, "targetLang is required");
    }

    const translated = await translateConsultationContent(
        {
            title: title || "Public Consultation",
            description: description || summary || "Public policy briefing",
            category: category || "Public Policy",
            questions,
        },
        targetLang
    );

    return res.status(200).json(
        new ApiResponse(200, translated, `Draft translated to ${targetLang} successfully`)
    );
});

