# ShopBD — Multi-Category E-Commerce Platform (Starter)

React (Vite) + Redux Toolkit + Tailwind frontend, Node/Express + MongoDB backend.

## Folder Structure

```
ecommerce/
├── client/     # React frontend
└── server/     # Node/Express API
```

## What's included

**Backend (server/)**
- Auth: register, login, JWT, bcrypt password hashing, get/update profile
- Products: CRUD (admin), list with search/filter/sort/category/pagination
- Categories & Brands: list, admin create/update/delete
- Cart: add/update/remove/clear (per logged-in user)
- Orders: place order from cart (all or selected items), direct "Buy Now" order,
  cancel, my orders, order details
- Manual bKash/Nagad payment: customer sends money to a fixed merchant number and
  reports the sender number + transaction ID; admin verifies and marks it paid
- Image upload: Cloudinary (admin can upload a file directly, not just paste a URL)
- Reviews: add/list/delete, auto rating recalculation
- Coupons: admin CRUD + validate
- Admin: dashboard stats, manage users/products/orders/categories/coupons
- Security: helmet, cors, rate limiting, JWT auth middleware, role-based authorize()
- `seed.js` — creates an admin user + sample categories/products

**Frontend (client/)**
- Home page hero slider (auto-rotating banners with manual arrows/dots)
- Pages: Home, Products (search/sort/category filter/pagination), Product Details,
  Cart, Checkout, Buy Now (direct single-product purchase), Login, Register, Profile,
  My Orders, Order Details, Wishlist (placeholder), 404
- Product cards have both "Add to Cart" and "Buy Now" buttons
- Cart page: select-all or select individual items for checkout, +/- quantity buttons
- Admin panel: Dashboard, Products (image upload or URL, category dropdown), Orders
  (expandable — shows customer info, full shipping address, payment/transaction
  details, item breakdown), Categories (protected, admin-only)
- Redux Toolkit slices: auth, cart, products
- Axios service layer with JWT auto-attached
- Tailwind CSS styling, responsive layout

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGO_URI (MongoDB Atlas or local) and JWT_SECRET
npm run seed     # creates admin user (admin@shopbd.com / admin123) + sample products
npm run dev      # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm run dev      # starts on http://localhost:5173
```

Login as admin (`admin@shopbd.com` / `admin123`) and visit `/admin` to manage products,
categories, and orders.

## Image upload (Cloudinary)

Admin → Products has a real file upload option (in addition to pasting a URL).

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From your Cloudinary dashboard, copy: Cloud Name, API Key, API Secret
3. Add to `server/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart the backend. Uploaded images are stored in Cloudinary and the URL is saved
   on the product.

## bKash / Nagad payment (manual — no gateway required)

Checkout and Buy Now both offer Cash on Delivery, bKash, or Nagad. Choosing bKash/Nagad
shows the merchant number **01568540290** and asks the customer to:
1. Send the order total to that number using their bKash/Nagad app
2. Enter the number they sent from + the Transaction ID they received
3. Submit — the order is created with `paymentStatus: pending`

**Admin's job:** open the order in Admin → Orders, check the Transaction ID against your
own bKash/Nagad app history, and once confirmed, change Payment Status to "paid" and
Order Status to "processing". This is the standard manual-verification flow used by most
small Bangladeshi shops — no merchant API integration or business documents required
since it's your personal/agent number.

To change the merchant number later, edit `BKASH_NAGAD_NUMBER` in
`client/src/utils/constants.js` and `receiverNumber` in
`server/controllers/orderController.js` (`buildManualPayment`).

**If you later want fully automatic bKash/Nagad confirmation** (no manual admin check),
that requires bKash/Nagad's official merchant API, which needs business registration
documents — a bigger step than this manual flow, and something Claude can wire in
whenever you're ready to apply for those credentials.

## Category-wise browsing

Products page shows a row of category pills (pulled from your Categories); clicking one
filters the grid and updates the URL (`/products?category=<id>`), so it's shareable/
bookmarkable. Make sure to create categories in Admin → Categories and assign each
product to one in Admin → Products for this to be useful.

## Not yet implemented (from the original spec — next steps)

- Wishlist backend + UI
- Email/SMS notifications, OTP verification
- Seller panel
- PDF invoice generation
- SEO (meta tags, sitemap, schema markup)
- Deployment configs for Vercel/Render/Railway

## Deployment (matches your usual pattern)

- Frontend → Netlify or Vercel (set `VITE_API_URL` env var to your backend URL)
- Backend → Railway or Render (set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` env vars)
- Database → MongoDB Atlas
