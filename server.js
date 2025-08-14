const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./config/db");
const contactRoutes = require("./routes/contact");

// Init app
const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());

// DB Connect
connectDB();

// Routes
app.use("/api/contact", contactRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "RJ ATLAS Contact API" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
