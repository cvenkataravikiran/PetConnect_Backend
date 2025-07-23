const User = require("../models/User");
const PetProfile = require("../models/PetProfile");
const bcrypt = require("bcryptjs");

exports.getUser = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash -resetTokens");
  res.json(user);
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Incorrect old password." });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password changed successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ error: "Server error while changing password." });
  }
};

exports.adminDashboard = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const users = await User.find().select("-passwordHash -resetToken -resetTokenExpires");
  const pets = await PetProfile.find().populate("owner", "name email");
  res.json({ users, pets });
};