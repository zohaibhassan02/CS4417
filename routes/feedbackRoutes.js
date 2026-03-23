const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../db/database");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/submit",
  requireAuth,
  [
    body("subject")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Subject must be between 1 and 100 characters"),

    body("message")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Message must be between 1 and 1000 characters")
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const user_id = req.session.user.id;
    const subject = req.body.subject.trim();
    const message = req.body.message.trim();

    const query = `
      INSERT INTO feedback (user_id, subject, message)
      VALUES (?, ?, ?)
    `;

    db.run(query, [user_id, subject, message], function (err) {
      if (err) {
        console.error("Feedback DB error:", err.message);
        return res.status(500).json({
          message: "Could not submit feedback"
        });
      }

      return res.status(201).json({
        message: "Feedback submitted successfully",
        feedbackId: this.lastID
      });
    });
  }
);

module.exports = router;