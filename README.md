# PlugFindr - Marketplace Platform

A comprehensive full-stack marketplace application that connects students with vendors. Built with modern web technologies, featuring real-time AI assistance, vendor management, and a robust admin dashboard.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [Running the Project](#running-the-project)
7. [Database Models](#database-models)
8. [API Routes](#api-routes)
9. [Key Features](#key-features)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

**PlugFindr** is a student-vendor marketplace platform designed to:
- Help students discover and review vendors
- Allow vendors to manage products and profiles
- Provide administrators with platform management tools
- Offer AI-powered support through an intelligent chatbot
- Facilitate feedback and complaint management

### User Roles
- **Student**: Browse vendors, write reviews, search products
- **Vendor**: Manage products, view analytics, handle orders
- **Admin**: Manage users, vendors, complaints, platform statistics

---

## 🛠 Tech Stack

### **Backend**
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js + Express** | REST API server & request handling | Express v4.19 |
| **TypeScript** | Type-safe backend development | v5.6 |
| **MongoDB Atlas** | Cloud database (NoSQL) | via Mongoose v8.5 |
| **Mongoose** | MongoDB ODM (Object Data Modeling) | v8.5.1 |
| **Firebase Admin SDK** | Authentication & user management | v13.6.1 |
| **Firebase** | Real-time services | v12.9.0 |
| **JWT (jsonwebtoken)** | Token-based authentication | v9.0.2 |
| **bcryptjs** | Password hashing & encryption | v2.4.3 |
| **Multer** | File upload handling | v1.4.5 |
| **axios** | HTTP client for external APIs | v1.13.6 |
| **CORS** | Cross-Origin Resource Sharing | v2.8.5 |
| **Morgan** | HTTP request logging | v1.10.0 |
| **dotenv** | Environment variables management | v16.6.1 |

### **Frontend**
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI library & component framework | v18.2.0 |
| **TypeScript** | Type-safe frontend development | v5.2.2 |
| **Vite** | Build tool & dev server | v7.3.1 |
| **React Router DOM** | Client-side routing | v6.20.0 |
| **Tailwind CSS** | Utility-first CSS framework | (in project) |
| **React Hook Form** | Form state management | v7.71.1 |
| **Zod** | Schema validation & TypeScript support | v4.3.6 |
| **axios** | HTTP client for API calls | v1.6.2 |
| **Firebase SDK** | Authentication client | v12.9.0 |
| **@hookform/resolvers** | Form validation helpers | v5.2.2 |

### **External Services**
- **Google Authentication**: OAuth 2.0 for user sign-in
- **Firebase Firestore**: Real-time database (if applicable)
- **MongoDB Atlas**: Cloud database hosting
- **Groq AI API**: AI chatbot responses (mentioned in AI setup)

---

## 📁 Project Structure

```
capstone/
├── Backend/                          # Express.js API server
│   ├── src/
│   │   ├── app.ts                   # Express app initialization
│   │   ├── server.ts                # Server entry point
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB connection
│   │   │   ├── cors.ts             # CORS configuration
│   │   │   └── firebaseAdmin.ts    # Firebase Admin SDK setup
│   │   ├── controllers/             # Business logic handlers
│   │   │   ├── authController.ts   # Authentication (login, signup, etc.)
│   │   │   ├── studentController.ts # Student-specific operations
│   │   │   ├── vendorController.ts  # Vendor management
│   │   │   ├── adminController.ts   # Admin operations
│   │   │   ├── aiController.ts      # AI chatbot responses
│   │   │   ├── imageController.ts   # Image management
│   │   │   └── uploadController.ts  # File upload handling
│   │   ├── routes/                  # API route definitions
│   │   │   ├── authRoutes.ts       # Authentication endpoints
│   │   │   ├── studentRoutes.ts    # Student endpoints
│   │   │   ├── vendorRoutes.ts     # Vendor endpoints
│   │   │   ├── adminRoutes.ts      # Admin endpoints
│   │   │   ├── aiRoutes.ts         # AI chatbot endpoints
│   │   │   ├── imageRoutes.ts      # Image endpoints
│   │   │   └── uploadRoutes.ts     # Upload endpoints
│   │   ├── models/                  # MongoDB schema definitions
│   │   │   ├── User.ts             # User schema (base model)
│   │   │   ├── StudentProfile.ts   # Student extended profile
│   │   │   ├── VendorProfile.ts    # Vendor extended profile
│   │   │   ├── Product.ts          # Vendor products
│   │   │   ├── Review.ts           # Product reviews
│   │   │   ├── Feedback.ts         # General platform feedback
│   │   │   ├── Complaint.ts        # User complaints
│   │   │   ├── SearchLog.ts        # Search history tracking
│   │   │   └── VendorView.ts       # Vendor view analytics
│   │   ├── middleware/              # Request processing middleware
│   │   │   ├── authMiddleware.ts   # JWT authentication
│   │   │   ├── roleMiddleware.ts   # Role-based access control (RBAC)
│   │   │   ├── errorHandler.ts     # Global error handling
│   │   │   └── uploadMiddleware.ts # Multer file upload config
│   │   ├── utils/                   # Utility functions
│   │   │   ├── jwt.ts              # JWT token generation/verification
│   │   │   ├── searchEngine.ts     # Search algorithm implementation
│   │   │   ├── gridfs.ts           # GridFS for file storage in MongoDB
│   │   │   ├── aiPrompt.ts         # AI system prompts
│   │   │   ├── aiDatabaseHelpers.ts # AI database query utilities
│   │   │   ├── migrateImagesToGridFS.ts # Image migration utility
│   │   │   ├── checkVendorImages.ts    # Image validation utility
│   │   │   ├── fixReviewIndex.ts   # Database maintenance script
│   │   │   └── fixVendorIndex.ts   # Database maintenance script
│   │   └── uploads/                 # Local file uploads directory
│   │       └── flyers/             # Vendor flyer images
│   ├── scripts/
│   │   ├── deleteUserByEmail.ts    # User deletion script
│   │   ├── listUsers.ts            # List all users script
│   │   ├── productAudit.ts         # Product audit script
│   │   ├── vendorCleanup.ts        # Vendor cleanup script
│   │   └── convertFirebaseKey.js   # Firebase key conversion utility
│   ├── package.json                # Backend dependencies
│   ├── tsconfig.json               # TypeScript configuration
│   ├── AI_ASSISTANT_SETUP.md       # AI integration documentation
│   └── .env                        # Environment variables (not in repo)
│
├── frontend/                        # React Vite SPA
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Main App component
│   │   ├── App.css                 # Global styles
│   │   ├── vite-env.d.ts           # Vite environment types
│   │   ├── api/                    # API client modules
│   │   │   ├── axios.ts            # Axios instance configuration
│   │   │   ├── auth.ts             # Authentication API calls
│   │   │   ├── student.ts          # Student API calls
│   │   │   ├── vendor.ts           # Vendor API calls
│   │   │   ├── admin.ts            # Admin API calls
│   │   │   └── ai.ts               # AI chatbot API calls
│   │   ├── auth/                   # Authentication components
│   │   │   ├── AuthContext.tsx     # Auth state management (Context API)
│   │   │   └── ProtectedRoute.tsx  # Route protection wrapper
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.tsx          # Top navigation bar
│   │   │   ├── Sidebar.tsx         # Side navigation
│   │   │   ├── Footer.tsx          # Footer component
│   │   │   ├── Logo.tsx            # Logo component
│   │   │   ├── Loader.tsx          # Loading spinner
│   │   │   ├── BackButton.tsx      # Back navigation button
│   │   │   ├── GoogleSignInButton.tsx # Google OAuth button
│   │   │   ├── VendorCard.tsx      # Vendor card display
│   │   │   ├── HostelAutocomplete.tsx # Hostel name autocomplete
│   │   │   ├── CustomSelect.tsx    # Custom dropdown
│   │   │   ├── GlobalAIChat.tsx    # AI chatbot interface
│   │   │   ├── GeneralFeedbackModal.tsx # Feedback modal
│   │   │   ├── Icons.tsx           # SVG icons library
│   │   │   └── [CSS files]         # Component stylesheets
│   │   ├── contexts/               # Global state management
│   │   │   └── ThemeContext.tsx    # Dark/light theme state
│   │   ├── layouts/                # Page layout wrappers
│   │   │   ├── StudentLayout.tsx   # Student page layout
│   │   │   ├── VendorLayout.tsx    # Vendor page layout
│   │   │   └── AdminLayout.tsx     # Admin page layout
│   │   ├── pages/                  # Page components
│   │   │   ├── Landing.tsx         # Landing page
│   │   │   ├── About.tsx           # About page
│   │   │   ├── auth/               # Authentication pages
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── ResetPassword.tsx
│   │   │   │   ├── VerifyEmail.tsx
│   │   │   │   └── ResendVerification.tsx
│   │   │   ├── student/            # Student pages
│   │   │   │   ├── StudentDashboard.tsx
│   │   │   │   ├── VendorSearch.tsx
│   │   │   │   ├── VendorDetail.tsx
│   │   │   │   ├── Reviews.tsx
│   │   │   │   └── MyFeedback.tsx
│   │   │   ├── vendor/             # Vendor pages
│   │   │   │   ├── VendorDashboard.tsx
│   │   │   │   ├── VendorProfile.tsx
│   │   │   │   └── [other vendor pages]
│   │   │   └── admin/              # Admin pages
│   │   │       └── [admin pages]
│   │   ├── config/
│   │   │   └── firebase.ts         # Firebase client SDK initialization
│   │   ├── styles/                 # Global stylesheets & Tailwind
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── utils/                  # Utility functions
│   │   └── validation/             # Form validation schemas
│   ├── public/
│   │   └── assets/                 # Static assets (images, icons, etc.)
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── tsconfig.node.json          # TypeScript Node config
│   ├── vite.config.ts              # Vite build configuration
│   └── .env                        # Environment variables (not in repo)
│
└── README.md                        # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account
- **Firebase** project with Authentication enabled
- **Git** for version control

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd capstone
```

### Step 2: Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Check that TypeScript and tools are installed
npm list typescript express mongoose
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Check that Vite and React are installed
npm list vite react
```

---

## 🔐 Environment Variables

### Backend `.env` File

Create a `.env` file in the `Backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email@example.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# Alternative: Single Firebase Service Account JSON
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"...", ...}'

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Image Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Frontend `.env` File

Create a `.env` file in the `frontend/` directory:

```env
# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
```

### How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. **For Frontend**:
   - Go to Project Settings → General tab
   - Copy the config object (Web SDK snippet)
4. **For Backend Admin SDK**:
   - Go to Project Settings → Service Accounts tab
   - Generate a new private key (download as JSON)
   - Extract individual fields or use the full JSON string

### How to Get MongoDB Atlas URI

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db>`

---

## ▶️ Running the Project

### **Development Mode**

#### Start Backend Server

```bash
cd Backend

# Install dependencies (first time only)
npm install

# Run in development mode with hot-reload
npm run dev

# Output: Server running on http://localhost:5000
```

The backend uses `ts-node-dev` for hot-reloading during development.

#### Start Frontend Development Server

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Run Vite dev server
npm run dev

# Output: Local: http://localhost:5173
```

### **Production Mode**

#### Build Backend

```bash
cd Backend

# Build TypeScript to JavaScript
npm run build

# This generates a `dist/` directory
```

#### Start Backend (Production)

```bash
cd Backend

# Start the compiled server
npm start

# Output: Server running on http://localhost:5000
```

#### Build Frontend

```bash
cd frontend

# Build optimized production bundle
npm run build

# Output: Creates `dist/` directory
```

#### Preview Production Frontend Locally

```bash
cd frontend

# Preview the production build
npm run preview

# Visit: http://localhost:4173
```

---

## 📊 Database Models

All models are defined using **Mongoose** for MongoDB:

### **User (Base Model)**
```typescript
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string (unique),
  phone: string,
  password: string (hashed with bcryptjs),
  role: 'student' | 'vendor' | 'admin',
  isEmailVerified: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **StudentProfile**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  hostelName: string,
  hostelBlock: string,
  department: string,
  semester: number,
  savedVendors: ObjectId[] (ref: VendorProfile),
  createdAt: Date,
  updatedAt: Date
}
```

### **VendorProfile**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  businessName: string,
  description: string,
  location: string,
  rating: number (0-5),
  image: string (URL),
  products: ObjectId[] (ref: Product),
  createdAt: Date,
  updatedAt: Date
}
```

### **Product**
```typescript
{
  _id: ObjectId,
  vendorId: ObjectId (ref: VendorProfile),
  name: string,
  description: string,
  price: number,
  category: string,
  image: string (URL),
  stock: number,
  createdAt: Date,
  updatedAt: Date
}
```

### **Review**
```typescript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product),
  studentId: ObjectId (ref: StudentProfile),
  rating: number (1-5),
  comment: string,
  createdAt: Date,
  updatedAt: Date
}
```

### **Feedback**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: string,
  message: string,
  type: 'suggestion' | 'bug' | 'general',
  createdAt: Date,
  updatedAt: Date
}
```

### **Complaint**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  vendorId: ObjectId (ref: VendorProfile),
  title: string,
  description: string,
  status: 'open' | 'resolved' | 'closed',
  createdAt: Date,
  updatedAt: Date
}
```

### **SearchLog**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  query: string,
  results: number,
  createdAt: Date
}
```

---

## 🔗 API Routes

### Authentication Routes (`/api/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Email verification
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/logout` - User logout

### Student Routes (`/api/student`)
- `GET /student/dashboard` - Get student dashboard
- `GET /student/vendors` - List all vendors
- `GET /student/vendor/:id` - Get vendor details
- `POST /student/review` - Submit review
- `GET /student/my-reviews` - Get student's reviews
- `POST /student/feedback` - Submit feedback

### Vendor Routes (`/api/vendor`)
- `GET /vendor/dashboard` - Get vendor dashboard
- `POST /vendor/product` - Add new product
- `GET /vendor/products` - Get vendor's products
- `PUT /vendor/product/:id` - Update product
- `DELETE /vendor/product/:id` - Delete product
- `GET /vendor/analytics` - Get vendor analytics
- `PUT /vendor/profile` - Update vendor profile

### Admin Routes (`/api/admin`)
- `GET /admin/users` - List all users
- `GET /admin/vendors` - List all vendors
- `GET /admin/complaints` - View complaints
- `PUT /admin/complaint/:id` - Update complaint status
- `GET /admin/statistics` - Platform statistics
- `DELETE /admin/user/:id` - Delete user

### AI Routes (`/api/ai`)
- `POST /ai/chat` - Send message to AI chatbot
- `GET /ai/history` - Get chat history

### Upload Routes (`/api/upload`)
- `POST /upload/image` - Upload image
- `GET /upload/:id` - Retrieve uploaded image

### Image Routes (`/api/images`)
- `GET /images/:fileName` - Get image file
- `DELETE /images/:fileName` - Delete image file

---

## ✨ Key Features

### 🔐 **Authentication & Authorization**
- Google OAuth 2.0 integration
- Firebase Authentication
- JWT token-based sessions
- Role-based access control (RBAC)
- Email verification
- Password reset functionality

### 🏪 **Vendor Management**
- Create and manage vendor profiles
- Add/update/delete products
- View analytics and sales data
- Manage vendor ratings and reviews

### 👨‍🎓 **Student Features**
- Search vendors by location, category
- View product details
- Write and view reviews
- Save favorite vendors
- Submit feedback and complaints
- Access hostel-specific features

### 🤖 **AI Chatbot**
- Real-time AI assistance
- Data-driven responses (verified database queries)
- Platform statistics integration
- Natural language processing

### 📸 **Image Management**
- File upload handling via Multer
- GridFS integration for MongoDB
- Image optimization
- File storage in cloud or local

### 🛒 **Search & Discovery**
- Advanced vendor search
- Product search with filters
- Search history tracking
- Autocomplete suggestions

### 🎯 **Admin Dashboard**
- User management
- Vendor management
- Complaint resolution
- Platform statistics
- System monitoring

---

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
# Build the frontend
cd frontend
npm run build

# The `dist/` directory is ready for deployment
```

1. Push to GitHub
2. Connect repository to Vercel/Netlify
3. Set environment variables
4. Deploy automatically on push

### Backend Deployment (Railway/Render)

```bash
# Build backend
cd Backend
npm run build

# Set environment variables on hosting platform
# Set start command to: node dist/server.js
```

### Environment Variables for Production
- Update all `.env` variables with production values
- Firebase credentials for production project
- MongoDB Atlas URI for production database
- API URLs pointing to production frontend

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure IP address is whitelisted in MongoDB Atlas
- Check MONGODB_URI format
- Verify network connectivity

### Firebase Authentication Issues
- Verify Firebase credentials are correct
- Check that Google Sign-In is enabled in Firebase Console
- Confirm OAuth redirect URIs are set

### CORS Errors
- Verify CORS_ORIGIN in backend `.env`
- Ensure frontend URL matches CORS_ORIGIN
- Check `cors.ts` configuration

### Build Errors
- Clear `node_modules/` and reinstall: `npm install`
- Clear Vite cache: `rm -rf dist/` and rebuild
- Check TypeScript errors: `npx tsc --noEmit`

---

## 📝 Useful Scripts

### Backend Scripts
```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Delete user by email
npm run delete-user

# List all users
npm run ts-node-dev --transpile-only scripts/listUsers.ts

# Vendor cleanup
npm run ts-node-dev --transpile-only scripts/vendorCleanup.ts

# Product audit
npm run ts-node-dev --transpile-only scripts/productAudit.ts
```

### Frontend Scripts
```bash
# Development with live reload
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Commit: `git commit -m "Add feature: your-feature"`
4. Push: `git push origin feature/your-feature`
5. Create a Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

Made with ❤️ by the PlugFindr Development Team

---

## 📞 Support

For issues or questions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Contact team members

---

## 🔗 Quick Links

- [Firebase Console](https://console.firebase.google.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Last Updated**: March 28, 2026

For the latest updates, please refer to the repository commits and pull requests.
