/** Format a number as INR currency. */
import { STORE } from "./constants";

export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

/** Final price after discount. */
export const finalPrice = (product) =>
  Math.round(product.price - (product.price * (product.discount || 0)) / 100);

/** Truncate text to n chars. */
export const truncate = (str = "", n = 60) =>
  str.length > n ? str.slice(0, n).trim() + "…" : str;

/** Build an image URL with a fallback placeholder. */
export const productImage = (product, index = 0) =>
  product?.images?.[index]?.url ||
  "https://picsum.photos/seed/mehzhaya-placeholder/640/800";

/** Debounce helper. */
export const debounce = (fn, delay = 350) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Build a WhatsApp click-to-chat link for the store number.
 * @param {string} message optional pre-filled message
 */
export const whatsappLink = (message = "") =>
  `https://wa.me/91${STORE.phone}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

/**
 * Build a structured WhatsApp product requirement message.
 */
export const buildProductWhatsAppMessage = ({ product, qty = 1, color = "", size = "" }) => {
  if (!product) return "Hello MehzHaya, I am interested in your products.";

  const price = formatPrice(finalPrice(product));
  const imgUrl = productImage(product);
  const prodSlug = product.slug || product._id;
  const prodLink = `https://mehzhaya.com/product/${prodSlug}`;

  let sizeStr = size || (product.sizes?.length ? product.sizes[0] : "Standard");
  if (color) {
    sizeStr = `${sizeStr} (Color: ${color})`;
  }

  const descriptionText = product.description
    ? product.description.slice(0, 180).trim() + (product.description.length > 180 ? "..." : "")
    : "Premium modest wear crafted with care.";

  return `Hello MehzHaya, I am interested in this product:

Product: ${product.name}
Price: ${price}
Quantity: ${qty}
Size: ${sizeStr}

Product Details:
${descriptionText}

Product Image:
${imgUrl}

Product Link:
${prodLink}

Please share the availability and purchase details.`;
};
