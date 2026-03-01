# 🌿 NatureVibes

<p align="center">
  <strong>Full-Stack Plant E-Commerce Platform</strong><br/>
  Customer Storefront + Admin Panel + REST API
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react" alt="React badge" />
  <img src="https://img.shields.io/badge/Backend-Node%20%2B%20Express-339933?style=for-the-badge&logo=node.js" alt="Node badge" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB badge" />
  <img src="https://img.shields.io/badge/Admin-Dashboard-1F2937?style=for-the-badge" alt="Admin badge" />
</p>

---

## ✨ Overview

NatureVibes is a production-style ecommerce project focused on plants and gardening products.  
It includes:

- 🛍️ A user-facing storefront (`/`)
- 🧑‍💼 A dedicated admin panel (`/dashboard`)
- ⚙️ A backend API for auth, products, users, addresses, and orders
- ☁️ Cloudinary image upload support with multi-image product forms

---

## 🧩 Monorepo Structure

```text
NatureVibes/
├── frontend/             # Customer frontend (React + Vite)
├── Backend/              # API server (Express + MongoDB)
└── admin pannel/         # Admin frontend (React + Vite)
```

---

## 🚀 Core Features

### 👤 User Side

- JWT login and registration
- Product catalog fetched from backend
- Search experience in navbar
- Cart + checkout flow
- Profile section with:
  - Profile details
  - Current orders
  - Order history
  - Address book management

### 🧑‍💻 Admin Side

- Admin authentication
- Dashboard summary (orders, revenue, users, products)
- Product listing and soft delete
- Add new plant/product
- Edit existing product
- Upload up to 4 product images (`image1` to `image4`)
- Order list and status updates

### 🔧 Backend API

- User auth and profile APIs
- Address CRUD APIs
- Product CRUD APIs
- Order placement and tracking APIs
- Admin reporting endpoints

---

## 🛠️ Tech Stack

- **Frontend (User):** React 19, React Router, Vite, CSS, Tailwind plugin
- **Frontend (Admin):** React 19, React Router, Vite
- **Backend:** Node.js, Express 5, MongoDB, Mongoose
- **Auth:** JWT + bcryptjs
- **Media:** Multer + Cloudinary
- **Payments:** Stripe Checkout + Webhook

---

## ⚙️ Local Setup

### 1. Clone

```bash
git clone <your-repo-url>
cd NatureVibes
```

### 2. Install Dependencies

```bash
# Storefront frontend
cd frontend
npm install
cd ..

# Backend
cd Backend
npm install
cd ..

# Admin panel
cd "admin pannel"
npm install
cd ..
```

### 3. Configure Environment Variables

Create `Backend/.env`:

```env
PORT=9000
MONGODB_URI=mongodb://127.0.0.1:27017
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

> ℹ️ `MONGODB_URI` should be the base connection string (the backend app appends `/NatureVibes` internally).

Create `/frontend/.env` (storefront):

```env
VITE_API_BASE_URL=http://localhost:9000
```

Create `/admin pannel/.env`:

```env
VITE_API_BASE_URL=http://localhost:9000
```

> ✅ Important: backend code uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` for admin login.

### 4. Run the Apps

Use 3 terminals:

```bash
# Terminal 1: Backend
cd Backend
npm run server
```

```bash
# Terminal 2: Storefront frontend
cd frontend
npm run dev
```

```bash
# Terminal 3: Admin frontend
cd "admin pannel"
npm run dev
```

Default dev URLs:

- Storefront: `http://localhost:5173`
- Admin Panel: `http://localhost:5174`
- Backend API: `http://localhost:9000` (or your configured `PORT`)

For local Stripe webhook testing (optional), run Stripe CLI in a 4th terminal:

```bash
stripe listen --forward-to localhost:9000/api/orders/stripe/webhook
```

---

## 🧭 Main Routes

### Storefront

- `/`
- `/product/:productId`
- `/checkout`
- `/account/profile`
- `/account/orders/current`
- `/account/orders/history`
- `/account/addresses`

### Admin

- `/login`
- `/dashboard`
- `/orders`
- `/list`
- `/add-plant`
- `/edit-plant/:productId`

---

## 🔌 API Reference (Current)

### Users

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/admin`
- `GET /api/users/profile` (auth)
- `PATCH /api/users/profile` (auth)
- `GET /api/users/addresses` (auth)
- `POST /api/users/address` (auth)
- `DELETE /api/users/address/:addressId` (auth)

### Products

- `POST /api/products/add` (admin, multipart form-data)
- `GET /api/products/list`
- `POST /api/products/single`
- `PATCH /api/products/update` (admin, multipart form-data)
- `POST /api/products/remove` (admin)

### Orders

- `POST /api/orders/place` (optional auth)
- `POST /api/orders/stripe/create-checkout-session` (optional auth)
- `POST /api/orders/stripe/webhook` (Stripe server-to-server)
- `GET /api/orders/my` (auth)
- `GET /api/orders/list` (admin)
- `GET /api/orders/summary` (admin)
- `PATCH /api/orders/status` (admin)

Auth headers supported by middleware:

- `Authorization: Bearer <token>`
- `token: <token>`

---

## 📦 Scripts

### Storefront (`/frontend`)

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Backend (`/Backend`)

- `npm run server` (nodemon)
- `npm start`

### Admin (`/admin pannel`)

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Monorepo Root (`/`)

- `npm run install:all`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run dev:admin`
- `npm run build:frontend`
- `npm run build:admin`

---

## 🧪 Notes

- Product images are uploaded as `image1`, `image2`, `image3`, `image4`.
- Deleted products are soft deleted (`isDeleted: true`).
- Frontend and admin both use `VITE_API_BASE_URL` for backend connectivity.

---

## 🚀 Deploy On Vercel (Step-by-Step)

Deploy this monorepo as **3 separate Vercel projects**:

### 1. Push code to GitHub

```bash
git add .
git commit -m "Prepare monorepo for Vercel"
git push origin <your-branch>
```

### 2. Deploy Backend first

1. In Vercel dashboard, click **Add New Project**.
2. Import your GitHub repo.
3. Set **Root Directory** to `Backend`.
4. Build settings can remain default (uses `Backend/vercel.json`).
5. Add backend Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL` (set after frontend deploy URL is known)
6. Deploy and copy backend URL (example: `https://naturevibes-backend.vercel.app`).

### 3. Deploy Storefront

1. Add another new project from the same repo.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>`
4. Deploy and copy storefront URL.

### 4. Update Backend `FRONTEND_URL`

Go back to backend project settings and set:

`FRONTEND_URL=https://<your-frontend-domain>`

Then redeploy backend.

### 5. Deploy Admin Panel

1. Add third project from same repo.
2. Set **Root Directory** to `admin pannel`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>`
4. Deploy.

### 6. Configure Stripe webhook (if using Stripe)

In Stripe Dashboard:

1. Create webhook endpoint:
   - `https://<your-backend-domain>/api/orders/stripe/webhook`
2. Enable events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
3. Copy webhook signing secret and set it in backend Vercel env:
   - `STRIPE_WEBHOOK_SECRET`
4. Redeploy backend.

### 7. Validate after deploy

1. Open storefront and load product list.
2. Place COD order.
3. Verify order appears in admin panel.
4. If Stripe enabled, test payment flow with Stripe test card.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## 📄 License

License is currently not declared in this repository.  
Add a `LICENSE` file if you plan to publish it publicly.

---

<p align="center">
  Built with 🌱, React, and clean backend architecture.
</p>
