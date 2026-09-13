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

export default router;
