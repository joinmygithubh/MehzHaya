/**
 * Shared backend constants: category taxonomy, materials, order/payment enums.
 */

export const CATEGORY_GROUPS = {
  Hijabs: [
    "Jersey Hijab",
    "Chiffon Hijab",
    "Cotton Hijab",
    "Silk Hijab",
    "Modal Hijab",
    "Satin Hijab",
    "Crinkle Hijab",
    "Premium Hijab",
    "Instant Hijab",
    "Sports Hijab",
    "Printed Hijab",
  ],
  "Islamic Wear": ["Niqab", "Khimar", "Abaya", "Prayer Dress"],
  Accessories: [
    "Hijab Pins",
    "Magnetic Pins",
    "Undercaps",
    "Inner Caps",
    "Sleeves",
    "Hijab Magnets",
    "Brooches",
  ],
};

export const MATERIALS = [
  "Jersey",
  "Chiffon",
  "Cotton",
  "Silk",
  "Modal",
  "Satin",
  "Crinkle",
  "Georgette",
  "Viscose",
  "Polyester",
  "Bamboo",
  "Metal",
  "Nida",
];

export const COLORS = [
  "Black",
  "White",
  "Beige",
  "Emerald",
  "Navy",
  "Maroon",
  "Grey",
  "Dusty Pink",
  "Mustard",
  "Olive",
  "Lavender",
  "Cream",
  "Gold",
  "Teal",
];

export const SIZES = ["XS", "S", "M", "L", "XL", "Free Size"];

export const ORDER_STATUS = [
  "Pending",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export const PAYMENT_METHODS = ["Razorpay", "COD"];

export const ROLES = ["user", "admin"];
