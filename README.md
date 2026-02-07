# 🛒 Community Marketplace Web App

A full-stack marketplace where users can upload products, browse items uploaded by others, add items to wishlist/cart, and purchase products.
Built using **React, Node.js/Express, and PostgreSQL** with secure authentication and Google OAuth.

---

## 🚀 Features

### 🔐 Authentication & Security

* User registration and login with **JWT authentication**
* **Google OAuth login**
* Access & refresh token system
* Role-based login (Admin / User)
* Secure password hashing with **bcrypt**

---

### 🛍️ Marketplace Core

* Users can **upload products with images**
* Uploaded products become visible to all users instantly
* Browse all products in dashboard
* Add/remove products to:

  * ❤️ Wishlist
  * 🛒 Cart
* Persistent storage using PostgreSQL

---

### 📦 Product Management

* Upload product details:

  * Title
  * Image
  * Price (old/new)
  * Ratings & reviews
  * Brand/company
  * Category & color
* Images stored locally and served via Express static folder

---

### 👤 User Experience

* Protected routes for logged-in users
* Dynamic dashboard
* Wishlist & Cart pages
* Smooth login page with image carousel
* Token auto-refresh support

---

## 🧱 Tech Stack

### Frontend

* React
* React Router
* Axios
* Google OAuth (@react-oauth/google)

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer (image upload)
* Nodemailer (email support ready)

### Database

* PostgreSQL

---

## 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── routes/
│   │   └── auth.js
│   ├── jwt.js
│   ├── db.js
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── App.js
│
└── uploads/   (product images)
```

---


## 🔄 Authentication Flow

1. User logs in (email/password or Google)
2. Backend verifies credentials
3. JWT access & refresh tokens generated
4. Protected routes use JWT middleware
5. Refresh endpoint renews expired access tokens

---

## 🌐 API Endpoints

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| POST   | /auth/register     | Register user        |
| POST   | /auth/login        | Login user           |
| POST   | /auth/google       | Google login         |
| POST   | /auth/logout       | Logout               |
| POST   | /auth/refresh      | Refresh access token |
| GET    | /auth/products     | Get all products     |
| POST   | /auth/upload       | Upload product       |
| POST   | /auth/wishlist/:id | Add to wishlist      |
| DELETE | /auth/wishlist/:id | Remove wishlist      |
| POST   | /auth/cart/:id     | Add to cart          |
| DELETE | /auth/cart/:id     | Remove cart          |

---

## 🎯 Future Improvements

* Payment integration (Stripe)
* Product reviews & ratings
* Order history
* Deployment (Render/AWS)

---

## 👨‍💻 Author

Built as a full-stack learning project demonstrating authentication, REST APIs, database integration, and modern React frontend.
