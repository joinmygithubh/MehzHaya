/**
 * Create JWT, set it as an httpOnly cookie, and return the user payload.
 */
const sendToken = (user, statusCode, res, message = "Success") => {
  const token = user.getJwtToken();

  const cookieExpire = parseInt(process.env.JWT_COOKIE_EXPIRE || "30", 10);
  const options = {
    expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  // never leak sensitive fields
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    addresses: user.addresses,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    token,
    user: safeUser,
  });
};

export default sendToken;
