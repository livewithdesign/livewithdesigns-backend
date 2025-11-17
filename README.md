# Live With Designs - Backend API

This is the backend API for the Live With Designs e-commerce platform built with Node.js, Express, MongoDB, and Cloudinary.

## Features

- User authentication and authorization with JWT
- Product management (CRUD operations)
- Project showcase management
- Blog system with categories
- Contact form handling
- Service listings
- Order management
- Cart and wishlist functionality
- Media management with Cloudinary integration
- Admin dashboard endpoints

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account for media storage

## Installation

1. Navigate to the backend directory:
```bash
cd livewithdesigns-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/livedesigns
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
PORT=5000
NODE_ENV=development
```

For local MongoDB development, change MONGODB_URI to:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/livedesigns
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Add new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

- `GET /api/projects` - Get all projects
- `GET /api/projects/:category` - Get projects by category
- `GET /api/projects/:category/:slug` - Get single project details
- `POST /api/projects` - Add new project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)

- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:slug` - Get single blog post
- `GET /api/blog?category=X` - Filter by category
- `POST /api/blog` - Add new post (Admin)
- `PUT /api/blog/:id` - Update post (Admin)
- `DELETE /api/blog/:id` - Delete post (Admin)
- `POST /api/blog/:id/like` - Like a post

- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages (Admin)
- `GET /api/contact/:id` - Get single message (Admin)
- `PUT /api/contact/:id` - Update message status (Admin)
- `DELETE /api/contact/:id` - Delete message (Admin)
- `POST /api/contact/:id/respond` - Reply to contact form (Admin)

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get logged-in user
- `PUT /api/auth/profile/:id` - Update profile
- `POST /api/auth/forgot-password` - Password reset

- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/:id/track` - Track order

- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart
- `POST /api/cart/clear` - Clear cart

- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist
- `POST /api/wishlist/move-to-cart/:productId` - Move to cart

## Frontend Integration

To connect the frontend to this backend:

1. In the frontend directory (`livewithdesigns/.env.local`), set:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

2. The frontend components are already configured to use the API endpoints defined here.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)