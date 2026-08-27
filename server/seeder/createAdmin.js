/**
 * Standalone admin creator / resetter.
 *
 * Creates the admin user (or resets its password if it already exists) without
 * touching products or any other data. Useful when `npm run seed` was not run,
 * or when you've forgotten the admin password.
 *
 * Usage:
 *   npm run create-admin
 *   npm run create-admin -- admin@example.com MyPass123 "Admin Name"
 *
 * Falls back to ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from .env,
 * then to admin@mehzhaya.com / Admin@12345.
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const log = (msg, color = "36") => console.log(`\x1b[${color}m${msg}\x1b[0m`);

const run = async () => {
  const [argEmail, argPassword, argName] = process.argv.slice(2);

  const email = (argEmail || process.env.ADMIN_EMAIL || "admin@mehzhaya.com").toLowerCase().trim();
  const password = argPassword || process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = argName || process.env.ADMIN_NAME || "MehzHaya Admin";

  if (!email || !password) {
    console.error("\x1b[31m✗ Error: Email and password are required.\x1b[0m");
    process.exit(1);
  }

  try {
    await connectDB();

    let admin = await User.findOne({ email }).select("+password");
    if (admin) {
      admin.name = name;
      admin.password = password; // re-hashed by the User model pre-save hook
      admin.role = "admin";
      admin.isEmailVerified = true;
      await admin.save();
      log(`✓ Existing user updated/promoted to admin (email: ${email}, role: ${admin.role})`, "32");
    } else {
      admin = new User({ name, email, password, role: "admin", isEmailVerified: true });
      await admin.save();
      log(`✓ Admin user created successfully (email: ${email}, role: ${admin.role})`, "32");
    }

    log(`✓ Password stored using bcrypt hash in MongoDB. Ready for login.`, "32");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`\x1b[31m✗ Error: ${err.message}\x1b[0m`);
    process.exit(1);
  }
};

run();

