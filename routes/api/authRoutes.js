const express = require("express");
const { signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth } = require("../../controllers/authController");
const { protect } = require("../../controllers/authController");
const authRouter = express.Router();

// Auth routes
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/logout", protect, logout);

authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.put("/reset-password/:token", resetPassword);

authRouter.get("/check-auth", protect, checkAuth);

module.exports = authRouter;
