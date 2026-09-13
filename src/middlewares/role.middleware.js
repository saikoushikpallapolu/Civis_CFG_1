import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to enforce role-based access control (RBAC).
 * Must be preceded by verifyJWT so that req.user is populated.
 * @param  {...string} allowedRoles - e.g. "admin", "citizen"
 */
export const requireRole = (...allowedRoles) => {
    return (req, _, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Access denied. Required role: ${allowedRoles.join(" or ")}, but your role is: ${req.user.role}`
            );
        }

        next();
    };
};
