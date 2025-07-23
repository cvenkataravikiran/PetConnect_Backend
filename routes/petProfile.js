// backend/routes/petProfile.js

const express = require("express");
const router = express.Router();
const petProfileController = require("../controllers/petProfileController");
const { requireAuth } = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Create pet profile
router.post("/", requireAuth, upload.single("image"), petProfileController.createPetProfile);
// Get all pet profiles (feed) - SECURED
router.get("/", requireAuth, petProfileController.getPetProfiles);
// Search pet profiles
router.get("/search", requireAuth, petProfileController.searchPetProfiles);
// Get single pet profile
router.get("/:id", petProfileController.getPetProfileById);
// Update pet profile
router.put("/:id", requireAuth, upload.single("image"), petProfileController.updatePetProfile);
// Delete pet profile
router.delete("/:id", requireAuth, petProfileController.deletePetProfile);
// Get all pet profiles for a specific user
router.get("/user/:userId", requireAuth, petProfileController.getPetProfilesByUser);
// Like a pet profile
router.post("/:id/like", requireAuth, petProfileController.likePetProfile);

// Premium-only endpoints
router.get("/analytics", requireAuth, petProfileController.analytics);
router.get("/messages", requireAuth, petProfileController.messages);
router.get("/themes", requireAuth, petProfileController.themes);

module.exports = router;