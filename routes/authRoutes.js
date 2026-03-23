const express = require("express");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const db = require("../db/database");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many login attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        console.error("Login DB error:", err.message);
        return res.status(500).json({
          message: "Server error"
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }

      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      return res.json({
        message: "Login successful",
        user: req.session.user
      });
    });
  }
);

router.post("/logout", requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        message: "Could not log out"
      });
    }

    res.clearCookie("connect.sid");
    return res.json({
      message: "Logout successful"
    });
  });
});

router.post(
  "/change-password",
  requireAuth,
  [
    body("oldPassword")
      .notEmpty()
      .withMessage("Old password is required"),

    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("New password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("New password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("New password must contain at least one number")
      .matches(/[^A-Za-z0-9]/)
      .withMessage("New password must contain at least one special character")
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const userEmail = req.session.user.email;
    const { oldPassword, newPassword } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [userEmail], async (err, user) => {
      if (err) {
        console.error("Change password DB lookup error:", err.message);
        return res.status(500).json({
          message: "Server error"
        });
      }

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const match = await bcrypt.compare(oldPassword, user.password_hash);

      if (!match) {
        return res.status(401).json({
          message: "Old password is incorrect"
        });
      }

      const samePassword = await bcrypt.compare(newPassword, user.password_hash);
      if (samePassword) {
        return res.status(400).json({
          message: "New password must be different from the old password"
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      db.run(
        "UPDATE users SET password_hash = ? WHERE email = ?",
        [hashedPassword, userEmail],
        function (updateErr) {
          if (updateErr) {
            console.error("Change password update error:", updateErr.message);
            return res.status(500).json({
              message: "Could not update password"
            });
          }

          return res.json({
            message: "Password changed successfully"
          });
        }
      );
    });
  }
);

router.get("/me", requireAuth, (req, res) => {
  return res.json({
    user: req.session.user
  });
});

module.exports = router;