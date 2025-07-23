// backend/app.js (Final and Correct Version)

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
    // 2. Check if the incoming request origin matches your CLIENT_URL.
    // THIS IS THE BULLETPROOF LOGIC:
    // It is "truthy" (not undefined), and after removing the final character of both strings
    // (if that character is a slash), the results are identical.
    if (clientURL && origin && origin.replace(/\/$/, "") === clientURL.replace(/\/$/, "")) {
      // If they match, allow the request.
      callback(null, true);
    } else if (!origin) {
      // Allow requests with no origin (like Postman or server-to-server)
      callback(null, true);
    } else {
      // If they do not match, block the request.
      console.error(`CORS Mismatch: Request Origin '${origin}' does not match Allowed CLIENT_URL '${clientURL}'.`);
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

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pets", petProfileRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "PetConnect SaaS Backend is running.",
  });
});

module.exports = app;