import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Response } from "../models/response.model.js";
import { Consultation } from "../models/consultation.model.js";
import mongoose from "mongoose";

/**
 * @desc    Submit citizen response/feedback to a consultation
 * @route   POST /api/v1/consultations/:id/responses
 * @access  Public / Optional Citizen Auth
 */
export const submitResponse = asyncHandler(async (req, res) => {
    const consultationId = req.params.id || req.params.consultationId;
    const { answers = [] } = req.body;

    if (!mongoose.Types.ObjectId.isValid(consultationId)) {
        throw new ApiError(400, "Invalid consultation ID");
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
        throw new ApiError(404, "Consultation not found");
    }

    if (consultation.status !== "open") {
        throw new ApiError(
            409,
            `This consultation is currently ${consultation.status} and is not accepting citizen feedback`
        );
    }

    if (!Array.isArray(answers) || answers.length === 0) {
        throw new ApiError(400, "Answers must be a non-empty array of responses");
    }

    // Map provided answers by questionId for fast lookup
    const answerMap = new Map();
    answers.forEach((ans) => {
        if (ans.questionId) {
            answerMap.set(ans.questionId, ans.value);
        }
    });

    const validatedAnswers = [];

    // Validate against the consultation's dynamic questions schema
    for (const question of consultation.questions) {
        const val = answerMap.get(question.questionId);

        // Check required validation
        if (question.required) {
            const isEmptyString = typeof val === "string" && val.trim().length === 0;
            const isEmptyArray = Array.isArray(val) && val.length === 0;
            const isNullOrUndef = val === null || val === undefined;

            if (isNullOrUndef || isEmptyString || isEmptyArray) {
                throw new ApiError(
                    400,
                    `Missing required question: "${question.text}" (ID: ${question.questionId})`
                );
            }
        }

        // If an answer was supplied, format it cleanly
        if (val !== null && val !== undefined) {
            if (question.type === "multi_choice") {
                const arrVal = Array.isArray(val) ? val : [val];
                validatedAnswers.push({
                    questionId: question.questionId,
                    value: arrVal.map(v => String(v).trim()),
                });
            } else {
                validatedAnswers.push({
                    questionId: question.questionId,
                    value: String(val).trim(),
                });
            }
        }
    }

    // Associate citizenId if logged in; otherwise null for anonymous submission
    const citizenId = req.user?._id || null;

    const newResponse = await Response.create({
        consultationId: consultation._id,
        citizenId,
        answers: validatedAnswers,
        submittedAt: new Date(),
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            newResponse,
            "Feedback submitted successfully! Thank you for participating."
        )
    );
});

/**
 * @desc    Get all raw responses for a consultation (for admin audit/drill-down table)
 * @route   GET /api/v1/consultations/:id/responses
 * @access  Private (Admin only)
 */
export const getConsultationResponses = asyncHandler(async (req, res) => {
    const consultationId = req.params.id || req.params.consultationId;

    if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
        throw new ApiError(
            400,
            `Valid consultation ID is required in URL (e.g. /api/v1/consultations/<id>/responses). Received: "${consultationId}"`
        );
    }

    // 1. Fetch consultation to verify existence and ownership
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
        throw new ApiError(404, "Consultation not found");
    }

    // 2. Creator Ownership or Admin Role Check
    const isAuthorized = consultation.createdBy.equals(req.user._id) || req.user.role === "admin";
    if (!isAuthorized) {
        throw new ApiError(
            403,
            "Access denied: Administrative privileges required to view raw responses"
        );
    }

    // 3. Paginated responses with search & filter support
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const search = (req.query.search || "").trim();
    const filterQuestionId = (req.query.filterQuestionId || "").trim();
    const filterValue = (req.query.filterValue || "").trim();

    const filter = { consultationId };

    if (filterQuestionId && filterValue) {
        filter["answers"] = {
            $elemMatch: {
                questionId: filterQuestionId,
                value: filterValue,
            },
        };
    }

    if (search) {
        filter.$or = [
            { "answers.value": new RegExp(search, "i") },
        ];
    }

    const total = await Response.countDocuments(filter);
    const responses = await Response.find(filter)
        .populate("citizenId", "name email role")
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                consultation: {
                    _id: consultation._id,
                    title: consultation.title,
                    category: consultation.category,
                    status: consultation.status,
                    totalQuestions: consultation.questions?.length || 0,
                    questions: consultation.questions || [],
                },
                totalResponses: total,
                page,
                totalPages: Math.ceil(total / limit) || 1,
                responses,
            },
            "Responses retrieved successfully"
        )
    );
});
