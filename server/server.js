import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { startCartScheduler } from "./utils/cartScheduler.js";

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

const start = async () => {
  await connectDB();
  startCartScheduler();
  const server = app.listen(PORT, () => {
    console.log(
      `\x1b[36m🌿 MehzHaya API running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}\x1b[0m`
    );
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

start();
