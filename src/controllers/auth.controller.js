import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
};

/**
 * @desc    Register a new user (Citizen or Admin)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role = "citizen" } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
        throw new ApiError(400, "All fields (name, email, password) are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    // Validate role
    if (!["citizen", "admin"].includes(role)) {
        throw new ApiError(400, "Role must be either 'citizen' or 'admin'");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
    });

    const accessToken = user.generateAccessToken();

    const createdUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                201,
                { user: createdUser, accessToken },
                `User registered successfully as ${role}`
            )
        );
});

/**
 * @desc    Login user & get token (Role detected automatically from account)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password, expectedRole } = req.body;

    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(400, "Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Optional role check (e.g. if logging into an admin-only portal)
    if (expectedRole && user.role !== expectedRole) {
        throw new ApiError(
            403,
            `Access denied: Account role is '${user.role}', but expected '${expectedRole}'`
        );
    }

    const accessToken = user.generateAccessToken();

    const loggedInUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken },
                `Login successful as ${user.role}`
            )
        );
});

/**
 * @desc    Logout user / clear token cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * @desc    Get current logged in user details
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user profile fetched successfully"));
});
