const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ===== SIGNUP (email OR phone + password) =====
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, plan } = req.body;
    if (!name || (!email && !phone) || !password)
      return res.status(400).json({ error: "Name, email or phone, and password required" });

    if (email && await User.findOne({ email }))
      return res.status(400).json({ error: "Email already registered" });
    if (phone && await User.findOne({ phone }))
      return res.status(400).json({ error: "Phone already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = new User({
      name, email, phone, passwordHash,
      plan: plan || 'free',
      isVerified: true,
      verificationToken,
    });
    await user.save();
    return res.status(201).json({ msg: "Registered successfully! You can now log in." });
  } catch (err) {
    console.error("SIGNUP FAILED:", err); 
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ===== LOGIN (email OR phone + password) =====
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if ((!email && !phone) || !password)
      return res.status(400).json({ error: "Email or phone and password required" });

    const user = await User.findOne(email ? { email } : { phone });
    if (!user) return res.status(400).json({ error: "No user found with those credentials." });
    if (email && !user.isVerified) return res.status(403).json({ error: "Please verify your email before logging in." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    let plan = user.plan;
    let planEnd = user.planEnd;
    if (plan !== "free" && planEnd && new Date(planEnd) < new Date()) {
      user.plan = "free";
      user.planEnd = undefined;
      await user.save();
      plan = "free";
      planEnd = undefined;
    }

    const payload = { id: user._id, name: user.name, email: user.email, phone: user.phone, plan, planEnd, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Ensure all necessary fields, especially `id` and `role`, are sent to the frontend
    res.json({ token, id: user._id, name: user.name, email: user.email, phone: user.phone, plan, planEnd, role: user.role });
  } catch (err) {
    console.error("LOGIN FAILED:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== USER PROFILE (protected route) =====
exports.profile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash -resetToken -resetTokenExpires");
  if (!user) return res.status(404).json({ error: "User not found" });
  // Send back a consistent user object shape
   res.json({
    _id: user._id, // This is important for consistency with the frontend
    name: user.name,
    email: user.email,
    phone: user.phone,
    plan: user.plan,
    planEnd: user.planEnd,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
};


// ===== FORGOT PASSWORD (email OR phone, just returns success for now) =====
exports.forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone)
      return res.status(400).json({ error: "Email or phone required" });
    // In a real app, send reset link via email or SMS
    res.json({ msg: "If this user exists, a reset link will be sent." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ===== RESET PASSWORD (link) =====
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: "Token and new password required" });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    res.json({ msg: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ===== LOGOUT (frontend deletes token, route for completeness) =====
exports.logout = (req, res) => {
  res.json({ msg: "Logged out successfully." });
};

// ===== USER PROFILE (protected route) =====
exports.profile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash -resetToken -resetTokenExpires");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    name: user.name,
    email: user.email,
    phone: user.phone,
    plan: user.plan,
    planEnd: user.planEnd,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
};

// ===== VERIFY EMAIL (no-op for now) =====
exports.verifyEmail = async (req, res) => {
  res.json({ msg: "Email verification is not required in this version." });
};

// ===== SEND OTP FOR PHONE LOGIN (no-op for now) =====
exports.sendOtp = async (req, res) => {
  res.json({ msg: "OTP login is not enabled in this version." });
};

// ===== VERIFY OTP FOR PHONE LOGIN (no-op for now) =====
exports.verifyOtp = async (req, res) => {
  res.json({ msg: "OTP login is not enabled in this version." });
};
