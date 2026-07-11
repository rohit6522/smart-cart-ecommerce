# 🛒 Smart Shopping Cart with Budget Tracker

A full-stack eCommerce platform with real-time budget tracking, built to solve checkout anxiety — users set a budget and see live spend tracking as they shop.

## Tech Stack

**Frontend:** Next.js 15, TypeScript, Tailwind CSS
**Backend:** Java Spring Boot, Spring Security (JWT)
**Database:** MySQL

## Features

- 🔐 Role-based authentication (User / Admin / Delivery Partner) with JWT
- 💰 Real-time budget tracking — live progress bar, over-budget alerts
- 🛍️ Product browsing with search & category filters
- 🛒 Cart management with live quantity updates
- 📦 Full order lifecycle: checkout → confirmed → out for delivery → delivered
- 🚚 Delivery assignment and status tracking
- 👨‍💼 Admin panel: product CRUD, order management, delivery assignment

## Project Structure

```text
smart-cart-ecommerce/
├── backend/     Spring Boot REST API
└── frontend/    Next.js application
```

## Getting Started

### Backend

```bash
cd backend
# Configure src/main/resources/application.properties with your MySQL credentials
mvn spring-boot:run
```

Runs on `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
# Configure .env.local with NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev
```

Runs on `http://localhost:3000`

## Roles

| Role | Access |
|------|--------|
| USER | Browse products, manage cart, set budget, checkout, track orders |
| ADMIN | Manage products, view/update orders, assign deliveries |
| DELIVERY_BOY | View assigned deliveries, update delivery status |

> Note: Admin accounts are not self-registrable via the public form for security reasons — create them directly via the database.

## License

MIT