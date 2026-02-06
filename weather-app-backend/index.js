const express = require('express');
const cors = require('cors');
const path = require('path'); 
require("dotenv").config();

const app = express();
const authRoutes = require('./routes/auth');

// 1. CORS
app.use(cors({
  origin: "http://localhost:3000",          //later ->origin: process.env.CLIENT_URL
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

// 2. Body Parser
app.use(express.json());

// 3. Security Headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// 4. Request Logger 
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// 5. Routes 
app.use("/auth", authRoutes);

// 6. Static Files 
app.use('/auth/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});