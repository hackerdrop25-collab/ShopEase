# ShopEase 🛒

A production-quality, full-stack e-commerce web application built with **React.js**, **Node.js/Express**, **MongoDB Atlas**, **Razorpay** (payments), and **Cloudinary** (image uploads).

---

## 📁 Project Structure

```
Ecommerce/
├── client/                    # React.js frontend
│   ├── public/
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Page-level components
│       ├── context/           # Context API (auth, cart)
│       ├── services/          # Axios API service functions
│       ├── hooks/             # Custom React hooks
│       ├── utils/             # Utility functions
│       └── App.js
├── server/                    # Node.js/Express backend
│   ├── config/                # DB and Cloudinary config
│   ├── controllers/           # Route handler logic
│   ├── middleware/            # Auth, role-check, error, validate
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routers
│   ├── utils/                 # Helper utilities
│   ├── app.js                 # Express application
│   └── server.js              # Entry point
├── .env.example               # Environment variable template
├── package.json               # Root workspace scripts
└── README.md
```

---

## ⚙️ Environment Variables

Copy `server/.env.example` → `server/.env` and fill in your values:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRE` | JWT expiry duration (e.g., `7d`) |
| `JWT_COOKIE_EXPIRE` | Cookie expiry in days (e.g., `7`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `EMAIL_HOST` | SMTP host (e.g., `smtp.mailtrap.io`) |
| `EMAIL_PORT` | SMTP port (e.g., `2525`) |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `EMAIL_FROM` | From address (e.g., `noreply@shopease.com`) |
| `CLIENT_URL` | Frontend URL for CORS (e.g., `http://localhost:3000`) |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB)
- Razorpay test account
- Cloudinary account
- Mailtrap account (for email testing)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/shopease.git
cd shopease/Ecommerce

# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies (Phase 7+)
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
cp server/.env server/.env.local  # or just edit server/.env directly
# Fill in your MongoDB URI, JWT secret, Cloudinary keys, Razorpay keys, SMTP credentials
```

### 3. Run the Backend

```bash
# From Ecommerce/ root:
npm run server

# Or directly:
cd server && npm run dev
```

Server starts at: **http://localhost:5000**
Health check: **http://localhost:5000/api/health**

### 4. Run the Frontend (Phase 7+)

```bash
npm run client
```

Client starts at: **http://localhost:3000**

### 5. Run Both Concurrently

```bash
npm run dev
```

---

## 🌐 REST API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Welcome message | Public |
| GET | `/api/health` | Server health check | Public |
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |
| GET | `/api/auth/profile` | Get current user profile | 🔒 User |
| PUT | `/api/auth/profile` | Update profile | 🔒 User |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| PUT | `/api/auth/reset-password/:token` | Reset password | Public |
| GET | `/api/products` | Get all products (with filter/search/pagination) | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products` | Create product | 🔒 Admin |
| PUT | `/api/products/:id` | Update product | 🔒 Admin |
| DELETE | `/api/products/:id` | Delete product | 🔒 Admin |
| GET | `/api/cart` | Get user cart | 🔒 User |
| POST | `/api/cart` | Add item to cart | 🔒 User |
| PUT | `/api/cart/:id` | Update cart item quantity | 🔒 User |
| DELETE | `/api/cart/:id` | Remove item from cart | 🔒 User |
| POST | `/api/orders` | Place new order | 🔒 User |
| GET | `/api/orders` | Get user orders | 🔒 User |
| GET | `/api/orders/:id` | Get order details | 🔒 User |
| POST | `/api/payment/create-order` | Create Razorpay order | 🔒 User |
| POST | `/api/payment/verify` | Verify Razorpay payment | 🔒 User |

---

## 🧱 Build Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Backend setup + MongoDB + Scaffolding | ✅ Complete |
| 2 | Mongoose Models | ⏳ Pending |
| 3 | Auth Module (JWT/bcrypt/middleware) | ⏳ Pending |
| 4 | Product CRUD + search/filter/pagination | ⏳ Pending |
| 5 | Cart, Wishlist, Order APIs | ⏳ Pending |
| 6 | Payment (Razorpay) + Cloudinary | ⏳ Pending |
| 7 | React Frontend (User flow) | ⏳ Pending |
| 8 | React Frontend (Admin dashboard) | ⏳ Pending |
| 9 | Deployment Instructions | ⏳ Pending |

---

## 🛡️ Security Features

- **Helmet** – Secure HTTP headers
- **CORS** – Whitelist-based origin control
- **Rate Limiting** – 100 req/15min globally, 20 req/15min for auth
- **JWT + bcrypt** – Secure authentication and password hashing
- **httpOnly Cookies** – XSS-resistant token storage
- **Mongo Sanitize** – Prevents NoSQL injection
- **express-validator** – Input validation on all routes
- **Environment Variables** – All secrets stored in `.env`, never committed

---

## 🚢 Deployment (Phase 9)

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 📄 License

MIT © ShopEase Team
