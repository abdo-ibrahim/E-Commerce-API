# E-commerce API

An **E-commerce RESTful API** built with **Node.js, Express, and MongoDB**, providing features for authentication, product management, orders, cart, wishlist, coupons, shipping, reviews, and more.

## 🚀 Features

| Feature | Coded? | Description |
|---------|--------|-------------|
| Authentication & Authorization | ✅ | User registration, login, logout, email verification, password reset, role-based access |
| User Profile Management | ✅ | Update profile, change password, upload profile picture, manage addresses |
| Product Management | ✅ | CRUD operations for products with multiple image uploads |
| Category Management | ✅ | CRUD operations for categories with image upload |
| Cart Management | ✅ | Add, update, remove, and clear cart items |
| Wishlist Management | ✅ | Add and remove products from wishlist |
| Orders | ✅ | Place orders, view my orders, update order status, pay orders |
| Coupons | ✅ | Create, apply, and manage discount coupons |
| Reviews | ✅ | Users can add, update, and delete reviews for products |
| Shipping | ✅ | Manage shipping options per governorate |
| File Upload | ✅ | Profile pictures, product images, and category images stored in Cloudinary |
| Security | ✅ | Helmet, rate limiting, XSS & NoSQL injection protection, CORS |
| Error Handling & Logging | ✅ | Centralized error handling and request logging |

## Installation

1. Clone the repository: `git clone https://github.com/abdo-ibrahim/E-Commerce-AP.git`
2. Install dependencies: `npm install`
3. Open the `.env` file and set the environment variables specified within.
4. Start the server: `npm start`

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/signup` | POST | Register a new user |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/logout` | GET | User logout |
| `/api/v1/auth/verify-email` | POST | Verify user email |
| `/api/v1/auth/forgot-password` | POST | Request password reset |
| `/api/v1/auth/reset-password/:token` | PUT | Reset password using token |
| `/api/v1/auth/check-auth` | GET | Check if user is authenticated |

### Users

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/users` | GET | Get all users (admin only) |
| `/api/v1/users/:id` | GET | Get a single user by ID (admin only) |
| `/api/v1/users/:id` | PUT | Update a user by ID (admin only) |
| `/api/v1/users/:id` | DELETE | Delete a user by ID (admin only) |
| `/api/v1/users/me` | GET | Get current user's profile |
| `/api/v1/users/update-me` | PUT | Update current user's profile |
| `/api/v1/users/update-password` | PUT | Update current user's password |
| `/api/v1/users/delete-me` | DELETE | Delete current user's account |
| `/api/v1/users/upload-profile-picture` | POST | Upload profile picture |
| `/api/v1/users/addresses` | POST | Add a new address |
| `/api/v1/users/addresses` | GET | Get all user addresses |
| `/api/v1/users/addresses/:addressId` | PUT | Update an address |
| `/api/v1/users/addresses/:addressId` | DELETE | Remove an address |

### Products

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products` | POST | Create a new product (admin only) |
| `/api/v1/products` | GET | Get all products |
| `/api/v1/products/:id` | GET | Get a product by ID |
| `/api/v1/products/:id` | PUT | Update a product (admin only) |
| `/api/v1/products/:id` | DELETE | Delete a product (admin only) |

### Categories

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/categories` | POST | Create a new category (admin only) |
| `/api/v1/categories` | GET | Get all categories |
| `/api/v1/categories/:id` | GET | Get a category by ID |
| `/api/v1/categories/:id` | PUT | Update a category (admin only) |
| `/api/v1/categories/:id` | DELETE | Delete a category (admin only) |

### Cart

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cart` | GET | Get user's cart |
| `/api/v1/cart` | POST | Add item to cart |
| `/api/v1/cart/:productId` | PUT | Update cart item quantity |
| `/api/v1/cart/clear` | DELETE | Clear cart |
| `/api/v1/cart/:productId` | DELETE | Remove item from cart |

### Wishlist

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/wishlist` | GET | Get user's wishlist |
| `/api/v1/wishlist` | POST | Add product to wishlist |
| `/api/v1/wishlist/:productId` | DELETE | Remove product from wishlist |

### Orders

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/orders` | POST | Create a new order |
| `/api/v1/orders` | GET | Get all orders (admin only) |
| `/api/v1/orders/my-orders` | GET | Get current user's orders |
| `/api/v1/orders/:id` | GET | Get an order by ID |
| `/api/v1/orders/:id` | PUT | Update order status (admin only) |
| `/api/v1/orders/:id/pay` | PUT | Pay for an order |
| `/api/v1/orders/:id` | DELETE | Delete an order (admin only) |

### Coupons

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/coupons` | POST | Create a new coupon (admin only) |
| `/api/v1/coupons` | GET | Get all coupons (admin only) |
| `/api/v1/coupons/:id` | GET | Get a coupon by ID (admin only) |
| `/api/v1/coupons/:id` | PUT | Update a coupon (admin only) |
| `/api/v1/coupons/:id` | DELETE | Delete a coupon (admin only) |
| `/api/v1/coupons/apply/:code` | GET | Get coupon by code (admin only) |
| `/api/v1/coupons/apply/:code` | POST | Apply a coupon |

### Reviews

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/reviews` | POST | Create a new review |
| `/api/v1/reviews/:productId` | GET | Get all reviews for a product |
| `/api/v1/reviews/:id` | PUT | Update a review |
| `/api/v1/reviews/:id` | DELETE | Delete a review |

### Shipping

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/shipping` | POST | Create a new shipping option (admin only) |
| `/api/v1/shipping` | GET | Get all shipping options |
| `/api/v1/shipping/:id` | PUT | Update a shipping option (admin only) |
| `/api/v1/shipping/:id` | DELETE | Delete a shipping option (admin only) |

## Security

This API implements several security measures, including:

- **Rate Limiting**: Limits the number of requests a client can make within a specified time frame.
- **Helmet Protection**: Adds various HTTP headers to enhance security.
- **XSS Protection**: Sanitizes user input to prevent cross-site scripting attacks.
- **Data Sanitization**: Prevents NoSQL query injection by sanitizing user-supplied data.
- **CORS**: Enables Cross-Origin Resource Sharing to control which domains can access the API.