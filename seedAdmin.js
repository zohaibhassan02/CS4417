const bcrypt = require("bcrypt");
const db = require("./db/database");

async function seedAdmin() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    db.run(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      ["admin", "admin@example.com", hashedPassword, "admin"],
      function (err) {
        if (err) {
          console.error("Error seeding admin:", err.message);
        } else {
          console.log("Admin user created with ID:", this.lastID);
        }

        db.close();
      }
    );
  } catch (error) {
    console.error("Seed script error:", error);
  }
}

seedAdmin();