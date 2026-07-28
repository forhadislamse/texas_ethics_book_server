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

**2. Create a `.env` file** in the root of the project directory to store environment variables. 

*Please refer to the `.env.example` file in the root directory for all required environment variables and their formats.*

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

*(Note: Please refer to the Postman documentation link provided above for all API endpoints, request parameters, and response formats.)*

## Licenses

This project is proprietary and intended for the Texas Ethics Law Book platform.

## Happy Coding! 