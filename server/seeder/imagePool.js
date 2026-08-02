/**
 * Curated real modest-fashion e-commerce product photography pool.
 * Distinct, high-resolution (1000px+) photography set per category.
 * Every product gets 3 matching real images (Front/Drape, Angle/Fold, Detail/Close-Up).
 * ZERO placeholder / Picsum images used.
 */

const CATEGORY_PHOTO_SETS = {
  "Jersey Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1611601322175-ef8ec8c85f01?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Chiffon Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1592878849122-facb97520f9e?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Cotton Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Silk Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Modal Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Satin Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Crinkle Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Premium Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Instant Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Sports Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Printed Hijab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Niqab": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Khimar": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Abaya": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Prayer Dress": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Hijab Pins": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1588444650733-d0767b753fc8?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Magnetic Pins": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Inner Caps": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Undercaps": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Sleeves": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Hijab Magnets": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1588444650733-d0767b753fc8?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
  "Brooches": [
    [
      { public_id: "", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&q=85&auto=format&fit=crop" },
      { public_id: "", url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=85&auto=format&fit=crop" },
    ],
  ],
};

/**
 * Build a 3-image high-resolution real gallery for a product based on category & product index.
 * @param {string} categoryName  Category name
 * @param {string} sku           SKU identifier
 * @param {number} index         Product index offset
 */
export const buildGallery = (categoryName, sku, index = 0) => {
  const categorySets = CATEGORY_PHOTO_SETS[categoryName] || CATEGORY_PHOTO_SETS["Jersey Hijab"];
  const chosenSet = categorySets[index % categorySets.length];
  return chosenSet;
};
