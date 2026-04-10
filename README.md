# 🚁 Drone Food Delivery — Backend

A complete REST API backend for a drone-based food delivery app built with **Node.js**, **Express**, and **MongoDB**.

---

## 📁 Folder Structure

```
drone-delivery/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Signup / Login logic
│   └── orderController.js     # Order CRUD + admin view
├── middleware/
│   ├── authMiddleware.js      # JWT protect + adminOnly
│   └── errorHandler.js        # Global error + 404 handler
├── models/
│   ├── User.js                # User schema (hashed passwords)
│   └── Order.js               # Order schema with status lifecycle
├── routes/
│   ├── authRoutes.js          # POST /signup, POST /login
│   └── orderRoutes.js         # Order endpoints
├── services/
│   └── droneSimulator.js      # setTimeout-based status progression
├── .env.example               # Environment variable template
├── package.json
└── server.js                  # App entry point
```

---

## ⚙️ Setup Instructions

### 1. Clone / copy the project
```bash
cd drone-delivery
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/drone_delivery
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

> **MongoDB Atlas (cloud):** Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster.mongodb.net/drone_delivery`

### 4. Run the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:5000
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint  | Body | Auth |
|--------|-----------|------|------|
| POST   | /signup   | `{ name, email, password }` | None |
| POST   | /login    | `{ email, password }` | None |

### Orders

| Method | Endpoint           | Body | Auth |
|--------|--------------------|------|------|
| POST   | /order             | See below | Bearer token |
| GET    | /orders/:userId    | — | Bearer token |
| GET    | /order/:id         | — | Bearer token |
| GET    | /admin/orders      | — | Admin token |

**Place Order body:**
```json
{
  "foodItems": [
    { "name": "Margherita Pizza", "quantity": 1, "price": 299 },
    { "name": "Coke 500ml",       "quantity": 2, "price": 60  }
  ],
  "deliveryLocation": {
    "address": "12 MG Road",
    "city": "Bangalore",
    "pincode": "560001",
    "lat": 12.9716,
    "lng": 77.5946
  }
}
```

---

## 🤖 Drone Simulation Timeline

When an order is placed:

```
 0s  → Order created          (status: Preparing)
15s  → Drone dispatched       (status: Dispatched)
45s  → Package delivered      (status: Delivered)
```

Adjust delays in `services/droneSimulator.js`:
```js
const DISPATCH_DELAY = 15_000;  // ms
const DELIVER_DELAY  = 45_000;  // ms
```

---

## 🌐 Frontend Integration

### Using fetch

```js
const BASE_URL = "http://localhost:5000";

// ── Signup ──
const signup = async () => {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jane", email: "jane@example.com", password: "secret123" }),
  });
  const data = await res.json();
  localStorage.setItem("token", data.data.token); // store JWT
};

// ── Login ──
const login = async () => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "jane@example.com", password: "secret123" }),
  });
  const data = await res.json();
  localStorage.setItem("token", data.data.token);
};

// ── Place Order ──
const placeOrder = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      foodItems: [{ name: "Burger", quantity: 2, price: 150 }],
      deliveryLocation: { address: "5 Park St", city: "Mumbai", pincode: "400001" },
    }),
  });
  const data = await res.json();
  console.log("Order placed:", data.data._id);
};

// ── Track Order (poll every 10s) ──
const trackOrder = async (orderId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/order/${orderId}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await res.json();
  console.log("Current status:", data.data.status);
};
```

### Using axios

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Signup
await api.post("/signup", { name, email, password });

// Login
const { data } = await api.post("/login", { email, password });
localStorage.setItem("token", data.data.token);

// Place Order
await api.post("/order", { foodItems, deliveryLocation });

// Track Order
const { data: order } = await api.get(`/order/${orderId}`);
console.log(order.data.status); // "Preparing" | "Dispatched" | "Delivered"

// My Orders
const { data: orders } = await api.get(`/orders/${userId}`);
```

---

## 🔒 Making a User Admin

Currently there's no admin signup UI (intentional — security). To promote a user:

```js
// In MongoDB shell or Compass:
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| express | HTTP framework |
| mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| dotenv | Environment config |
| nodemon | Dev auto-reload |
