# 🛍️ CARTNOVA — Premium Multi-Category E-Commerce Platform

**CARTNOVA** (Brand: **TROSTO**) is a production-grade, full-stack multi-category online shopping platform built with **Next.js App Router**, **React 19**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **MongoDB Atlas** with **Mongoose ODM**.

Designed with a warm, modern aesthetic featuring deep navy typography, warm orange accents (`#F97316` / `#EA580C`), subtle borders, soft shadows, and generous whitespace.

---

## 🌟 Key Features

### 🛒 Customer-Facing Shopping Experience
- **Dynamic Homepage (`/`)**:
  - Promotional announcement bar with quick links.
  - Large hero banner with typography, product photography, and call-to-action buttons.
  - Value propositions strip: *Free Shipping*, *7-Day Easy Returns*, *100% Secure Payments*, *24/7 Dedicated Support*.
  - Shop by Category showcase across 9 distinct departments.
  - Curated carousels for *Featured Products*, *Trending Deals*, and *New Arrivals*.
  - Newsletter subscription strip with validation.
- **Faceted Product Catalog (`/products`)**:
  - Responsive layout with desktop filter sidebar and mobile drawer.
  - Real-time filtering by category, brand, price range slider, star rating, stock availability, and discount percentage.
  - Multi-criteria sorting: *Relevance*, *Price: Low to High*, *Price: High to Low*, *Newest Arrivals*, and *Customer Rating*.
  - Pagination, loading skeleton states, and empty result recovery.
- **Category Portals (`/categories/[slug]`)**:
  - Dedicated hero banners, category descriptions, and pre-filtered product collections for:
    - ⚡ *Electronics*
    - 👗 *Fashion*
    - 👟 *Shoes*
    - ⌚ *Watches*
    - 🎒 *Bags*
    - 🍳 *Home & Kitchen*
    - 💄 *Beauty*
    - 📚 *Books*
    - 🕶️ *Accessories*
- **Product Details (`/products/[slug]`)**:
  - Multi-image gallery with thumbnail selection and zoom preview.
  - Dynamic variant picker (color swatches and size buttons) with stock validation.
  - Quantity selector bounded by real-time inventory levels.
  - Instant *Add to Cart* and *Buy Now* direct checkout routing.
  - Tabbed interface: Full Description, Technical Specifications, and Verified Customer Reviews.
  - Star breakdown and review submission modal for verified purchasers.
  - Related product recommendations.
- **Debounced Instant Search (`/search`)**:
  - Real-time search in header with live dropdown suggestions.
  - Dedicated search results page with full facet filters and count summaries.
- **Shopping Cart (`/cart`)**:
  - Two-column layout with item thumbnails, size/color variant tags, and quantity steppers.
  - Live coupon application (`WELCOME50`, `TROSTO20`, `FESTIVE10`) with discount calculation.
  - Transparent cost breakdown: Subtotal, Shipping (Free above ₹999), 5% GST, and Applied Discounts.
  - Cart persistence for authenticated customers and guest browser sessions.
- **Wishlist (`/wishlist`)**:
  - One-click wishlist toggling with optimistic UI updates.
  - *Move to Cart* and *Move All to Cart* actions.
- **Checkout Flow (`/checkout`)**:
  - Delivery address book: select existing address or add a new one with PIN-code validation.
  - Payment method selection:
    - **Razorpay Online Gateway**: Cards, UPI (Google Pay, PhonePe, Paytm), NetBanking, and Wallets.
    - **Cash on Delivery (COD)**.
  - Server-side stock verification and price recalculation before order confirmation.
  - Immediate stock decrement upon confirmed order placement.
- **Payment Verification & Results**:
  - Server-side HMAC-SHA256 signature verification (`/api/payments/razorpay/verify`).
  - `/checkout/success` with order summary and direct tracking links.
  - `/checkout/failed` with retry payment options.
- **Customer Account Portal (`/account`)**:
  - Profile management (`/account/profile`): update name, email, phone, and password.
  - Saved Address Book (`/account/addresses`): add, edit, and set default shipping addresses.
  - Order History & Tracking (`/account/orders` and `/account/orders/[id]`):
    - Visual timeline: *Order Placed* ➔ *Processing* ➔ *Shipped* ➔ *Out for Delivery* ➔ *Delivered*.
    - Shipping tracking numbers and courier partner info.
    - Self-service order cancellation and 7-day return request actions.
- **Authentication (`/login`, `/register`, `/forgot-password`)**:
  - JWT token authentication stored in HTTP-only cookies.
  - Secure bcryptjs password hashing (cost factor 10).
  - One-click demo credential autofill for instant testing.
- **Company & Policy Pages**:
  - `/about`, `/contact`, `/faq`, `/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`.

---

### 🛡️ Admin Portal (`/admin`)
- **Executive Analytics Dashboard (`/admin`)**:
  - Real-time KPIs: *Total Revenue*, *Total Orders*, *Average Order Value (AOV)*, and *Customer Base*.
  - Interactive 7-Day Revenue Trend Area Chart using Recharts.
  - Low-Stock alerts table with direct replenishment links.
  - Recent orders table with real-time status badges.
- **Inventory Management (`/admin/products`)**:
  - Full product table with search, category filtering, and status badges.
  - Product creation wizard (`/admin/products/new`) with Cloudinary image upload.
  - Product editor (`/admin/products/[id]/edit`) with inventory and price adjustments.
- **Category Administration (`/admin/categories`)**:
  - Create and reorder categories with banner images.
- **Order Fulfillment (`/admin/orders` and `/admin/orders/[id]`)**:
  - Status progression workflow: *Placed* ➔ *Processing* ➔ *Shipped* ➔ *Delivered* ➔ *Cancelled*.
  - Assign tracking numbers and courier services.
  - Approve or decline customer return requests.
- **Customer Relationship Management (`/admin/customers`)**:
  - View registered customer profiles, lifetime spending, order counts, and roles.
- **Promotions & Coupons (`/admin/coupons`)**:
  - Create percentage or flat discounts with minimum order thresholds and expiry dates.
- **Store Configuration (`/admin/settings`)**:
  - Manage store contact details, tax rates, free shipping thresholds, and currency formatting.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling & Design** | [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) Icons |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Charts & Visualizations** | [Recharts](https://recharts.org/) |
| **Database & ODM** | [MongoDB Atlas](https://www.mongodb.com/atlas), [Mongoose 8](https://mongoosejs.com/) |
| **Authentication & Security** | JWT (`jsonwebtoken`), `bcryptjs`, HTTP-only secure cookies |
| **Form Management & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod 4](https://zod.dev/) |
| **Payments** | [Razorpay SDK](https://razorpay.com/) (UPI, Cards, NetBanking, COD) |
| **Media & Storage** | [Cloudinary](https://cloudinary.com/) (Upload & CDN Delivery) |
| **Email Notifications** | [Resend](https://resend.com/) |
| **Alternative Standalone Backend** | Node.js Express 4 in `backend/` with Mongoose |

---

## 📂 Project Architecture

```
smart-cart-ecommerce/
├── frontend/                     # Next.js App Router Full-Stack Application
│   ├── src/
│   │   ├── app/                  # Route handlers and UI Pages
│   │   │   ├── (auth)/           # /login, /register, /forgot-password
│   │   │   ├── account/          # Customer portal (/profile, /orders, /addresses)
│   │   │   ├── admin/            # Admin portal (/products, /orders, /coupons, etc.)
│   │   │   ├── api/              # 20 Next.js REST API Route Handlers
│   │   │   │   ├── admin/        # Admin analytics, products, orders, coupons
│   │   │   │   ├── auth/         # Login, register, me, logout
│   │   │   │   ├── cart/         # Server-side cart operations
│   │   │   │   ├── categories/   # Category listings
│   │   │   │   ├── coupons/      # Promo code validation
│   │   │   │   ├── orders/       # Order creation & tracking
│   │   │   │   ├── payments/     # Razorpay order generation & HMAC verification
│   │   │   │   ├── products/     # Catalog search, filtering, reviews
│   │   │   │   ├── seed/         # Database seeder endpoint
│   │   │   │   └── upload/       # Cloudinary image upload
│   │   │   ├── cart/             # Shopping cart page
│   │   │   ├── categories/[slug] # Category showcase pages
│   │   │   ├── checkout/         # Multi-step checkout & payment results
│   │   │   ├── products/         # Catalog & product detail pages
│   │   │   ├── search/           # Search results page
│   │   │   ├── wishlist/         # Wishlist page
│   │   │   └── page.tsx          # Homepage
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Header.tsx        # Brand navigation, live search, badges
│   │   │   ├── Footer.tsx        # Newsletter, site map, policy links
│   │   │   ├── ProductCard.tsx   # Product card with hover zoom & quick actions
│   │   │   ├── FilterSidebar.tsx # Multi-facet filter sidebar & drawer
│   │   │   └── BenefitStrip.tsx  # Brand value pillars
│   │   ├── context/              # React Context Providers
│   │   │   ├── AuthContext.tsx   # Auth session & role management
│   │   │   ├── CartContext.tsx   # Live cart calculation & syncing
│   │   │   └── WishlistContext.tsx # Wishlist persistence & toggling
│   │   ├── lib/                  # Utilities & database connection
│   │   │   ├── mongodb.ts        # Cached global Mongoose connection pool
│   │   │   └── seedData.ts       # Database seeder dataset
│   │   ├── models/               # 11 Mongoose Schemas & Models
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   ├── Category.ts
│   │   │   ├── Cart.ts
│   │   │   ├── Order.ts
│   │   │   ├── Payment.ts
│   │   │   ├── Address.ts
│   │   │   ├── Review.ts
│   │   │   ├── Coupon.ts
│   │   │   ├── Wishlist.ts
│   │   │   └── Notification.ts
│   │   └── types/                # TypeScript type definitions
│   ├── .env.example              # Frontend environment variables template
│   └── package.json
├── backend/                      # Optional standalone Node.js Express server
│   ├── src/
│   │   └── config/db.js          # MongoDB connection module
│   ├── server.js                 # Express server with CORS & health check
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** 18.18+ or 20+
- **MongoDB Atlas** database URI (or local MongoDB running on `mongodb://localhost:27017/cartnova`)
- (Optional) **Razorpay** test API key and secret
- (Optional) **Cloudinary** credentials for image uploads

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/rohit6522/smart-cart-ecommerce.git
cd smart-cart-ecommerce/frontend
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` inside `frontend/`:
```bash
cp .env.example .env.local
```

Fill in your configuration details:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cartnova?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=cartnova-super-secret-jwt-key-2026-production

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Razorpay Test Credentials (Optional for online payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=rzp_test_secret_placeholder
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_placeholder

# Cloudinary (Optional for product image uploads)
CLOUDINARY_CLOUD_NAME=demo_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# Email Service (Optional for transactional emails)
RESEND_API_KEY=re_placeholder_12345678
EMAIL_FROM=onboarding@resend.dev
```

### 4. Seed the Database
Populate the database with demo accounts, 9 categories, 9 featured products, and active coupons:
```bash
# Start the development server
npm run dev
```
Then trigger the seeder either by:
- Visiting `http://localhost:3000/api/seed` in your browser, OR
- Sending a POST request: `curl -X POST http://localhost:3000/api/seed`

---

## 🔑 Demo Accounts & Test Credentials

The database seeder provisions the following accounts:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Admin** | `admin@cartnova.com` | `Admin@123456` | Full access to `/admin` dashboard, product CRUD, orders, and coupons |
| **Customer** | `customer@cartnova.com` | `Customer@123456` | Full shopping, cart, wishlist, checkout, and `/account` portal |
| **Delivery** | `delivery@cartnova.com` | `Delivery@123456` | Delivery order tracking and updates |

*Tip: The `/login` page features 1-click **Quick Fill** buttons for both Admin and Customer accounts.*

### 🎟️ Active Promotional Coupons
- **`WELCOME50`**: 50% discount on first orders (up to ₹500 off, minimum cart ₹999).
- **`TROSTO20`**: 20% flat discount on orders over ₹1,499.
- **`FESTIVE10`**: 10% instant festival discount on any purchase over ₹499.

---

## 🚀 Running the Production Build

To verify and run the production build locally:

```bash
cd frontend
npm run build
npm start
```
The application compiles all 45 static and dynamic routes cleanly and runs on `http://localhost:3000`.

---

## 🌐 Deployment to Vercel & MongoDB Atlas

1. **MongoDB Atlas**:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so Vercel serverless functions can connect.
   - Copy the connection string to `MONGODB_URI`.
2. **Vercel**:
   - Import the repository in [Vercel](https://vercel.com/).
   - Set **Root Directory** to `frontend`.
   - In **Environment Variables**, add the keys from `.env.example` (`MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
   - Click **Deploy**.
3. **Database Seeding on Production**:
   - Once deployed, visit `https://your-domain.vercel.app/api/seed` to seed the database with initial categories, products, and admin credentials.

---

## 📄 License
This project is licensed under the MIT License.
