import mongoose from "mongoose";

/**
 * Connect to MongoDB Atlas.
 */
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\x1b[32m✓ MongoDB Connected:\x1b[0m ${conn.connection.host}`);
  } catch (error) {
    console.error(`\x1b[31m✗ MongoDB connection error:\x1b[0m ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
