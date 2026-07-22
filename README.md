# 👗 RentIt — Clothes Rental Platform

**RentIt** is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed for renting clothes, footwear, accessories, and costumes. It allows users to easily list their wardrobe items for rent or rent outfits from others at daily rates.

---

## ✨ Features

- 🔐 **User Authentication & Authorization**: Secure signup, login, password encryption via `bcryptjs`, and JWT token authentication.
- 👗 **Wardrobe Listing & Management**: Users can post items for rent with images, categories, sizes, daily rates, and stock availability. Edit or remove listings anytime.
- 🔍 **Browse & Discovery**: Explore rentals categorized into **Men**, **Women**, and **Kids** across **Clothing**, **Accessories**, **Footwear**, and **Costumes**.
- 🗓️ **Rental Date Selection**: Select custom rental durations using interactive date range pickers.
- 🛒 **Cart & Wishlist System**: Add items to a personal wishlist (Liked items) or add them to the cart for rental booking.
- 👤 **User Profiles**: Manage user contact info, address details, posted items, and active rental history.
- 📱 **Responsive Design**: Clean UI with custom styling and smooth interaction flows.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Routing**: `react-router-dom` v6
- **HTTP Client**: Axios
- **Date Handling**: `react-datepicker`, `date-fns`
- **Icons & UI**: FontAwesome, React Icons, React Modal

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security & Validation**: JWT (`jsonwebtoken`), `bcryptjs`, `validator`, `cookie-parser`, `cors`

---


## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

---

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables in `backend/config.env`:
   ```env
   PORT=5000
   DATABASE=mongodb://localhost:27017/clothing-rental
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=90d
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Navigate to the React client directory:
   ```bash
   cd frontend/wt-cp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The client will open in your browser at `http://localhost:3000`.

---

## 🔗 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/users/signup` | Register a new user |
| `POST` | `/api/v1/users/login` | Authenticate user & issue JWT |
| `GET` | `/api/v1/products` | Fetch all available rental items |
| `POST` | `/api/v1/products` | Create a new rental listing |
| `PATCH` | `/api/v1/products/:id` | Update product details |
| `DELETE` | `/api/v1/products/:id` | Remove a rental listing |
| `POST` | `/api/v1/users/cart` | Update user cart items |
| `POST` | `/api/v1/users/liked` | Toggle item in wishlist |

---
