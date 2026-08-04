import mongoose from "mongoose";
import dotenv from "dotenv";
import Return from "./models/Return.js";
import Order from "./models/Order.js";
import User from "./models/User.js";

dotenv.config();

async function checkReturns() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const returns = await Return.find()
    .populate("user", "name email phone")
    .populate("order", "orderId totalPrice orderStatus items shippingAddress")
    .sort("-createdAt");

  console.log(`Found ${returns.length} return requests:`);
  returns.forEach((r, idx) => {
    console.log(`\n--- Return #${idx + 1} ---`);
    console.log(`Return Request ID: ${r._id}`);
    console.log(`Order Populated:`, r.order);
    console.log(`Customer-Friendly Order ID: ${r.order?.orderId || "N/A"}`);
    console.log(`User Name: ${r.user?.name}`);
    console.log(`User Email: ${r.user?.email}`);
    console.log(`Reason: ${r.reason}`);
    console.log(`Status: ${r.status}`);
    console.log(`Items:`, r.items);
    console.log(`Created At: ${r.createdAt}`);
    console.log(`Updated At: ${r.updatedAt}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

checkReturns().catch((e) => {
  console.error(e);
  process.exit(1);
});
