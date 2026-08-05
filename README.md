# 🛒 Smart Cart — Budget-Aware Shopping Platform

A full-stack eCommerce platform that solves checkout anxiety by tracking a shopper's budget in **real time** as they shop — with dedicated dashboards for Shoppers, Admins, and Delivery Partners, and a complete feature set that mirrors real-world platforms like Flipkart and Amazon.

**Live Demo:** [smartcart-frontend-g472.onrender.com](https://smartcart-frontend-g472.onrender.com/)
**Repository:** [github.com/rohit6522/smart-cart-ecommerce](https://github.com/rohit6522/smart-cart-ecommerce)

> ⚠️ Hosted on free-tier infrastructure — the backend may take 30–60 seconds to wake up on the first request after a period of inactivity.

---

## ✨ Features

### 🛍️ Shopping Experience
- Public product catalog — browse freely as a guest, login required only to add to cart or checkout
- Real-time **budget tracker** with live progress bar and over-budget alerts (tracks lifetime spend across orders + current cart)
- Category-based browsing with auto-scrolling category pills and an animated hero carousel
- Live search with autocomplete suggestions
- Product detail pages with **ratings & reviews** (verified-purchase only) and a "You May Also Like" section
- Wishlist / Save for Later
- Product discounts with strike-through pricing and low-stock urgency indicators

### 🛒 Cart & Checkout
- Persistent cart with live quantity updates and budget sync
- Multi-address book with default address, PIN-code auto-fill, and "Use My Current Location"
- Coupon/promo code system — including first-order-only welcome coupons and referral bonuses
- **Razorpay** integration for online payments (Card / UPI / Wallet) plus Cash on Delivery
- Order confirmation emails and downloadable/printable invoices

### 📦 Order Lifecycle
- Full order tracking: Pending → Confirmed → Out for Delivery → Delivered
- Order cancellation (before shipping) and returns (within a 7-day window, with admin approval and cash-refund-on-pickup)
- In-app notification bell with real-time order status updates
- Order history with status-based filtering and a printable invoice

### 👨‍💼 Admin Dashboard
- Product CRUD with category filtering, discount management, and low-stock visibility
- Order management with delivery partner assignment and return approval/rejection
- Coupon management (create, edit, deactivate)
- **Sales analytics dashboard** — 30-day revenue trend, category-wise sales breakdown, and top-selling products (via Recharts)

### 🚚 Delivery Partner Panel
- Assigned deliveries with customer contact and address details
- Status updates (Assigned → Picked Up → Delivered)
- Earnings dashboard — today's, this month's, and total earnings based on completed deliveries

### 🎁 Growth Features
- Referral program — unique codes per user, bonus coupons for both referrer and referee
- Low-stock urgency badges ("Only 3 left!")

### 🎨 Polish
- Smooth animations throughout (Framer Motion) — modals, toasts, cart transitions, status trackers, micro-interactions
- Fully responsive, mobile-friendly UI
- Performance optimized — image lazy-loading via `next/image`, in-memory API response caching, gzip compression

---

## 🧱 Tech Stack

**Frontend**
- [Next.js 15](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Recharts (analytics charts)
- Axios

**Backend**
- Java Spring Boot 3
- Spring Security with JWT authentication
- Spring Data JPA / Hibernate
- Razorpay Java SDK
- Spring Mail (SMTP)

**Database**
- MySQL (hosted on Railway)

**Deployment**
- Frontend & Backend: [Render](https://render.com/) (Docker-based Web Services)
- Database: [Railway](https://railway.app/)

---

## 📁 Project Structure

```
smart-cart-ecommerce/
├── backend/     # Spring Boot REST API
│   ├── src/main/java/com/smartcart/backend/
│   │   ├── controller/   # REST endpoints
│   │   ├── service/      # Business logic
│   │   ├── repository/   # Spring Data JPA repositories
│   │   ├── entity/       # JPA entities
│   │   ├── dto/          # Request/response DTOs
│   │   ├── security/     # JWT filter & utilities
│   │   ├── config/       # Security & async config
│   │   └── exception/    # Global exception handling
│   └── Dockerfile
└── frontend/    # Next.js application
    ├── src/
    │   ├── app/          # App Router pages (user, admin, delivery)
    │   ├── components/   # Reusable UI components
    │   ├── context/       # Auth, Cart, Wishlist, Notification contexts
    │   ├── lib/           # API client functions
    │   └── types/         # Shared TypeScript types
    └── next.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Java 21+ and Maven
- Node.js 18+
- MySQL instance (local or hosted)

### Backend Setup

```bash
cd backend
```

Configure `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_cart_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_key_secret

spring.mail.username=your_email@gmail.com
spring.mail.password=your_gmail_app_password
```

Run the server:
```bash
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Run the dev server:
```bash
npm run dev
```
Runs on `http://localhost:3000`

---

## 👥 Roles & Access

| Role | Access |
|---|---|
| **Guest** | Browse the product catalog freely |
| **Shopper (USER)** | Full shopping experience — cart, checkout, orders, reviews, wishlist, referrals |
| **Admin** | Product/order/coupon management, delivery assignment, sales analytics |
| **Delivery Partner** | View assigned deliveries, update delivery status, track earnings |

> Admin accounts are not self-registrable through the public sign-up form for security reasons — they must be created directly in the database.

---

## 🔐 Environment Variables

### Backend
| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | MySQL connection string |
| `SPRING_DATASOURCE_USERNAME` / `PASSWORD` | Database credentials |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay API credentials |
| `SPRING_MAIL_USERNAME` / `PASSWORD` | Gmail SMTP credentials (App Password) |

### Frontend
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

---

## 📸 Key Highlights

- **Real-time budget tracking** that persists across sessions and accounts for lifetime spend, not just the current cart
- **Referral-linked coupon engine** — coupons can be public, first-order-only, or assigned to a specific user
- **Full return/cancellation workflow** with admin approval, matching real e-commerce return policies
- **Analytics dashboard** built entirely from live order data — no mock data

---

## 📄 License

MIT

---

*Built as a hands-on learning project to explore full-stack development, from database design to production deployment.*
