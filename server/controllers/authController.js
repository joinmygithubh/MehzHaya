import crypto from "crypto";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import sendToken from "../utils/sendToken.js";
import sendEmail from "../utils/sendEmail.js";
import {
  verifyEmailTemplate,
  resetPasswordTemplate,
} from "../utils/emailTemplates.js";

const CLIENT_URL = () => process.env.CLIENT_URL || "http://localhost:5173";

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    throw new ApiError(400, "Please provide name, email, phone number and password");
  }

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(400, "Email is already registered");

  const user = await User.create({ name, email, password, phone });

  // email verification
  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  const verifyUrl = `${CLIENT_URL()}/verify-email/${verifyToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your MehzHaya account",
      html: verifyEmailTemplate(user.name, verifyUrl),
    });
  } catch (err) {
    console.error("Verification email failed:", err.message);
  }

  sendToken(user, 201, res, "Registration successful. Please verify your email.");
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  sendToken(user, 200, res, "Logged in successfully");
});

// @desc    Google OAuth Login / Register
// @route   POST /api/v1/auth/google
// @access  Public
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential, googleId, email, name, picture } = req.body;

  let userEmail = email;
  let userName = name || "Google User";
  let userPicture = picture || "";
  let userGoogleId = googleId || "";

  // If a raw Google JWT ID credential is provided, decode payload
  if (credential) {
    try {
      const payloadBase64 = credential.split(".")[1];
      if (payloadBase64) {
        const decoded = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
        userEmail = decoded.email || userEmail;
        userName = decoded.name || userName;
        userPicture = decoded.picture || userPicture;
        userGoogleId = decoded.sub || userGoogleId;
      }
    } catch (e) {
      console.warn("Could not parse raw Google credential:", e.message);
    }
  }

  if (!userEmail) {
    throw new ApiError(400, "Google authentication requires a valid email address");
  }

  // Find user by email or googleId
  let user = await User.findOne({
    $or: [{ email: userEmail.toLowerCase() }, ...(userGoogleId ? [{ googleId: userGoogleId }] : [])],
  });

  if (user) {
    // If user exists, update Google metadata if missing
    if (!user.googleId && userGoogleId) user.googleId = userGoogleId;
    if (userPicture && (!user.avatar || !user.avatar.url)) {
      user.avatar = { public_id: "google_avatar", url: userPicture };
    }
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
  } else {
    // Automatically create new user if doesn't exist
    user = await User.create({
      name: userName,
      email: userEmail.toLowerCase(),
      googleId: userGoogleId,
      authProvider: "google",
      isEmailVerified: true,
      avatar: userPicture ? { public_id: "google_avatar", url: userPicture } : undefined,
    });
  }

  sendToken(user, 200, res, "Google login successful");
});

// @desc    Logout
// @route   GET /api/v1/auth/logout
// @access  Public / Private
export const logout = asyncHandler(async (req, res) => {
  const cookieOptions = {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  res.cookie("token", "", cookieOptions);
  res.clearCookie("token", cookieOptions);
  res.cookie("token", "", { ...cookieOptions, path: undefined });
  res.clearCookie("token");

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpire: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, "Verification link is invalid or has expired");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Email verified successfully" });
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.isEmailVerified) throw new ApiError(400, "Email is already verified");

  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  const verifyUrl = `${CLIENT_URL()}/verify-email/${verifyToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your MehzHaya account",
    html: verifyEmailTemplate(user.name, verifyUrl),
  });

  res.status(200).json({ success: true, message: "Verification email sent" });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No user found with that email");

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${CLIENT_URL()}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your MehzHaya password",
      html: resetPasswordTemplate(user.name, resetUrl),
    });
    res.status(200).json({ success: true, message: `Reset link sent to ${user.email}` });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Email could not be sent. Please try again later.");
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) throw new ApiError(400, "Please provide a new password");

  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, "Reset link is invalid or has expired");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, res, "Password reset successfully");
});

// @desc    Change password (logged in)
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Please provide current and new password");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password changed successfully" });
});
