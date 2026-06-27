/**
 * Royalty-free image pools.
 *
 * Primary "hero" images use real photography from Unsplash (free to use under the
 * Unsplash License). The remaining gallery slots use deterministic Lorem Picsum
 * URLs (also free) keyed by SKU so every product reliably renders 4-6 images.
 *
 * In production, the admin panel lets you replace these with Cloudinary uploads.
 */

// Curated Unsplash photos (modest fashion, fabric, textile, accessories).
export const UNSPLASH = {
  Hijabs: [
    "https://images.unsplash.com/photo-1611601322175-ef8ec8c85f01?w=640&q=80",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=640&q=80",
    "https://images.unsplash.com/photo-1592878849122-facb97520f9e?w=640&q=80",
    "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=640&q=80",
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=640&q=80",
    "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=640&q=80",
  ],
  "Islamic Wear": [
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=640&q=80",
    "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=640&q=80",
    "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=640&q=80",
    "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=640&q=80",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=640&q=80",
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=640&q=80",
    "https://images.unsplash.com/photo-1588444650733-d0767b753fc8?w=640&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=640&q=80",
  ],
};

/**
 * Build a 4-6 image gallery for a product.
 * @param {string} group   Hijabs | Islamic Wear | Accessories
 * @param {string} sku     unique seed
 * @param {number} index   product index (rotates the hero image)
 */
export const buildGallery = (group, sku, index = 0) => {
  const pool = UNSPLASH[group] || UNSPLASH.Hijabs;
  const hero = pool[index % pool.length];
  const count = 4 + (index % 3); // 4..6 images
  const images = [{ public_id: "", url: hero }];
  for (let i = 1; i < count; i++) {
    images.push({
      public_id: "",
      url: `https://picsum.photos/seed/${encodeURIComponent(sku)}-${i}/640/800`,
    });
  }
  return images;
};
