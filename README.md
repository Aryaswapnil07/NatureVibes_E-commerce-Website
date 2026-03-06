# NatureVibes

Full-stack plant ecommerce monorepo with:

- `frontend/`: customer storefront built with React and Vite
- `Backend/`: Express API with MongoDB, Cloudinary, JWT auth, and Stripe support
- `admin pannel/`: admin dashboard built with React and Vite

The current codebase supports product catalog browsing, customer accounts, address management, order placement, Stripe checkout, and admin product/order management.

## Repository Layout

```text
NatureVibes/
|-- frontend/
|-- Backend/
`-- admin pannel/
```

Note: the admin directory is literally named `admin pannel`, so keep the quotes when running shell commands against that path.

## Tech Stack

### Frontend

- React 19
- React Router 7
- Vite 7
- Tailwind CSS 4
- Framer Motion

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- bcryptjs password hashing
- Multer uploads
- Cloudinary media storage
- Stripe Checkout and webhook handling

## Core Features

### Storefront

- User registration and login
- Product catalog fetched from the API
- Search and category-driven browsing
- Product detail pages
- Cart and checkout flow
- Saved addresses
- Current orders and order history
- Stripe success page handling

### Admin Panel

- Separate admin login
- Dashboard summary for orders, revenue, users, and products
- Product creation and editing
- Multi-image uploads (`image1` to `image4`)
- Product soft delete
- Order list and status updates

### API

- User auth and profile endpoints
- Address CRUD endpoints
- Product CRUD plus category listing
- Order placement and Stripe checkout session creation
- Stripe webhook endpoint
- Lightweight in-memory rate limiting for auth endpoints

## Prerequisites

- Node.js 20+ recommended
- npm
- MongoDB instance
- Cloudinary account for image uploads
- Stripe account if you want card payments

## Quick Start

### 1. Install dependencies

From the repository root:

```bash
npm run install:all
```

You can also install each app independently:

```bash
cd frontend && npm install
cd ../Backend && npm install
cd "../admin pannel" && npm install
```

### 2. Configure environment variables

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

Notes:

- `PORT` should be set to `9000` unless you also change the frontend API URL configuration.
- `MONGODB_URI` may be either a base connection string or a full database URL. If the database name is missing, the backend appends `/NatureVibes` automatically.
- CORS allows requests from `FRONTEND_URL`, `ADMIN_URL`, and `CLIENT_URL`.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are only required for Stripe checkout.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used for admin login and admin token validation.

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:9000
```

Create `admin pannel/.env`:

```env
VITE_API_BASE_URL=http://localhost:9000
```

### 3. Run the apps

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

Default local URLs:

- Storefront: `http://localhost:5173`
- Admin panel: `http://localhost:5174`
- Backend API: `http://localhost:9000`

If you skip `PORT=9000`, the backend falls back to `4000`, and both frontend apps must be pointed at that port manually.

## Available Scripts

### Root

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

Note: root `npm run build` installs and builds the storefront only, and matches the root `vercel.json` output path of `frontend/dist`.

### Backend

- `npm run server`
- `npm start`

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Admin Panel

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Application Routes

### Storefront routes

- `/`
- `/product/:productId`
- `/checkout`
- `/success`
- `/account/profile`
- `/account/orders/current`
- `/account/orders/history`
- `/account/addresses`
- `/profile` -> redirects to `/account/profile`
- `/account` -> redirects to `/account/profile`
- `/my-orders` -> redirects to `/account/orders/current`
- `/order-history` -> redirects to `/account/orders/history`
- `/my-addresses` -> redirects to `/account/addresses`
- `/logout`
- `/account/logout`

### Admin routes

- `/login`
- `/dashboard`
- `/orders`
- `/list`
- `/add-plant`
- `/edit-plant/:productId`

## API Overview

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

Product list query params supported by `GET /api/products/list`:

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
- `sortBy` (`createdAt`, `updatedAt`, `price`, `stock`, `name`, `publishedAt`)
- `sortOrder` (`asc` or `desc`)

Notes:

- Product creation and updates accept multipart form-data.
- Upload field names are `image1`, `image2`, `image3`, and `image4`.
- Products are soft deleted by setting `isDeleted: true`.
- `GET /api/products/categories` supports `includeEmpty` and `publishedOnly` query params.

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
- Stripe checkout creates the order first, then updates payment status through the webhook.
- Supported order statuses: `placed`, `processing`, `shipped`, `delivered`, `cancelled`.
- Supported payment statuses: `pending`, `paid`, `failed`, `refunded`.
- Supported payment methods: `cod`, `razorpay`, `upi`, `card`, `netbanking`, `stripe`.

## Data Model Highlights

### Product

The product schema already supports more than a basic catalog item:

- category keys and human-readable category labels
- optional variants
- pricing, tax, and stock metadata
- plant-specific details such as sunlight, watering, difficulty, and pet-friendliness
- care guide fields
- shipping fields
- featured, bestseller, new-arrival, and trending flags
- SEO metadata
- review aggregates

### Order

Orders store:

- order number
- normalized item snapshots
- delivery address
- customer info
- payment status and payment method
- Stripe session and payment intent identifiers

### User

Users store:

- account profile info
- hashed password
- address book
- cart data object
- role and activity fields

## Local Stripe Testing

If you want to test the webhook locally, run Stripe CLI in a separate terminal:

```bash
stripe listen --forward-to localhost:9000/api/orders/stripe/webhook
```

Make sure the forwarding port matches `PORT` in `Backend/.env`.

## Deployment Notes

This repo includes Vercel config files for:

- the root storefront deployment
- `frontend/`
- `admin pannel/`
- `Backend/`

Common deployment pattern:

1. Deploy `Backend/` as the API service.
2. Deploy `frontend/` as the storefront.
3. Deploy `admin pannel/` as the admin app.
4. Set `FRONTEND_URL` and `ADMIN_URL` in the backend environment so CORS and Stripe redirects work correctly.
5. If using Stripe, configure the webhook endpoint as `https://<backend-domain>/api/orders/stripe/webhook`.

## Current Gaps

- No automated test suite is wired into the root scripts.
- No `LICENSE` file is declared at the repository root.
- The admin directory name contains a typo (`admin pannel`), so keep that in mind for tooling and deployment setup.
