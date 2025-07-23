const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const { requireAuth } = require("../middleware/auth"); // Import shared middleware

// Auth routes
router.post("/signup", authControllers.signup);
router.post("/login", authControllers.login);
router.post("/forgot-password", authControllers.forgotPassword);
router.post("/reset-password", authControllers.resetPassword);
router.post("/logout", authControllers.logout);
router.post("/send-otp", authControllers.sendOtp);
router.post("/verify-otp", authControllers.verifyOtp);

// Use the shared middleware for protected routes
router.get("/profile", requireAuth, authControllers.profile);

router.get("/verify-email/:token", authControllers.verifyEmail);

module.exports = router;