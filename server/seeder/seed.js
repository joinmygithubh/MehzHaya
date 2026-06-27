import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { CATEGORY_GROUPS } from "../config/constants.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Banner from "../models/Banner.js";
import { buildProducts } from "./productData.js";

const log = (msg, color = "36") => console.log(`\x1b[${color}m${msg}\x1b[0m`);

const destroyData = async () => {
  await Promise.all([
    Product.deleteMany(),
    Category.deleteMany(),
    Coupon.deleteMany(),
    Banner.deleteMany(),
    User.deleteMany({ role: { $ne: "admin" } }),
  ]);
  log("🗑️  All seed data destroyed", "31");
};

const importData = async () => {
  log("🌱 Seeding MehzHaya database...");

  // ----- Clear existing -----
  await Promise.all([
    Product.deleteMany(),
    Category.deleteMany(),
    Coupon.deleteMany(),
    Banner.deleteMany(),
  ]);

  // ----- Admin user -----
  const adminEmail = process.env.ADMIN_EMAIL || "admin@mehzhaya.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || "MehzHaya Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "Admin@12345",
      role: "admin",
      isEmailVerified: true,
    });
    log(`👤 Admin created: ${adminEmail}`, "32");
  } else {
    log(`👤 Admin already exists: ${adminEmail}`, "33");
  }

  // ----- Demo customer -----
  const demoEmail = "customer@mehzhaya.com";
  if (!(await User.findOne({ email: demoEmail }))) {
    await User.create({
      name: "Aisha Khan",
      email: demoEmail,
      password: "Customer@123",
      isEmailVerified: true,
      phone: "8700695794",
      addresses: [
        {
          label: "Home",
          fullName: "Aisha Khan",
          phone: "8700695794",
          line1: "Shyam Colony Part-1",
          city: "Faridabad",
          state: "Haryana",
          postalCode: "121003",
          country: "India",
          isDefault: true,
        },
      ],
    });
    log(`👤 Demo customer created: ${demoEmail} / Customer@123`, "32");
  }

  // ----- Categories -----
  const categoryDocs = [];
  for (const [group, names] of Object.entries(CATEGORY_GROUPS)) {
    for (const name of names) {
      categoryDocs.push({ name, group });
    }
  }
  const categories = await Category.create(categoryDocs);
  const catMap = {};
  categories.forEach((c) => (catMap[c.name] = c));
  log(`📂 ${categories.length} categories created`, "32");

  // ----- Products -----
  const raw = buildProducts();
  const productsToInsert = raw.map((p) => {
    const cat = catMap[p.categoryName];
    return { ...p, category: cat._id };
  });

  // use create (not insertMany) so pre-save hooks generate slugs
  const created = await Product.create(productsToInsert);
  log(`🛍️  ${created.length} products created`, "32");

  // update product counts
  for (const cat of categories) {
    const count = created.filter((p) => p.categoryName === cat.name).length;
    cat.productCount = count;
    await cat.save();
  }

  // ----- Coupons -----
  await Coupon.create([
    {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "percentage",
      discountValue: 10,
      minPurchase: 499,
      maxDiscount: 200,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      code: "MEHZ200",
      description: "Flat ₹200 off on orders above ₹1499",
      discountType: "fixed",
      discountValue: 200,
      minPurchase: 1499,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      code: "FESTIVE25",
      description: "Festive Sale - 25% off",
      discountType: "percentage",
      discountValue: 25,
      minPurchase: 999,
      maxDiscount: 500,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ]);
  log("🎟️  3 coupons created", "32");

  // ----- Banners -----
  await Banner.create([
    {
      title: "Elegance in Every Fold",
      subtitle: "Discover our premium hijab collection",
      image: { url: "https://images.unsplash.com/photo-1611601322175-ef8ec8c85f01?w=1600&q=80" },
      link: "/shop?group=Hijabs",
      buttonText: "Shop Hijabs",
      position: "hero",
      order: 1,
    },
    {
      title: "Modest. Modern. Mehzhaya.",
      subtitle: "New arrivals in Abayas & Khimars",
      image: { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1600&q=80" },
      link: "/shop?group=Islamic Wear",
      buttonText: "Explore",
      position: "hero",
      order: 2,
    },
    {
      title: "Flash Sale — Up to 30% Off",
      subtitle: "Limited time only",
      image: { url: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1600&q=80" },
      link: "/shop?isFlashSale=true",
      buttonText: "Grab Deals",
      position: "flash",
      order: 1,
    },
  ]);
  log("🖼️  3 banners created", "32");

  log("\n✅ Seeding complete!", "32");
  log(`   Admin login: ${adminEmail} / ${process.env.ADMIN_PASSWORD || "Admin@12345"}`, "36");
  log(`   Customer:    ${demoEmail} / Customer@123`, "36");
};

const run = async () => {
  try {
    await connectDB();
    if (process.argv.includes("--destroy")) {
      await destroyData();
    } else {
      await importData();
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`\x1b[31m✗ Seed error: ${err.message}\x1b[0m`);
    console.error(err);
    process.exit(1);
  }
};

run();
