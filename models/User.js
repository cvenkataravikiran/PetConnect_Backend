const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, trim: true, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  passwordHash: { type: String, required: true },
  resetToken: String,
  resetTokenExpires: Date,
  plan: { type: String, enum: ["free", "basic", "premium"], default: "free" },
  planStart: Date,
  planEnd: Date,
  razorpay: { orderId: String, paymentId: String, signature: String },
  name: { type: String, required: true, trim: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);