// backend/controllers/petProfileController.js

const PetProfile = require("../models/PetProfile");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Create a new pet profile
exports.createPetProfile = async (req, res) => {
  try {
    const { name, breed, skills, city, bio } = req.body;
    const ownerId = req.user.id; // Use ID from validated token

    // 1. Validate required fields first
    if (!name || !breed || !city) {
      console.warn("Missing required fields for pet creation", { name, breed, city });
      return res.status(400).json({ error: "Name, breed, and city are required." });
    }

    // 2. Check user and plan limits
    const user = await User.findById(ownerId);
    if (!user) {
      console.error("User not found for pet creation", { owner: ownerId });
      return res.status(401).json({ error: "User not found. Please log in again." });
    }
    const planLimits = { free: 1, basic: 5, premium: Infinity };
    const currentCount = await PetProfile.countDocuments({ owner: ownerId });
    if (currentCount >= planLimits[user.plan || "free"]) {
      console.warn(`Profile limit reached for user ${ownerId} on plan ${user.plan}`);
      return res.status(403).json({ error: `Profile limit reached for your plan (${user.plan}).` });
    }

    // 3. Handle image upload to Cloudinary
    let imageUrl;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "petconnect/pets",
          resource_type: "image"
        });
        imageUrl = result.secure_url;
        fs.unlinkSync(req.file.path); // Clean up local file
      } catch (cloudErr) {
        console.error("Cloudinary upload error:", cloudErr);
        return res.status(500).json({ error: "Image upload failed. Please try again.", details: cloudErr.message });
      }
    }

    // 4. Create and save the new pet profile
    const pet = new PetProfile({
      name,
      breed,
      skills: skills ? skills.split(",") : [],
      city,
      image: imageUrl,
      bio,
      owner: ownerId,
    });

    await pet.save();
    res.status(201).json(pet);
  } catch (err) {
    console.error("Unexpected error in createPetProfile:", err);
    res.status(500).json({ error: "An unexpected server error occurred.", details: err.message });
  }
};

// Get all pet profiles (feed, sorted by likes desc, then recent)
exports.getPetProfiles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }
    if (user.plan === "free") {
      return res.status(403).json({ error: "Upgrade your plan to access the feed." });
    }

    let pets;
    if (user.plan === "basic") {
      pets = await PetProfile.find()
        .populate("owner", "name email")
        .sort({ likes: -1, createdAt: -1 })
        .limit(10);
    } else { // Premium users
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      pets = await PetProfile.find()
        .populate("owner", "name email")
        .sort({ likes: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
    res.json(pets);
  } catch (err) {
    console.error("Error in getPetProfiles:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single pet profile by ID
exports.getPetProfileById = async (req, res) => {
  try {
    const pet = await PetProfile.findById(req.params.id).populate("owner", "name email");
    if (!pet) return res.status(404).json({ error: "Pet profile not found" });
    res.json(pet);
  } catch (err) {
    console.error("Error in getPetProfileById:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update a pet profile (owner only)
exports.updatePetProfile = async (req, res) => {
  try {
    const pet = await PetProfile.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet profile not found" });

    if (pet.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { name, breed, skills, city, bio } = req.body;
    if (name) pet.name = name;
    if (breed) pet.breed = breed;
    if (skills) pet.skills = skills.split(",");
    if (city) pet.city = city;
    if (bio) pet.bio = bio;

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "petconnect/pets",
          resource_type: "image"
        });
        pet.image = result.secure_url;
        fs.unlinkSync(req.file.path); // Clean up local file
      } catch (cloudErr) {
        console.error("Cloudinary upload error during update:", cloudErr);
        return res.status(500).json({ error: "Image upload failed. Please try again.", details: cloudErr.message });
      }
    }
    await pet.save();
    res.json(pet);
  } catch (err) {
    console.error("Error in updatePetProfile:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete a pet profile (owner only)
exports.deletePetProfile = async (req, res) => {
  try {
    const pet = await PetProfile.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet profile not found" });
    if (pet.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await PetProfile.deleteOne({ _id: req.params.id });
    res.json({ message: "Pet profile deleted" });
  } catch (err) {
    console.error("Error in deletePetProfile:", err);
    res.status(500).json({ error: err.message });
  }
};

// Search pet profiles by breed, skill, or city
exports.searchPetProfiles = async (req, res) => {
  try {
    const { breed, skill, city } = req.query;
    const query = {};
    if (breed) query.breed = new RegExp(breed, "i");
    if (skill) query.skills = { $in: [new RegExp(skill, "i")] };
    if (city) query.city = new RegExp(city, "i");
    const pets = await PetProfile.find(query).populate("owner", "name email");
    res.json(pets);
  } catch (err) {
    console.error("Error in searchPetProfiles:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all pet profiles for a specific user
exports.getPetProfilesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    // THE FIX IS HERE: Added .populate('owner', 'name') to fetch the owner's name
    const pets = await PetProfile.find({ owner: userId })
      .populate('owner', 'name')
      .sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    console.error("Error in getPetProfilesByUser:", err);
    res.status(500).json({ error: err.message });
  }
};

// Like a pet profile
exports.likePetProfile = async (req, res) => {
  try {
    const pet = await PetProfile.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true } // Return the updated document
    );
    if (!pet) {
      return res.status(404).json({ error: "Pet profile not found" });
    }
    res.json(pet);
  } catch (err) {
    console.error("Error in likePetProfile:", err);
    res.status(500).json({ error: "Failed to like pet profile" });
  }
}

// Premium-only: Analytics
exports.analytics = (req, res) => {
  if (req.user.plan !== "premium") return res.status(403).json({ error: "Premium plan required." });
  res.json({ message: "Analytics data (stub)" });
};
// Premium-only: Messages
exports.messages = (req, res) => {
  if (req.user.plan !== "premium") return res.status(403).json({ error: "Premium plan required." });
  res.json({ message: "Messages data (stub)" });
};
// Premium-only: Themes
exports.themes = (req, res) => {
  if (req.user.plan !== "premium") return res.status(403).json({ error: "Premium plan required." });
  res.json({ message: "Themes data (stub)" });
};