// backend/app.js (Final and Definitive Version)

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

// --- START OF THE DEFINITIVE CORS FIX ---

// 1. Get the CLIENT_URL from your Render environment variables.
const clientURL = process.env.CLIENT_URL;

const corsOptions = {
  origin: (origin, callback) => {
    // --- This is for debugging to show you EXACTLY what is being compared ---
    console.log("================ CORS CHECK ================");
    console.log("Request Origin from Browser:", origin);
    console.log("Allowed CLIENT_URL from Render:", clientURL);
    console.log("==========================================");

    // 2. The Bulletproof Logic:
    // Check if both the origin and your clientURL exist.
    // Then, remove the final character of BOTH strings if it is a slash '/'.
    // Finally, compare the cleaned strings.
    if (clientURL && origin && origin.replace(/\/$/, "") === clientURL.replace(/\/$/, "")) {
      // If they match perfectly after cleaning, allow the request.
      callback(null, true);
    } else if (!origin) {
      // Allow requests that don't have an origin (e.g., Postman, server-to-server calls)
      callback(null, true);
    } else {
      // If they do not match, block the request and log the failure.
      callback(new Error("This origin is not allowed by CORS policy."));
    }
  },
  credentials: true,
};

// 3. Use the new, robust CORS options.
app.use(cors(corsOptions));

// --- END OF FIX ---

app.use(express.json());
app.use(morgan("dev"));

// Your existing API routes
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pets", petProfileRoutes);

// Health check and root routes
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "PetConnect SaaS Backend is running successfully.",
  });
});

module.exports = app;