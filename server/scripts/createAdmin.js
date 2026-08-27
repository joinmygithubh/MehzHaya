import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const createAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "mehzhaya@gmail.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "786@Mehzabee";
  const adminName = process.env.ADMIN_NAME || "MehzHaya Admin";

  try {
    await connectDB();

    let user = await User.findOne({ email: adminEmail }).select("+password");

    if (user) {
      user.role = "admin";
      user.password = adminPassword; // Trigger User model pre("save") bcrypt hashing
      user.isEmailVerified = true;
      if (!user.name) user.name = adminName;
      await user.save();
      console.log("✓ Existing user updated to admin successfully");
    } else {
      user = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        authProvider: "local",
        isEmailVerified: true,
      });
      await user.save(); // Triggers User model pre("save") bcrypt hashing
      console.log("✓ Admin created successfully");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("✗ Error setting up admin account:", error.message);
    process.exit(1);
  }
};

createAdmin();
