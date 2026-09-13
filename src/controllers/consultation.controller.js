import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Consultation } from "../models/consultation.model.js";
import { extractPolicyText } from "../utils/fileExtractor.js";
import { generateQuestionsFromPolicy } from "../services/llm.service.js";
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
        new ApiResponse(201, consultation, "Consultation created and published successfully")
    );
});

/**
 * @desc    Get all consultations with optional status and category filters
 * @route   GET /api/v1/consultations
 * @access  Public
 */
export const getAllConsultations = asyncHandler(async (req, res) => {
    const { status, category } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, "i");

    const consultations = await Consultation.find(filter)
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, consultations, "Consultations retrieved successfully")
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
