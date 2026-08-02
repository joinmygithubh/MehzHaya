import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

/**
 * Protect routes - requires a valid JWT (cookie or Bearer header).
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.cookies?.token &&
    req.cookies.token !== "none" &&
    req.cookies.token !== "null" &&
    req.cookies.token !== ""
  ) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer")) {
    const bearer = req.headers.authorization.split(" ")[1];
    if (bearer && bearer !== "null" && bearer !== "undefined" && bearer !== "none") {
      token = bearer;
    }
  }

  if (!token || token === "none" || token === "null" || token === "undefined") {
    throw new ApiError(401, "Not authorized. Please log in to access this resource.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists.");
    }
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, "Not authorized. Invalid or expired token.");
  }
});

/**
 * Restrict access to specific roles. Usage: authorize("admin")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not allowed to access this resource.`)
      );
    }
    next();
  };
};
