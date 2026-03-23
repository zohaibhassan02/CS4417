const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const db = require("../db/database");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  requireAdmin,
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),

    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[^A-Za-z0-9]/)
      .withMessage("Password must contain at least one special character"),

    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Role must be user or admin")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { username, email, password, role } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      const query = `
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `;

      db.run(query, [username, email, hashedPassword, role || "user"], function (err) {
        if (err) {
          console.error("Register DB error:", err.message);

          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
              message: "Username or email already exists"
            });
          }

          return res.status(500).json({
            message: "Could not register user"
          });
        }

        return res.status(201).json({
          message: "User registered successfully",
          userId: this.lastID
        });
      });
    } catch (error) {
      console.error("Register route error:", error);
      return res.status(500).json({
        message: "Server error"
      });
    }
  }
);

router.get("/all", requireAdmin, (req, res) => {
  console.log("GET /users/all hit by:", req.session.user);

  const query = `
    SELECT id, username, email, role, created_at
    FROM users
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      return res.status(500).json({
        message: "Could not fetch users"
      });
    }

    return res.json({
      users: rows
    });
  });
});

module.exports = router;