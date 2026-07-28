# Texas Ethics Law Book (Backend)

<p align="center">
  <img src="./assets/logo.png" alt="Texas Ethics Book App" width="150" height="150"/>
</p>

A comprehensive backend system for the **Texas Ethics Law Book** digital practice guide. It serves as the core API for a modern e-learning and reading platform where users can study over 550 pages of annotated ethics rules, statutes, and case law. The system includes robust authentication, role-based access control, subscription management via Stripe, dynamic guide content serving (chapters and sections), newsletter integrations, and an admin dashboard.

Technologies Used: **Node.js, Express.js, TypeScript, Prisma, MongoDB, JWT Auth, Stripe Payment Gateway, Cloudinary/DigitalOcean Spaces, Resend/Mailchimp, VPS Hosting (Vercel/DigitalOcean)**.

**Local:**  
http://localhost:23078/api/v1

**Live:**  
https://texas-ethics-book-server.vercel.app/api/v1

**Postman Documentation**
https://documenter.getpostman.com/view/34968572/2sBY4SLyYk

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Technology Used](#technology-used)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Licenses](#licenses)


## Requirements

Before starting the project, ensure that the following dependencies are installed on your system:

- **Node.js** (v18+)
- **MongoDB** (Running locally or a cloud-based instance such as MongoDB Atlas)
- **NPM or Yarn** for package management
- **Environment variables setup**


## Installation
**1. Clone the repository:**

```bash
   git clone https://github.com/forhadislamse/texas_ethics_book_server.git
   cd texas_ethics_book_server

   # Using npm:
   npm install
```

**2. Create a `.env` file** in the root of the project directory to store environment variables. Example `.env` file:

```env
# Database
DATABASE_URL="mongodb+srv://<user>:<password>@cluster0...mongodb.net/<dbname>?appName=Cluster0"
NODE_ENV="development"
PORT=23078

BCRYPT_SALT_ROUNDS=12
JWT_SECRET="<your_jwt_secret>" 
EXPIRES_IN="365d"

REFRESH_TOKEN_SECRET="<your_refresh_secret>"
REFRESH_TOKEN_EXPIRES_IN="365d"

RESET_PASS_TOKEN="<reset_token_secret>"
RESET_PASS_TOKEN_EXPIRES_IN="5m"
RESET_PASS_LINK="http://localhost:3000/reset-password"

# SMTP & Email Services
EMAIL="your@email.com"
APP_PASS="your_app_password"

# Cloud Storage
CLOUDINARY_CLOUD_NAME="<cloud_name>"
CLOUDINARY_API_KEY="<api_key>"
CLOUDINARY_API_SECRET="<api_secret>"
CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"

# Client & Stripe Integration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_ADMIN_ACCOUNT_ID="acct_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

FRONTEND_BASE_URL="http://localhost:3000"
CLIENT_URL="http://localhost:3000"

# Newsletter Integrations
RESEND_API_KEY="re_..."
MAILCHIMP_API_KEY="..."
MAILCHIMP_SERVER_PREFIX="us10"
MAILCHIMP_AUDIENCE_ID="..."
```

## Running the Application

We can run the application using the following npm scripts:

### **1. Start the application in development mode:**
For development, we use the `dev` script, which runs the application using `ts-node-dev`, so it will automatically reload on file changes:
```bash
npm run dev
```

### **2. Start the application:**
After building the application, we can start it with the following command:
```bash
npm run start
```

### **3. Build the application:**
This command compiles the TypeScript files into JavaScript files:
```bash
npm run build
```

## Features

### User Features
- **Read & Study:** Access full chapters and sections of the Texas Ethics Laws.
- **Subscriptions:** Securely purchase monthly or yearly access plans.
- **Bookmarks & Progress:** Save important sections and track your reading progress.
- **Profile Management:** Manage personal details and profile images.
- **Newsletter:** Subscribe to legal ethics updates and newsletters.

### Admin Features
- **Content Management:** Create, edit, and manage chapters and sections of the guide.
- **Subscription Management:** View and manage user subscriptions and Stripe transactions.
- **User Dashboard:** Monitor total users, active readers, and revenue statistics.

### Common / System Features
- **Secure Authentication:** JWT-based login, password hashing, and OTP password resets.
- **Payment Integration:** Fully integrated Stripe checkout and secure webhooks.
- **Media Uploads:** Cloudinary and DigitalOcean Spaces support for optimized asset delivery.
- **Role-based Access Control:** Strict authorization differentiating normal users and administrators.

## Technology Used

- **[Express](https://expressjs.com/)** – Fast, unopinionated, minimalist web framework for Node.js.
- **[TypeScript](https://www.typescriptlang.org/)** – Strongly typed programming language built on JavaScript.
- **[MongoDB](https://www.mongodb.com/)** – Flexible, scalable NoSQL database.
- **[Prisma](https://www.prisma.io/)** – Next-generation ORM used to map MongoDB schemas in TypeScript.
- **[Zod](https://github.com/colinhacks/zod)** – TypeScript-first schema declaration and validation library.
- **[Stripe](https://stripe.com/)** – Payment gateway for processing recurring and one-time subscriptions.
- **[Cloudinary](https://cloudinary.com/)** – Cloud-based image management.
- **[Mailchimp / Resend](https://resend.com/)** – Used for marketing emails and newsletters.

## Folder Structure

```
├── prisma
│   └── schema.prisma
│
└── src
    ├── app.ts
    ├── server.ts
    │
    ├── app
    │   ├── middlewares
    │   │   ├── auth.ts
    │   │   ├── globalErrorHandler.ts
    │   │   └── validateRequest.ts
    │   │
    │   ├── modules
    │   │   ├── admin           # Admin stats and dashboard management
    │   │   ├── Auth            # Authentication (Login, Register, OTP)
    │   │   ├── fileUpload      # Cloudinary / DO image uploads
    │   │   ├── Guide           # Book content (Chapters, Sections)
    │   │   ├── Newsletter      # Resend and Mailchimp integration
    │   │   ├── Notification    # User notifications
    │   │   ├── Payment         # Stripe webhook and transactions
    │   │   ├── Plan            # Subscription plans
    │   │   └── User            # User profile and settings
    │   │
    │   └── routes
    │       └── index.ts
    │
    ├── config
    │   └── index.ts
    │
    ├── errors
    │   ├── ApiError.ts
    │   └── handleZodError.ts
    │
    ├── helpers
    │   ├── fileUploader.ts
    │   ├── jwtHelpers.ts
    │   └── paginationHelper.ts
    │
    └── shared
        ├── catchAsync.ts
        ├── emailSender.ts
        ├── sendResponse.ts
        └── stripe.ts
```

## API Endpoints

### AUTH Endpoints
| Name | Method | URL | Description |
|------|--------|-----|-------------|
| Register User | POST | `/auth/register` | Register a new user account. |
| Login User | POST | `/auth/login` | Authenticate user and return JWT tokens. |
| Forgot Password | POST | `/auth/forgot-password` | Send OTP to user's email to reset password. |
| Verify OTP | POST | `/auth/verify-otp` | Verify OTP sent to email. |
| Reset Password | POST | `/auth/reset-password` | Reset password using the verified token. |

### USER Endpoints
| Name | Method | URL | Description |
|------|--------|-----|-------------|
| Get My Profile | GET | `/users/profile` | Fetch logged-in user profile. |
| Update Profile | PATCH | `/users/update-profile` | Update profile details. |
| Get All Users | GET | `/admin/users` | Admin only: Fetch all registered users. |

### Guide (Book) Endpoints
| Name | Method | URL | Description |
|------|--------|-----|-------------|
| Get All Chapters | GET | `/guide/chapters` | Fetch all chapters of the ethics book. |
| Get Single Chapter| GET | `/guide/chapters/:id` | Fetch details of a specific chapter. |
| Create Chapter | POST| `/admin/guide/chapters`| Admin only: Create a new chapter. |
| Get Sections | GET | `/guide/sections` | Fetch sections inside chapters. |

### Payment & Plans Endpoints
| Name | Method | URL | Description |
|------|--------|-----|-------------|
| Get All Plans | GET | `/plans` | Retrieve all available subscription plans. |
| Create Checkout | POST| `/payment/checkout` | Generate Stripe checkout session for a plan. |
| Webhook | POST| `/payment/webhook` | Listen to Stripe events (e.g. `checkout.session.completed`). |

*(Note: API paths above are illustrative based on the module structure. Refer to Postman documentation for exact parameters and query options.)*

## Licenses

This project is proprietary and intended for the Texas Ethics Law Book platform.

## Happy Coding 🚀