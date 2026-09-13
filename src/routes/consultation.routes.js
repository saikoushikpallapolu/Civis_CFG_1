import { Router } from "express";
import {
    generateQuestions,
    createConsultation,
    getAllConsultations,
    getConsultationById,
    updateConsultation,
    deleteConsultation,
} from "../controllers/consultation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    submitResponse,
    getConsultationResponses,
} from "../controllers/response.controller.js";
import {
    getConsultationAnalytics,
    regenerateAnalytics,
} from "../controllers/analytics.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// 1. AI Feature: Generate suggested questions from policy document upload or text
router
    .route("/generate-questions")
    .post(verifyJWT, requireRole("admin"), upload.any(), generateQuestions);

// 2. Consultation CRUD routes
router
    .route("/")
    .get(getAllConsultations)
    .post(verifyJWT, requireRole("admin"), createConsultation);

router
    .route("/:id")
    .get(getConsultationById)
    .patch(verifyJWT, requireRole("admin"), updateConsultation)
    .delete(verifyJWT, requireRole("admin"), deleteConsultation);

// 3. Citizen Response Submissions & Admin Responses View
router
    .route("/:id/responses")
    .post(optionalAuth, submitResponse)
    .get(verifyJWT, requireRole("admin"), getConsultationResponses);

// 4. Analytics & LLM Correlation Engine (Admin / Lawmaker)
router
    .route("/:id/analytics")
    .get(verifyJWT, requireRole("admin"), getConsultationAnalytics);

router
    .route("/:id/analytics/regenerate")
    .post(verifyJWT, requireRole("admin"), regenerateAnalytics);

export default router;
