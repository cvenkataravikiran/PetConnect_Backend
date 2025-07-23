// backend/app.js (Diagnostic Version)

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const petProfileRoutes = require("./routes/petProfile");

const app = express();

// --- START OF THE DIAGNOSTIC CORS FIX ---

const clientURL = process.env.CLIENT_URL; // Get the URL from Render's environment
const allowedOrigins = [clientURL];

const corsOptions = {
  origin: (origin, callback) => {
    // --- THIS IS THE CRITICAL LOGGING ---
    console.log("================ CORS CHECK ================");
    console.log("Request Origin:", origin);
    console.log("Allowed CLIENT_URL:", clientURL);
    console.log("==========================================");

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("This origin is not allowed by CORS policy.")); // Block it
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// --- END OF FIX ---

app.use(express.json());
app.use(morgan("dev"));

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pets", petProfileRoutes);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "PetConnect Backend is running." });
});

module.exports = app;