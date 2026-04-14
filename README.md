# TechBharat Store — Supabase Edition

A full-stack e-commerce app (Next.js frontend + Express backend) migrated from MongoDB/Mongoose to **Supabase (PostgreSQL)**.

---

## 🗄️ Database Setup (do this first)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of:
   ```
   server/db/schema.sql
   ```
   This creates all tables, indexes, and triggers (including automatic rating recalculation on reviews).

---

## ⚙️ Server Setup

```bash
cd server
cp .env .env          # edit the values below
npm install
npm run dev
```

### Required environment variables (`server/.env`)

| Variable | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API |
| `JWT_SECRET` | Any long random string |
| `RAZORPAY_KEY_ID` | [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Webhooks |

---

## 🖥️ Client Setup

```bash
cd client
cp .env.local .env.local   # edit values
npm install
npm run dev
```

### Required environment variables (`client/.env.local`)

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard (use TEST key in dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |

---

## 🔄 What Changed (MongoDB → Supabase)

| Before | After |
|---|---|
| `mongoose` package | `@supabase/supabase-js` |
| `MONGODB_URI` env var | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| Mongoose models (`/server/models/`) | PostgreSQL schema (`/server/db/schema.sql`) |
| ObjectId references (`_id`) | UUID primary keys (`id`) |
| Mongoose `populate()` | Supabase foreign-key selects (e.g. `category:category_id(...)`) |
| Mongoose schema virtuals | PostgreSQL computed values / triggers |
| `pre('save')` hooks for password hashing | bcrypt in controller |
| `reviewSchema.statics.calcAverageRating` | PostgreSQL trigger `trg_reviews_recalc` |
| `orderSchema.pre('save')` for order numbers | `genOrderNumber()` helper in controller |

---

## 📁 Project Structure

```
techbharat_supabase/
├── server/
│   ├── config/db.js          ← Supabase client + connectDB
│   ├── db/schema.sql         ← PostgreSQL schema (run once in Supabase)
│   ├── controllers/          ← All rewritten with Supabase queries
│   ├── middleware/auth.js    ← JWT + Supabase user lookup
│   ├── routes/               ← Unchanged
│   └── server.js             ← Unchanged (except db import)
└── client/                   ← Next.js frontend (unchanged)
```

---

## 🚀 API Endpoints

All endpoints remain identical — no frontend API calls need to change.

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me
PUT    /api/v1/auth/update-profile
PUT    /api/v1/auth/update-password
POST   /api/v1/auth/addresses
DELETE /api/v1/auth/addresses/:id

GET    /api/v1/products
GET    /api/v1/products/featured
GET    /api/v1/products/new-arrivals
GET    /api/v1/products/bestsellers
GET    /api/v1/products/:slug
POST   /api/v1/products          (admin)
PUT    /api/v1/products/:id      (admin)
DELETE /api/v1/products/:id      (admin)

GET    /api/v1/categories
GET    /api/v1/categories/flat
GET    /api/v1/categories/:slug

GET    /api/v1/cart
POST   /api/v1/cart
PUT    /api/v1/cart/:itemId
DELETE /api/v1/cart/:itemId
DELETE /api/v1/cart

POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:id
PUT    /api/v1/orders/:id/status (admin)
GET    /api/v1/orders/admin/all  (admin)

GET    /api/v1/reviews/:productId
POST   /api/v1/reviews/:productId
DELETE /api/v1/reviews/:id

GET    /api/v1/search
GET    /api/v1/search/suggestions

POST   /api/v1/payments/razorpay/create-order
POST   /api/v1/payments/razorpay/verify
POST   /api/v1/payments/razorpay/webhook
```
