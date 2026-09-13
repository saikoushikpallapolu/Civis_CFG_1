import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes (any authenticated role: citizen or admin)
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);

// Protected admin-only verification route
router.route("/admin-check").get(verifyJWT, requireRole("admin"), (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            { adminUser: req.user },
            "Authorized! You have verified admin privileges."
        )
    );
});

export default router;
