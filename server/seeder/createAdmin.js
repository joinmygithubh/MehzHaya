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

  const email = (argEmail || process.env.ADMIN_EMAIL || "admin@mehzhaya.com").toLowerCase();
  const password = argPassword || process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = argName || process.env.ADMIN_NAME || "MehzHaya Admin";

  try {
    await connectDB();

    let admin = await User.findOne({ email }).select("+password");
    if (admin) {
      admin.password = password; // re-hashed by the pre-save hook
      admin.role = "admin";
      admin.isEmailVerified = true;
      await admin.save();
      log(`✓ Existing user promoted to admin & password reset`, "32");
    } else {
      admin = new User({ name, email, password, role: "admin", isEmailVerified: true });
      await admin.save();
      log(`✓ Admin created`, "32");
    }

    log(`\n  Admin login credentials:`, "36");
    log(`  Email:    ${email}`, "36");
    log(`  Password: ${password}\n`, "36");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`\x1b[31m✗ Error: ${err.message}\x1b[0m`);
    process.exit(1);
  }
};

run();
