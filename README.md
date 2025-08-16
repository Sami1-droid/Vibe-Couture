# 🌸 Perfume Store - Full-Stack E-Commerce Platform

A modern, responsive, and feature-rich e-commerce platform for perfumes built with the MERN stack, featuring advanced UI/UX, comprehensive authentication, payment processing, and scalable architecture.

## ✨ Features

### 🎯 Core Features
- **Modern UI/UX**: Sleek, responsive design with dark/light theme support
- **Full Authentication**: Registration, login, email verification, password reset
- **Product Catalog**: Advanced filtering, search, and categorization
- **Shopping Cart**: Persistent cart with guest and user support
- **Secure Checkout**: Stripe payment integration
- **Order Management**: Complete order tracking and management
- **Admin Dashboard**: Comprehensive admin panel for managing products, orders, and users
- **Real-time Updates**: Socket.IO for live notifications and updates

### 🚀 Technical Features
- **TypeScript**: Full type safety across the entire application
- **Responsive Design**: Mobile-first approach with modern CSS
- **API Integration**: RESTful APIs with comprehensive error handling
- **File Uploads**: Secure image upload system
- **Email System**: Automated email notifications
- **Caching**: Redis for session management and caching
- **Security**: Helmet, rate limiting, input validation
- **Containerization**: Docker for easy deployment and scaling
- **Database**: MongoDB with optimized queries and indexing

### 🛡️ Security Features
- JWT authentication with token blacklisting
- Account lockout after failed login attempts
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload with type checking
- CORS configuration
- Security headers with Helmet

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│   Express API    │────│   MongoDB       │
│   (TypeScript)  │    │   (Node.js)      │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐              ┌─────────┐           ┌─────────┐
    │  Nginx  │              │  Redis  │           │ Socket  │
    │ (Proxy) │              │ (Cache) │           │   IO    │
    └─────────┘              └─────────┘           └─────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **React Query** for state management and caching
- **Framer Motion** for animations
- **React Hook Form** with Yup validation
- **Styled Components** and custom CSS
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Redis** for caching and sessions
- **JWT** for authentication
- **Stripe** for payments
- **Multer** for file uploads
- **Nodemailer** for emails
- **Socket.IO** for real-time features

### DevOps & Deployment
- **Docker** with Docker Compose
- **Nginx** for load balancing
- **MongoDB Atlas** (production)
- **Redis Cloud** (production)
- **Health checks** and monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd perfume-store
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env

   # Edit the .env files with your configuration
   ```

4. **Start with Docker (Recommended)**
   ```bash
   # Start all services
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop all services
   docker-compose down
   ```

5. **Or start manually**
   ```bash
   # Start MongoDB and Redis locally
   # Then in separate terminals:

   # Start backend
   cd server
   npm run dev

   # Start frontend
   cd client
   npm start
   ```

## 🔧 Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/perfume_store
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CLIENT_URL=http://localhost:3000
```

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
POST   /api/auth/logout        - Logout user
GET    /api/auth/me            - Get current user
PUT    /api/auth/profile       - Update profile
POST   /api/auth/forgot-password - Request password reset
```

### Product Endpoints
```
GET    /api/products           - Get all products (with filters)
GET    /api/products/:slug     - Get single product
POST   /api/products           - Create product (admin)
PUT    /api/products/:id       - Update product (admin)
DELETE /api/products/:id       - Delete product (admin)
```

### Cart Endpoints
```
GET    /api/cart               - Get user cart
POST   /api/cart/add           - Add item to cart
PUT    /api/cart/update        - Update cart item
DELETE /api/cart/remove        - Remove cart item
```

### Order Endpoints
```
GET    /api/orders             - Get user orders
POST   /api/orders             - Create new order
GET    /api/orders/:id         - Get single order
PUT    /api/orders/:id/status  - Update order status (admin)
```

## 🗄️ Database Schema

### User Schema
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: ['user', 'admin'],
  addresses: [AddressSchema],
  wishlist: [ProductId],
  isEmailVerified: Boolean
}
```

### Product Schema
```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  brand: String,
  category: ['eau-de-parfum', 'eau-de-toilette', ...],
  gender: ['men', 'women', 'unisex'],
  variants: [VariantSchema],
  images: [ImageSchema],
  scentFamily: { primary: String, secondary: [String] },
  notes: { top: [String], middle: [String], base: [String] }
}
```

## 🎨 UI Components

The application includes a comprehensive component library:

- **Layout Components**: Header, Footer, Sidebar
- **UI Components**: Buttons, Cards, Modals, Forms
- **Product Components**: ProductCard, ProductGrid, ProductDetail
- **Cart Components**: CartItem, CartSummary, Checkout
- **Admin Components**: AdminTable, AdminForm, Dashboard

## 🔒 Security Measures

1. **Authentication Security**
   - JWT tokens with expiration
   - Token blacklisting on logout
   - Account lockout after failed attempts
   - Password hashing with bcrypt

2. **API Security**
   - Rate limiting
   - Input validation
   - CORS configuration
   - Helmet for security headers

3. **Data Security**
   - MongoDB injection prevention
   - XSS protection
   - CSRF protection
   - Secure file uploads

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Flexible grid system
- Touch-friendly interfaces
- Optimized images and assets
- Progressive Web App features

## 🚀 Deployment

### Production Deployment with Docker

1. **Build and deploy**
   ```bash
   # Build for production
   docker-compose -f docker-compose.prod.yml build

   # Deploy
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Environment Setup**
   - Update environment variables for production
   - Configure MongoDB Atlas
   - Set up Redis Cloud
   - Configure domain and SSL

### Scaling Options

The application supports horizontal scaling:
- Load balancing with Nginx
- Database sharding
- Redis clustering
- CDN for static assets

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test

# Run integration tests
npm run test:integration
```

## 📊 Monitoring

The application includes:
- Health check endpoints
- Request logging
- Error tracking
- Performance monitoring
- Database query optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React and Node.js communities
- MongoDB and Redis teams
- Stripe for payment processing
- All open-source contributors

---

**Built with ❤️ for the modern web**