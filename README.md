<div align="center">
  <img src="./docs/urbanvibes-logo.svg" alt="UrbanVibes logo" width="860" />
  <h1>UrbanVibes</h1>
  <p><strong>Professional plant commerce platform</strong> built as a full-stack monorepo with a customer storefront, admin workspace, and production-style REST API.</p>
  <p>
    <a href="#overview">Overview</a> &bull;
    <a href="#stack">Stack</a> &bull;
    <a href="#workspace">Workspace</a> &bull;
    <a href="#quick-start">Quick Start</a> &bull;
    <a href="#api-snapshot">API</a> &bull;
    <a href="#deployment">Deployment</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=061A22" alt="React 19 badge" />
    <img src="https://img.shields.io/badge/Vite-7-8B5CF6?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7 badge" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4 badge" />
    <img src="https://img.shields.io/badge/Node.js-Express_5-1B4332?style=for-the-badge&logo=nodedotjs&logoColor=7DDC84" alt="Node and Express badge" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-0F766E?style=for-the-badge&logo=mongodb&logoColor=8EE788" alt="MongoDB badge" />
    <img src="https://img.shields.io/badge/Stripe-Checkout-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe badge" />
  </p>
</div>

## Overview

UrbanVibes is a plant-focused ecommerce system split into three clear surfaces:

- `frontend/` for the customer shopping experience
- `Backend/` for authentication, catalog, addresses, orders, and Stripe flows
- `admin pannel/` for internal product and order operations

The README has been rebuilt as a cleaner project page with a custom brand mark, framework logo badges, and a tighter presentation. GitHub does not load live Font Awesome webfonts in README rendering, so the visual layer uses SVG artwork plus framework badges for predictable output.

## Stack

| Layer | Tools in use |
| --- | --- |
| Customer app | React 19, React Router 7, Vite 7, Tailwind CSS 4, Framer Motion |
| Admin app | React 19, React Router 7, Vite 7, Tailwind CSS 4 |
| API | Node.js, Express 5, MongoDB, Mongoose |
| Auth and security | JWT, bcryptjs, in-memory request rate limiting |
| Media and payments | Multer, Cloudinary, Stripe Checkout |

### Framework Logos

<p>
  <img src="https://img.shields.io/badge/React-UI-61DAFB?style=flat-square&logo=react&logoColor=061A22" alt="React badge" />
  <img src="https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite badge" />
  <img src="https://img.shields.io/badge/Tailwind-Styling-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind badge" />
  <img src="https://img.shields.io/badge/Node.js-Runtime-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js badge" />
  <img src="https://img.shields.io/badge/Express-API-111111?style=flat-square&logo=express&logoColor=white" alt="Express badge" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB badge" />
  <img src="https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary&logoColor=white" alt="Cloudinary badge" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Stripe badge" />
</p>

## Product Surfaces

| Surface | Purpose | Key workflows |
| --- | --- | --- |
| Storefront | Customer-facing shopping interface | browse products, view details, manage addresses, place orders, track orders |
| Admin Panel | Internal operations interface | add/edit plants, manage catalog visibility, review orders, update order status |
| Backend API | Shared service layer | auth, product CRUD, address CRUD, order creation, summary reporting, Stripe webhook handling |

## Highlights

### Customer Experience

- Account registration and login
- Search-led catalog browsing
- Product detail pages with catalog-backed data
- Cart and checkout flow
- Address book management
- Current orders and order history
- Stripe checkout success handling

### Admin Experience

- Separate admin authentication
- Dashboard summary for orders, revenue, products, and users
- Product creation and editing with up to four image uploads
- Soft delete for products
- Order monitoring and status updates

### Backend Capabilities

- JWT-based user and admin auth
- Request rate limiting for auth endpoints
- Product category listing and filtered product queries
- Stronger product schema for pricing, stock, plant care, SEO, and flags
- Stripe Checkout session creation and webhook-driven payment updates

## Workspace

```text
UrbanVibes/
|-- frontend/
|-- Backend/
|-- admin pannel/
`-- docs/
```

Note: the admin directory is literally named `admin pannel`. Keep quotes around that path in terminal commands.

## Quick Start

### Prerequisites

- Node.js 20 or newer recommended
- npm
- MongoDB instance
- Cloudinary account for image uploads
- Stripe account if card payments are required

### 1. Install dependencies

From the repository root:

```bash
npm run install:all
```

Or install each app independently:

```bash
cd frontend && npm install
cd ../Backend && npm install
cd "../admin pannel" && npm install
```

### 2. Environment variables

Create `Backend/.env`:

```env
PORT=9000
MONGODB_URI=mongodb://127.0.0.1:27017
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_JWT_EXPIRES_IN=12h
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_this_with_a_strong_admin_password
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:9000
```

Create `admin pannel/.env`:

```env
VITE_API_BASE_URL=http://localhost:9000
```

Important details:

- `PORT` should stay `9000` unless both frontend apps are updated to match.
- `MONGODB_URI` can be a base URI or a full database URI. If the database name is missing, the backend appends `/UrbanVibes`.
- CORS currently allows `FRONTEND_URL`, `ADMIN_URL`, and `CLIENT_URL`.
- Stripe variables are only required if checkout is enabled.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` control admin login.

### 3. Start the apps

Use three terminals:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

```bash
npm run dev:admin
```

Equivalent direct commands:

```bash
cd Backend && npm run server
cd frontend && npm run dev
cd "admin pannel" && npm run dev
```

### Local URLs

- Storefront: `http://localhost:5173`
- Admin panel: `http://localhost:5174`
- Backend API: `http://localhost:9000`

If `PORT` is omitted, the backend falls back to `4000`. In that case, both frontend apps must point `VITE_API_BASE_URL` to port `4000`.

## Scripts

### Root scripts

- `npm run install:frontend`
- `npm run install:backend`
- `npm run install:admin`
- `npm run install:all`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run dev:admin`
- `npm run build`
- `npm run build:frontend`
- `npm run build:admin`
- `npm run start:backend`

Note: root `npm run build` installs and builds the storefront only. That matches the root `vercel.json` output directory of `frontend/dist`.

### App-level scripts

| App | Commands |
| --- | --- |
| `Backend/` | `npm run server`, `npm start` |
| `frontend/` | `npm run dev`, `npm run build`, `npm run preview`, `npm run lint` |
| `admin pannel/` | `npm run dev`, `npm run build`, `npm run preview`, `npm run lint` |

## Route Map

### Storefront routes

- `/`
- `/product/:productId`
- `/checkout`
- `/success`
- `/account/profile`
- `/account/orders/current`
- `/account/orders/history`
- `/account/addresses`
- `/profile` redirects to `/account/profile`
- `/account` redirects to `/account/profile`
- `/my-orders` redirects to `/account/orders/current`
- `/order-history` redirects to `/account/orders/history`
- `/my-addresses` redirects to `/account/addresses`
- `/logout`
- `/account/logout`

### Admin routes

- `/login`
- `/dashboard`
- `/orders`
- `/list`
- `/add-plant`
- `/edit-plant/:productId`

## API Snapshot

Base URL: `http://localhost:9000`

### Auth headers

Protected endpoints accept either:

- `Authorization: Bearer <token>`
- `token: <token>`

### User endpoints

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/admin`
- `GET /api/users/profile`
- `PATCH /api/users/profile`
- `GET /api/users/addresses`
- `POST /api/users/address`
- `DELETE /api/users/address/:addressId`

Notes:

- `register` enforces a strong password policy.
- `register` and `login` are rate limited to 20 requests per 15 minutes per IP.
- `admin` login is rate limited to 10 requests per 15 minutes per IP.

### Product endpoints

- `GET /api/products/list`
- `GET /api/products/categories`
- `POST /api/products/single`
- `GET /api/products/:productId`
- `POST /api/products/add`
- `PATCH /api/products/update`
- `POST /api/products/remove`
- `DELETE /api/products/:productId`

Supported `GET /api/products/list` query params:

- `page`
- `limit`
- `publishedOnly`
- `categoryKey`
- `category`
- `productType`
- `inStock`
- `isFeatured`
- `isBestSeller`
- `isNewArrival`
- `isTrending`
- `search`
- `sortBy` with `createdAt`, `updatedAt`, `price`, `stock`, `name`, `publishedAt`
- `sortOrder` with `asc` or `desc`

Notes:

- Product creation and updates use multipart form-data.
- Upload field names are `image1`, `image2`, `image3`, and `image4`.
- Products are soft deleted with `isDeleted: true`.
- Category listing supports `includeEmpty` and `publishedOnly`.

### Order endpoints

- `POST /api/orders/place`
- `POST /api/orders/stripe/create-checkout-session`
- `POST /api/orders/stripe/webhook`
- `GET /api/orders/my`
- `GET /api/orders/list`
- `GET /api/orders/summary`
- `PATCH /api/orders/status`

Notes:

- `place`, `stripe/create-checkout-session`, and `my` require a logged-in user.
- `list`, `summary`, and `status` require an admin token.
- Stripe checkout creates the order first and finalizes payment status through the webhook.
- Order statuses: `placed`, `processing`, `shipped`, `delivered`, `cancelled`
- Payment statuses: `pending`, `paid`, `failed`, `refunded`
- Payment methods: `cod`, `razorpay`, `upi`, `card`, `netbanking`, `stripe`

## Data Model Notes

### Product model

The current product schema supports:

- catalog category keys and readable labels
- optional variants
- pricing, tax, stock, and publishing fields
- plant details such as watering, sunlight, difficulty, and pet-friendliness
- care guide and shipping metadata
- marketing flags including featured, bestseller, new-arrival, and trending
- SEO metadata and review aggregates

### Order model

Orders store:

- generated order number
- normalized item snapshots
- delivery address
- customer information
- payment method and payment status
- Stripe session and payment intent references

### User model

Users store:

- profile information
- hashed password
- saved addresses
- cart state object
- role and activity metadata

## Local Stripe Testing

Run Stripe CLI in a separate terminal:

```bash
stripe listen --forward-to localhost:9000/api/orders/stripe/webhook
```

Make sure the forwarded URL uses the same backend port as `Backend/.env`.

## Deployment

This repository includes `vercel.json` files for:

- the root storefront deployment
- `frontend/`
- `admin pannel/`
- `Backend/`

Recommended deployment flow:

1. Deploy `Backend/` first.
2. Deploy `frontend/`.
3. Deploy `admin pannel/`.
4. Set backend environment variables for `FRONTEND_URL` and `ADMIN_URL`.
5. If Stripe is enabled, configure `https://<backend-domain>/api/orders/stripe/webhook` in Stripe.

## Current Gaps

- No automated test suite is exposed from the root scripts.
- No repository-level `LICENSE` file is present.
- The admin folder name is misspelled as `admin pannel`, which matters for commands and deployment settings.
