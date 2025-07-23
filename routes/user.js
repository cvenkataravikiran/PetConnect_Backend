// server/routes/users.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");
const User = require("../models/User");
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}
// No user-specific endpoints needed for the current prompt
router.get("/admin/dashboard", requireAuth, userController.adminDashboard);
router.post("/change-password", requireAuth, userController.changePassword);


// Razorpay order endpoint
router.post("/pay/razorpay-order", requireAuth, async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ error: "Razorpay is not configured. Please add your keys." });
  }
  const { plan } = req.body;
  const plans = {
    basic: { price: 399, name: "Basic Plan" },
    premium: { price: 999, name: "Premium Plan" },
  };
  if (!plans[plan]) return res.status(400).json({ error: "Invalid plan" });
  try {
    const order = await razorpay.orders.create({
      amount: plans[plan].price * 100,
      currency: "INR",
      receipt: `rcptid_${Date.now()}`,
      notes: { userId: req.user._id.toString(), plan },
    });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Razorpay webhook (stub)
router.post("/pay/razorpay-webhook", async (req, res) => {
  // TODO: Validate signature, update user plan
  // Example: req.body.payload.payment.entity.notes.userId, req.body.payload.payment.entity.notes.plan
  res.json({ received: true });
});

module.exports = router;
