# 🌿 MehzHaya — Premium Islamic Fashion E-Commerce (MERN)

> **Elegance in Every Fold**
> A modern, full-stack MERN e-commerce platform specializing in **Hijabs, Niqabs, Abayas, Khimars, Prayer Dresses & Islamic Accessories**.

![Stack](https://img.shields.io/badge/Stack-MERN-064e3b) ![License](https://img.shields.io/badge/License-MIT-d4af37)

---

## ✨ Features

### Storefront
- 🏠 Premium hero banner, featured/best-sellers/new-arrivals/trending sections, categories, testimonials, Instagram gallery, newsletter
- 🔍 Live search suggestions, advanced filters (category, price, color, material, rating, availability), 7 sort modes
- ♾️ Infinite scroll, grid/list view, skeleton loaders, lazy-loaded images
- 🛍️ Product detail with image gallery, color/size selection, stock counter, reviews & ratings, related & recently-viewed products, share
- ❤️ Wishlist (add / remove / move-to-cart)
- 🛒 Cart with quantity control, coupon codes & live order summary
- 💳 Checkout (shipping → payment → review) with **Razorpay (test mode)** + **Cash on Delivery**
- 🎉 Order success page with confetti + email confirmation
- 👤 User dashboard: profile, orders, order tracking, saved addresses, change password
- 🌙 Dark mode, fully responsive, SEO friendly, breadcrumbs, toast notifications

### Admin Panel (`/admin`)
- 📊 Dashboard with revenue, orders, sales chart & top products
- 📦 Product management (CRUD, multi-image upload via Cloudinary or URLs, inventory, marketing flags)
- 🗂️ Categories, 🎟️ coupons, 🛒 orders (status updates), 👥 customers (roles)

### Backend / Security
- 🔐 JWT auth (signup, login, logout, email verification, forgot/reset/change password, protected routes)
- 🧂 Bcrypt password hashing, httpOnly cookies, Helmet, rate limiting, mongo-sanitize
- 🖼️ Cloudinary image storage (Multer), Nodemailer transactional emails
- 🧾 9+ Mongoose models, clean REST API under `/api/v1`

---

## 🗂️ Project Structure

```
mehzhaya/
├── server/                 # Node + Express + MongoDB API
│   ├── config/             # db, cloudinary, constants
│   ├── controllers/        # auth, user, product, category, cart, wishlist,
│   │                       # order, payment, review, coupon, banner, admin
│   ├── middleware/         # auth, multer, error handlers
│   ├── models/             # User, Product, Category, Cart, Wishlist,
│   │                       # Order, Review, Coupon, Banner
│   ├── routes/             # REST routes (mounted at /api/v1/*)
│   ├── utils/              # tokens, email, ApiFeatures, cloudinary upload
│   ├── seeder/             # seed.js + product generator (250+ products)
│   ├── app.js  server.js   # Express app + bootstrap
│   └── .env.example
│
└── client/                 # React (Vite) + Tailwind + Redux Toolkit
    ├── src/
    │   ├── api/            # axios instance
    │   ├── redux/          # store + slices (auth, cart, products, wishlist, ui)
    │   ├── components/     # layout, common, home, product, shop, auth, routing
    │   ├── pages/          # storefront, auth, dashboard, admin
    │   └── utils/          # helpers, constants, razorpay, confetti
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (image uploads) — optional for seeded data
- **Razorpay** test keys — optional, COD works without it
- An SMTP provider (Gmail App Password / Mailtrap) — optional for emails

### 1. Backend

```bash
cd server
cp .env.example .env       # then fill in your values
npm install
npm run seed               # populate DB with 250+ products, categories, coupons, admin
npm run dev                # starts API on http://localhost:5000
```

Seeded accounts:
| Role     | Email                   | Password      |
|----------|-------------------------|---------------|
| Admin    | admin@mehzhaya.com      | Admin@12345   |
| Customer | customer@mehzhaya.com   | Customer@123  |

> To wipe seed data: `npm run seed:destroy`

### 2. Frontend

```bash
cd client
cp .env.example .env       # set VITE_API_URL + VITE_RAZORPAY_KEY_ID
npm install
npm run dev                # starts app on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, and `VITE_API_URL`
points the axios client at the backend.

---

## 🔑 Environment Variables

### `server/.env`
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=<your MongoDB Atlas URI>
JWT_SECRET=<random secret>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CLOUDINARY_CLOUD_NAME= / CLOUDINARY_API_KEY= / CLOUDINARY_API_SECRET=
SMTP_HOST= / SMTP_PORT= / SMTP_USER= / SMTP_PASS=
EMAIL_FROM_NAME=MehzHaya / EMAIL_FROM=no-reply@mehzhaya.com
RAZORPAY_KEY_ID=rzp_test_xxx / RAZORPAY_KEY_SECRET=xxx
ADMIN_NAME= / ADMIN_EMAIL= / ADMIN_PASSWORD=
```

### `client/.env`
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
```

---

## 📡 API Overview (`/api/v1`)

| Resource    | Endpoints |
|-------------|-----------|
| **auth**    | `register`, `login`, `logout`, `me`, `verify-email/:token`, `forgot-password`, `reset-password/:token`, `change-password` |
| **products**| `GET /`, `/suggestions`, `/sections/home`, `/:idOrSlug`, admin CRUD |
| **categories** | `GET /`, `/:slug`, admin CRUD |
| **cart**    | `GET/POST/DELETE /`, `/coupon`, `/:itemId` |
| **wishlist**| `GET /`, `/:productId` (toggle), `/:productId/move-to-cart` |
| **orders**  | `POST /`, `/my`, `/:id`, `/:id/cancel`, `/:id/status` (admin) |
| **reviews** | `/:productId` (get/create/delete) |
| **coupons** | admin CRUD |
| **payment** | `/key`, `/order`, `/verify` (Razorpay) |
| **admin**   | `/stats` |

---

## 🎨 Theme

| Color   | Hex       | Usage              |
|---------|-----------|--------------------|
| Emerald | `#064e3b` | Primary brand      |
| Gold    | `#d4af37` | Accents / CTA      |
| Beige   | `#f5f5dc` | Backgrounds        |
| Black   | `#1a1a1a` | Text               |
| White   | `#ffffff` | Surfaces           |

Fonts: **Cormorant Garamond** (headings) · **Poppins** (body).

---

## 🖼️ Product Images

Seed data uses royalty-free imagery (Unsplash hero shots + Lorem Picsum gallery
fallbacks keyed per SKU so every product reliably renders 4–6 images). Replace
them anytime via the admin product form (Cloudinary upload or image URL).

---

## 📞 Store Contact

**MehzHaya** · _Elegance in Every Fold_
📍 Shyam Colony Part-1, Faridabad, Haryana – 121003
📱 8700695794

---

## 📄 License
MIT © MehzHaya
