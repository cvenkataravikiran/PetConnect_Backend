// backend/models/PetProfile.js

const mongoose = require("mongoose");

const petProfileSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: { type: String }, // URL from Cloudinary
  breed: { type: String, required: true, index: true },
  skills: [{ type: String, index: true }],
  city: { type: String, required: true, index: true },
  bio: { type: String, maxlength: 300 }, // Short bio
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("PetProfile", petProfileSchema);