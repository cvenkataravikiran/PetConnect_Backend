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
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pets", petProfileRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

module.exports = app;