// backend/app.js

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

// --- START OF THE FIX ---

// 1. Define the list of allowed origins from your environment variables.
const allowedOrigins = [process.env.CLIENT_URL]; 

// 2. Create a more robust CORS configuration object.
const corsOptions = {
  // The origin function checks if the incoming request is from an allowed site.
  origin: (origin, callback) => {
    // The .replace(/\/$/, "") removes any trailing slash from the URL for a reliable match.
    // We also allow requests that don't have an 'origin' (like server-to-server requests or tools like Postman).
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true); // Allow the request.
    } else {
      callback(new Error("This origin is not allowed by CORS policy.")); // Block the request.
    }
  },
  credentials: true, // This allows cookies and authorization headers.
};

// 3. Use the new, robust CORS options.
app.use(cors(corsOptions));

// --- END OF THE FIX ---


app.use(express.json());
// This old line is now replaced by the block above: app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pets", petProfileRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// It's good practice to also have a root route for health checks.
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "PetConnect SaaS Backend is running.",
  });
});

module.exports = app;