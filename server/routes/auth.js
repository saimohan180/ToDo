const express = require("express");
const { db } = require("../db/db");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const router = express.Router();

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function now() {
  return new Date().toISOString();
}

// Initialize default admin user if none exists
function initDefaultUser() {
  const existingUser = db.prepare("SELECT * FROM users LIMIT 1").get();
  if (!existingUser) {
    const id = generateId();
    const passwordHash = bcrypt.hashSync("admin", 10);
    db.prepare(
      "INSERT INTO users (id, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    ).run(id, "admin", passwordHash, now(), now());
    console.log("Default admin user created (username: admin, password: admin)");
  }
}

// Initialize on module load
try {
  initDefaultUser();
} catch (error) {
  console.log("Users table may not exist yet, will initialize on first request");
}

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ 
    success: true, 
    user: { 
      id: user.id, 
      username: user.username 
    } 
  });
});

// Verify session (simple check)
router.post("/verify", (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(401).json({ valid: false });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  
  if (!user) {
    return res.status(401).json({ valid: false });
  }

  res.json({ valid: true, user: { id: user.id, username: user.username } });
});

// Update username
router.put("/username", (req, res) => {
  const { currentUsername, newUsername, password } = req.body;

  if (!currentUsername || !newUsername || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(currentUsername);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  // Check if new username already exists
  const existing = db.prepare("SELECT * FROM users WHERE username = ? AND id != ?").get(newUsername, user.id);
  if (existing) {
    return res.status(400).json({ error: "Username already taken" });
  }

  db.prepare("UPDATE users SET username = ?, updated_at = ? WHERE id = ?").run(
    newUsername,
    now(),
    user.id
  );

  res.json({ success: true, username: newUsername });
});

// Update password
router.put("/password", (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields required" });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const valid = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(
    newHash,
    now(),
    user.id
  );

  res.json({ success: true });
});

// Get current user info
router.get("/me", (req, res) => {
  const user = db.prepare("SELECT id, username, created_at FROM users LIMIT 1").get();
  
  if (!user) {
    return res.status(404).json({ error: "No user found" });
  }

  res.json({ user });
});

module.exports = router;
