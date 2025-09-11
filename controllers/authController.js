const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appErrors");
const User = require("../models/userModel");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const createToken = require("../utils/createToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../mailtrap/emails");

/**
 * @desc    Signup a new user
 * @route   POST /api/auth/signup
 * @method  POST
 * @access  Public
 */
exports.signup = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, userName, password, confirmPassword } = req.body;

  if (!email || !password || !firstName || !lastName || !userName || !confirmPassword) {
    throw new Error("All fields are required");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("User already exists", 400));
  }

  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    userName,
    password,
    confirmPassword,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  // await sendVerificationEmail(newUser.email, verificationToken);

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    user: {
      ...newUser._doc,
      password: undefined,
      confirmPassword: undefined,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @method  POST
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return next(new AppError("invalid email or password", 401));
  }
  // Check if password is correct
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError("invalid email or password", 401));
  }
  // jwt
  const token = createToken(res, user);
  user.lastLogin = Date.now();
  await user.save();
  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token: token,
    user: {
      ...user._doc,
      password: undefined,
    },
  });
});

/**
 * @desc    Logout user
 * @route   GET /api/auth/logout
 * @method  GET
 * @access  Private/User
 */
exports.logout = (req, res) => {
  res.clearCookie("token");
  //   res.cookie("jwt", "loggedout", { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Protect Routes : verify token
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  // console.log("Token from cookies:", token);

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("User recently changed password! Please log in again.", 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return next(new AppError("Invalid token. Please log in again.", 401));
  }
});

/**
 * @desc    Verify email using OTP
 * @route   POST /api/auth/verify-email
 * @method  POST
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return next(new AppError("Verification code is required", 400));
  }
  const user = await User.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    next(new AppError("Invalid or expired verification code", 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    user: {
      ...user._doc,
      password: undefined,
    },
  });
};

/**
 * @desc    Forgot password - send reset token
 * @route   POST /api/auth/forgot-password
 * @method  POST
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  // Generate reset token
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // send email
  await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

  res.status(200).json({ success: true, message: "Password reset link sent to your email" });
});

/**
 * @desc    Reset password using token
 * @route   PUT /api/auth/reset-password/:token
 * @method  PUT
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(new AppError("Password and confirm password are required", 400));
  }

  const resetToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Password reset successfully" });
});

/**
 * @desc    Check if user is logged in
 * @route   GET /api/auth/check-auth
 * @method  GET
 * @access  Private/User
 */
exports.checkAuth = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new AppError("You have to be logged in", 401));
  }
  res.status(200).json({
    success: true,
    message: "User is logged in",
    user: {
      ...user._doc,
      password: undefined,
      confirmPassword: undefined,
    },
  });
});
