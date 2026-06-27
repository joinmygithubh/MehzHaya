/** Format a number as INR currency. */
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
