import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Consultation } from "../models/consultation.model.js";
import { Response } from "../models/response.model.js";
import { Analysis } from "../models/analysis.model.js";
import { computeObjectiveStats, buildFrontendVisualizations } from "../services/aggregation.service.js";
import { generateCorrelationAnalysis } from "../services/llm.service.js";
import mongoose from "mongoose";

/**
 * @desc    Get objective chart stats + AI qualitative correlation analysis (Cached)
 * @route   GET /api/v1/consultations/:id/analytics
 * @access  Private (Admin / Lawmaker)
 */
export const getConsultationAnalytics = asyncHandler(async (req, res) => {
    const consultationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(consultationId)) {
        throw new ApiError(400, "Invalid consultation ID");
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
        throw new ApiError(404, "Consultation not found");
    }

    // 1. Fetch all responses submitted for this consultation
    const responses = await Response.find({ consultationId });

    // 2. Compute mathematical objective aggregations (Recharts ready)
    const objectiveStats = computeObjectiveStats(consultation, responses);

    // If no responses exist yet, return clean empty state without calling LLM
    if (responses.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    consultation: {
                        _id: consultation._id,
                        title: consultation.title,
                        category: consultation.category,
                        status: consultation.status,
                        questions: consultation.questions || [],
                        createdAt: consultation.createdAt,
                    },
                    totalResponses: 0,
                    objectiveStats,
                    analysis: null,
                    visualizations: null,
                    isCached: false,
                },
                "No citizen responses submitted yet for this consultation"
            )
        );
    }

    // 3. Check for fresh cached Analysis in MongoDB
    let analysis = await Analysis.findOne({ consultationId });
    let isCached = false;

    // Cache hit: analysis exists and response count has not grown
    if (analysis && analysis.responseCountAtGeneration === responses.length) {
        isCached = true;
    } else {
        // Cache miss: generate on-demand via Gemini and save to MongoDB
        const aiAnalysis = await generateCorrelationAnalysis(consultation, responses);

        analysis = await Analysis.findOneAndUpdate(
            { consultationId: consultation._id },
            {
                $set: {
                    generatedAt: new Date(),
                    responseCountAtGeneration: responses.length,
                    overallSentiment: aiAnalysis.overallSentiment || { positive: 0, neutral: 0, negative: 0 },
                    topThemes: aiAnalysis.topThemes || [],
                    themeAnalysis: aiAnalysis.themeAnalysis || [],
                    executiveSummary: aiAnalysis.executiveSummary || "",
                    actionableInsights: aiAnalysis.actionableInsights || [],
                    segmentBreakdown: aiAnalysis.segmentBreakdown || [],
                },
            },
            { upsert: true, new: true }
        );
    }

    // 4. Assemble ready-to-render frontend visualization bundles
    const visualizations = buildFrontendVisualizations(objectiveStats, analysis);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                consultation: {
                    _id: consultation._id,
                    title: consultation.title,
                    category: consultation.category,
                    status: consultation.status,
                    questions: consultation.questions || [],
                    createdAt: consultation.createdAt,
                },
                totalResponses: responses.length,
                objectiveStats,
                analysis,
                visualizations,
                isCached,
            },
            "Analytics and correlation insights retrieved successfully"
        )
    );
});

/**
 * @desc    Force re-run the LLM correlation analysis against current responses
 * @route   POST /api/v1/consultations/:id/analytics/regenerate
 * @access  Private (Admin only)
 */
export const regenerateAnalytics = asyncHandler(async (req, res) => {
    const consultationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(consultationId)) {
        throw new ApiError(400, "Invalid consultation ID");
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
        throw new ApiError(404, "Consultation not found");
    }

    const responses = await Response.find({ consultationId });
    if (responses.length === 0) {
        throw new ApiError(400, "Cannot run AI analysis without citizen responses");
    }

    // Force call Gemini
    const aiAnalysis = await generateCorrelationAnalysis(consultation, responses);

    // Update cache in MongoDB
    const analysis = await Analysis.findOneAndUpdate(
        { consultationId: consultation._id },
        {
            $set: {
                generatedAt: new Date(),
                responseCountAtGeneration: responses.length,
                overallSentiment: aiAnalysis.overallSentiment || { positive: 0, neutral: 0, negative: 0 },
                topThemes: aiAnalysis.topThemes || [],
                themeAnalysis: aiAnalysis.themeAnalysis || [],
                executiveSummary: aiAnalysis.executiveSummary || "",
                actionableInsights: aiAnalysis.actionableInsights || [],
                segmentBreakdown: aiAnalysis.segmentBreakdown || [],
            },
        },
        { upsert: true, new: true }
    );

    const objectiveStats = computeObjectiveStats(consultation, responses);
    const visualizations = buildFrontendVisualizations(objectiveStats, analysis);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                consultation: {
                    _id: consultation._id,
                    title: consultation.title,
                    category: consultation.category,
                    status: consultation.status,
                    questions: consultation.questions || [],
                    createdAt: consultation.createdAt,
                },
                totalResponses: responses.length,
                objectiveStats,
                analysis,
                visualizations,
                isCached: false,
            },
            "Analytics and correlation insights regenerated successfully"
        )
    );
});

