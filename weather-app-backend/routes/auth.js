const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const authenticateToken = require("../jwt.js");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const multer = require("multer");
const path = require("path");
const fs = require("fs");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Serve static uploads folder (important!)
router.use("/uploads", express.static("uploads"))


router.post("/update-profile-pic", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No image uploaded" });

    const userId = req.user.id; 
    const imagePath = `/uploads/${req.file.filename}`;

    await pool.query(
      "UPDATE users SET picture = $1 WHERE id = $2",
      [imagePath, userId]
    );

    res.json({ msg: "Profile picture updated", imageUrl: imagePath });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});



// REGISTER
router.post("/register", async (req, res) => {
  console.log("Register request body:", req.body);
  try {
    const { username, password } = req.body;

    // check if username already exists
    const user_exists = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );
    if (user_exists.rows.length > 0) {
      return res.status(400).json({ msg: "username already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (username,password) VALUES($1,$2) RETURNING id, username",
      [username, hashed_password]
    );

    res.json({ msg: "user registered successfully", user: newUser.rows[0] });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  console.log("Login request body:", req.body);
  try {
    const { username, password } = req.body;

    // 1. check in admins table
    let result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    let userType = "admin";

    if (result.rows.length === 0) {
      // 2. If not found in admins, check users table
      result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      userType = "user";
    }

    // 3. if not found anywhere throw error
    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "invalid credentials" });
    }

    const validPass = await bcrypt.compare(password, result.rows[0].password);
    if (!validPass) return res.status(400).json({ msg: "wrong password" });

    // generate tokens
    const accessToken = jwt.sign(
      { id: result.rows[0].id, role: userType },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      { id: result.rows[0].id, role: userType },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // save refresh token
    if (userType === "admin") {
      await pool.query("UPDATE admins SET refresh_token = $1 WHERE id = $2", [refreshToken, result.rows[0].id]);
    } else {
      await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, result.rows[0].id]);
    }

    res.json({
      msg: "Login successful",
      accessToken,
      refreshToken,
      username: result.rows[0].username,
      type: userType
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});



// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ msg: "Refresh token required" });

    // users table
    let result = await pool.query("SELECT * FROM users WHERE refresh_token=$1", [refreshToken]);
    if (result.rows.length > 0) {
      await pool.query("UPDATE users SET refresh_token=NULL WHERE id=$1", [result.rows[0].id]);
      return res.json({ msg: "User logged out successfully" });
    }

    // admins table
    result = await pool.query("SELECT * FROM admins WHERE refresh_token=$1", [refreshToken]);
    if (result.rows.length > 0) {
      await pool.query("UPDATE admins SET refresh_token=NULL WHERE id=$1", [result.rows[0].id]);
      return res.json({ msg: "Admin logged out successfully" });
    }

    return res.status(400).json({ msg: "Invalid refresh token" });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// REFRESH
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    let user;

    // check in users
    const userResult = await pool.query(
      "SELECT * FROM users WHERE id=$1 AND refresh_token=$2",
      [decoded.id, refreshToken]
    );
    if (userResult.rows.length > 0) {
      user = { id: userResult.rows[0].id, role: "user" };
    }

    // check in admins
    if (!user) {
      const adminResult = await pool.query(
        "SELECT * FROM admins WHERE id=$1 AND refresh_token=$2",
        [decoded.id, refreshToken]
      );
      if (adminResult.rows.length > 0) {
        user = { id: adminResult.rows[0].id, role: "admin" };
      }
    }

    if (!user) return res.status(403).json({ message: "invalid token" });

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Refresh token expired or invalid" });
  }
});

// GET all products
router.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC"); // fetch all products
    res.json(result.rows); // send as JSON array
  } catch (err) {
    console.error("Failed to fetch products:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// POST /wishlist/:product_id
router.post("/wishlist/:product_id",authenticateToken, async (req, res) => {
  const { product_id } = req.params;  // from URL
  const user_id = req.user.id;        // from auth middleware

  try {
    await pool.query(
      "INSERT INTO wishlists(user_id, product_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
      [user_id, product_id]
    );
    res.json({ msg: "Product added to wishlist" });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});


// DELETE /wishlist/:product_id
router.delete("/wishlist/:product_id",authenticateToken, async (req, res) => {
  const { product_id } = req.params;  // from URL
  const user_id = req.user.id;        // from auth middleware

  try {
    await pool.query(
      "DELETE FROM wishlists WHERE user_id=$1 AND product_id=$2",
      [user_id, product_id]
    );
    res.json({ msg: "Product removed from wishlist" });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GET /wishlist
router.get("/wishlist",authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      "SELECT product_id FROM wishlists WHERE user_id=$1",
      [user_id]
    );
    res.json(result.rows.map(r => r.product_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// POST /cart/:product_id
router.post("/cart/:product_id",authenticateToken, async (req, res) => {
  const { product_id } = req.params;  // from URL
  const user_id = req.user.id;        // from auth middleware

  try {
    await pool.query(
      "INSERT INTO cart(user_id, product_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
      [user_id, product_id]
    );
    res.json({ msg: "Product added to cart" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});


// DELETE /cart/:product_id
router.delete("/cart/:product_id",authenticateToken, async (req, res) => {
  const { product_id } = req.params;  // from URL
  const user_id = req.user.id;        // from auth middleware

  try {
    await pool.query(
      "DELETE FROM cart WHERE user_id=$1 AND product_id=$2",
      [user_id, product_id]
    );
    res.json({ msg: "Product removed from cart" });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GET /cart
router.get("/cart",authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      "SELECT product_id FROM cart WHERE user_id=$1",
      [user_id]
    );
    res.json(result.rows.map(r => r.product_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});


router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      star_rating,
      reviews_count,
      prev_price,
      new_price,
      company,
      color,
      category,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: "No image uploaded" });
    }

    // save relative path to DB
    const imagePath = `/uploads/${req.file.filename}`;

    await pool.query(
      `INSERT INTO products 
        (title, image_url, star_rating, reviews_count, prev_price, new_price, company, color, category)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        title,
        imagePath,
        star_rating || null,
        reviews_count || null,
        prev_price || null,
        new_price || null,
        company || null,
        color || null,
        category || null,
      ]
    );

    res.json({ msg: "✅ Product uploaded", imageUrl: imagePath });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ... existing imports and multer code ...

// GOOGLE LOGIN
router.post("/google", async (req, res) => {
  console.log("Google Auth Request Received");
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ msg: "No token provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const google_id = payload.sub;
    const email = payload.email;
    const username = payload.name;
    const picture = payload.picture;

    // 1. Check if user exists
    let userResult = await pool.query(
      "SELECT * FROM users WHERE google_id=$1 OR email=$2",
      [google_id, email]
    );

    let userData;

    // 2. If new user → insert, else use existing
    if (userResult.rows.length === 0) {
      const newUser = await pool.query(
        `INSERT INTO users (username, email, google_id, picture)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username`,
        [username, email, google_id, picture]
      );
      userData = newUser.rows[0];
    } else {
      userData = userResult.rows[0];
    }

    const userId = userData.id;

    // 3. Generate tokens
    const accessToken = jwt.sign(
      { id: userId, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      { id: userId, role: "user" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await pool.query(
      "UPDATE users SET refresh_token=$1 WHERE id=$2",
      [refreshToken, userId]
    );

    res.json({
      msg: "Google login successful",
      accessToken,
      refreshToken,
      username: userData.username,
      picture: userData.picture,
      type: "user"
    });

  } catch (err) {
    console.error("Google login error detail:", err);
    res.status(500).json({ msg: "Google authentication failed", error: err.message });
  }
  
});







module.exports = router;
