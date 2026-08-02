/**
 * Procedural product generator for MehzHaya.
 * Produces 350+ realistic products across all categories (210+ hijabs & niqabs)
 * with prices, discounts, colors, sizes, materials, stock and marketing flags.
 */
import { buildGallery } from "./imagePool.js";

const COLORS = [
  "Black", "White", "Beige", "Emerald", "Navy", "Maroon", "Grey",
  "Dusty Pink", "Mustard", "Olive", "Lavender", "Cream", "Gold", "Teal",
];

const pick = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const lorem =
  "Crafted with premium care for the modern modest wardrobe. Soft, breathable and beautifully draped for all-day elegance. A MehzHaya signature piece — Timeless Hijabs for the Modern You.";

let skuCounter = 1000;
const nextSku = (prefix) => `MH-${prefix}-${++skuCounter}`;

/**
 * Generate `count` products for a given category definition.
 */
const generate = ({ count, prefix, group, categoryName, namer, material, sizes, priceRange }) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    const sku = nextSku(prefix);
    const price = rand(priceRange[0], priceRange[1]);
    const discount = [0, 0, 5, 10, 15, 20, 25, 30][rand(0, 7)];
    const colors = pick(COLORS, rand(3, 6));
    const name = namer(i, colors[0]);

    products.push({
      sku,
      name,
      description: `${name}. ${lorem}`,
      shortDescription: `${categoryName} • ${material} • ${colors.length} colors`,
      price,
      discount,
      group,
      categoryName,
      material,
      colors,
      sizes,
      stock: rand(0, 120),
      images: buildGallery(categoryName, sku, i),
      ratings: Math.round((rand(35, 50) / 10) * 10) / 10,
      numReviews: rand(0, 240),
      sold: rand(0, 500),
      views: rand(50, 5000),
      isFeatured: i % 7 === 0,
      isNewArrival: i % 5 === 0,
      isTrending: i % 6 === 0,
      isBestSeller: i % 8 === 0,
      isFlashSale: discount >= 25,
    });
  }
  return products;
};

const colorName = (c) => c;

export const buildProducts = () => {
  let all = [];

  /* ---------------- HIJABS (150) ---------------- */
  const hijabTypes = [
    { cat: "Jersey Hijab", mat: "Jersey", n: 16, pr: [299, 699] },
    { cat: "Chiffon Hijab", mat: "Chiffon", n: 16, pr: [249, 599] },
    { cat: "Cotton Hijab", mat: "Cotton", n: 14, pr: [199, 499] },
    { cat: "Silk Hijab", mat: "Silk", n: 14, pr: [699, 1499] },
    { cat: "Modal Hijab", mat: "Modal", n: 14, pr: [399, 899] },
    { cat: "Satin Hijab", mat: "Satin", n: 14, pr: [349, 799] },
    { cat: "Crinkle Hijab", mat: "Crinkle", n: 12, pr: [299, 649] },
    { cat: "Premium Hijab", mat: "Modal", n: 14, pr: [899, 1999] },
    { cat: "Instant Hijab", mat: "Jersey", n: 12, pr: [349, 749] },
    { cat: "Sports Hijab", mat: "Polyester", n: 10, pr: [399, 899] },
    { cat: "Printed Hijab", mat: "Georgette", n: 14, pr: [349, 799] },
  ];
  hijabTypes.forEach(({ cat, mat, n, pr }) => {
    all = all.concat(
      generate({
        count: n,
        prefix: "HJ",
        group: "Hijabs",
        categoryName: cat,
        material: mat,
        sizes: ["Free Size"],
        priceRange: pr,
        namer: (i, c) =>
          `${colorName(c)} ${cat} ${
            ["Premium", "Classic", "Luxe", "Everyday", "Signature", "Soft", "Luxury", "Essential"][i % 8]
          }`,
      })
    );
  });

  /* ---------------- NIQABS (60) ---------------- */
  all = all.concat(
    generate({
      count: 60,
      prefix: "NQ",
      group: "Islamic Wear",
      categoryName: "Niqab",
      material: "Chiffon",
      sizes: ["Free Size"],
      priceRange: [199, 699],
      namer: (i, c) =>
        `${colorName(c)} ${
          ["One Layer", "Two Layer", "Three Layer", "Half", "Bandana Style", "Tie Back", "Pull On", "Saudi Style", "Butterfly", "Breathable"][i % 10]
        } Niqab`,
    })
  );

  /* ---------------- KHIMARS (22) ---------------- */
  all = all.concat(
    generate({
      count: 22,
      prefix: "KH",
      group: "Islamic Wear",
      categoryName: "Khimar",
      material: "Nida",
      sizes: ["S", "M", "L", "XL", "Free Size"],
      priceRange: [699, 1799],
      namer: (i, c) => `${colorName(c)} ${["One Layer", "Two Layer", "Layered Frill", "Tie Back", "Instant"][i % 5]} Khimar`,
    })
  );

  /* ---------------- ABAYAS (22) ---------------- */
  all = all.concat(
    generate({
      count: 22,
      prefix: "AB",
      group: "Islamic Wear",
      categoryName: "Abaya",
      material: "Nida",
      sizes: ["S", "M", "L", "XL"],
      priceRange: [1299, 3999],
      namer: (i, c) => `${colorName(c)} ${["Open Front", "Closed", "Kimono", "Butterfly", "Embroidered", "Belted"][i % 6]} Abaya`,
    })
  );

  /* ---------------- PRAYER DRESSES (16) ---------------- */
  all = all.concat(
    generate({
      count: 16,
      prefix: "PD",
      group: "Islamic Wear",
      categoryName: "Prayer Dress",
      material: "Cotton",
      sizes: ["Free Size"],
      priceRange: [799, 1999],
      namer: (i, c) => `${colorName(c)} ${["Two Piece", "One Piece", "Travel", "Printed", "Embroidered"][i % 5]} Prayer Dress`,
    })
  );

  /* ---------------- HIJAB PINS (26) ---------------- */
  all = all.concat(
    generate({
      count: 26,
      prefix: "PN",
      group: "Accessories",
      categoryName: "Hijab Pins",
      material: "Metal",
      sizes: ["Free Size"],
      priceRange: [49, 299],
      namer: (i, c) => `${colorName(c)} ${["Pearl", "Crystal", "Safety", "Stick", "Floral", "Coil"][i % 6]} Hijab Pin Set`,
    })
  );

  /* ---------------- MAGNETIC PINS (12) ---------------- */
  all = all.concat(
    generate({
      count: 12,
      prefix: "MP",
      group: "Accessories",
      categoryName: "Magnetic Pins",
      material: "Metal",
      sizes: ["Free Size"],
      priceRange: [99, 349],
      namer: (i, c) => `${colorName(c)} Magnetic Hijab Pin ${["Round", "Square", "Crystal", "Pearl"][i % 4]}`,
    })
  );

  /* ---------------- INNER CAPS (22) ---------------- */
  all = all.concat(
    generate({
      count: 22,
      prefix: "IC",
      group: "Accessories",
      categoryName: "Inner Caps",
      material: "Cotton",
      sizes: ["Free Size"],
      priceRange: [99, 399],
      namer: (i, c) => `${colorName(c)} ${["Tube", "Bonnet", "Ninja", "Tie Back", "Lace"][i % 5]} Inner Cap`,
    })
  );

  /* ---------------- UNDERCAPS (10) ---------------- */
  all = all.concat(
    generate({
      count: 10,
      prefix: "UC",
      group: "Accessories",
      categoryName: "Undercaps",
      material: "Modal",
      sizes: ["Free Size"],
      priceRange: [99, 349],
      namer: (i, c) => `${colorName(c)} ${["Cross", "Full Cover", "Lightweight", "Ribbed"][i % 4]} Undercap`,
    })
  );

  /* ---------------- SLEEVES (8) ---------------- */
  all = all.concat(
    generate({
      count: 8,
      prefix: "SL",
      group: "Accessories",
      categoryName: "Sleeves",
      material: "Cotton",
      sizes: ["Free Size"],
      priceRange: [149, 449],
      namer: (i, c) => `${colorName(c)} Arm Sleeves ${["Ribbed", "Plain", "Lace"][i % 3]}`,
    })
  );

  /* ---------------- HIJAB MAGNETS (6) ---------------- */
  all = all.concat(
    generate({
      count: 6,
      prefix: "HM",
      group: "Accessories",
      categoryName: "Hijab Magnets",
      material: "Metal",
      sizes: ["Free Size"],
      priceRange: [79, 299],
      namer: (i, c) => `${colorName(c)} Hijab Magnet ${["Pair", "Set of 6", "Crystal"][i % 3]}`,
    })
  );

  /* ---------------- BROOCHES (8) ---------------- */
  all = all.concat(
    generate({
      count: 8,
      prefix: "BR",
      group: "Accessories",
      categoryName: "Brooches",
      material: "Metal",
      sizes: ["Free Size"],
      priceRange: [99, 599],
      namer: (i, c) => `${colorName(c)} ${["Floral", "Pearl", "Vintage", "Crystal"][i % 4]} Brooch`,
    })
  );

  return all;
};
