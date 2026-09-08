# The Ali's Collegiate — Setup Guide

## Complete Platform Setup

This guide covers setting up the full-stack platform with MongoDB Atlas, Node.js backend, and the React frontend.

---

## Prerequisites

- **Node.js** v18 or later (v20+ recommended)
- **npm** (comes with Node.js)
- A **MongoDB Atlas** account (free tier works)
- A **Stripe** account (for payments — can skip for now)

---

## Step 1: Clone & Install Dependencies

```bash
cd thealiscollegiate-main
npm install
```

---

## Step 2: Set Up MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new cluster (choose the free M0 tier)
3. Under **Database Access**, create a database user:
   - Username: `admin`
   - Password: (choose a strong password)
4. Under **Network Access**, add your IP address (or add `0.0.0.0/0` for development)
5. Go to **Database** → **Connect** → **Connect your application**
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/thealiscollegiate?retryWrites=true&w=majority
   ```

---

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB Atlas Connection (paste your connection string from Step 2)
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/thealiscollegiate?retryWrites=true&w=majority

# JWT Secret (change this to any random string)
JWT_SECRET=your-super-secret-random-string-here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Stripe (optional — get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Email (optional — for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@thealiscollegiate.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Step 4: Seed the Database

This creates the admin user and sample data:

```bash
npm run seed
```

You should see:
```
Admin user created: admin@thealiscollegiate.com / admin123
Courses seeded
Resources seeded
Announcements seeded
Blog posts seeded
Testimonials seeded
Site settings seeded
Seed complete!
```

---

## Step 5: Start the Application

```bash
npm run dev
```

This starts both:
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend API**: http://localhost:3001 (Express server)

The Vite dev server automatically proxies `/api` requests to the backend.

---

## Step 6: Explore the Platform

### Public Website
- **Homepage**: http://localhost:3000
- **About**: http://localhost:3000/about
- **Courses**: http://localhost:3000/courses
- **Resources**: http://localhost:3000/resources
- **Admissions**: http://localhost:3000/admissions
- **Blog**: http://localhost:3000/blog
- **Contact**: http://localhost:3000/contact
- **FAQ**: http://localhost:3000/faq

### Student Portal
- **Portal**: http://localhost:3000/portal
- **Login**: http://localhost:3000/portal/login
- **Register**: http://localhost:3000/portal/register
- **Dashboard**: http://localhost:3000/portal/dashboard
- **My Courses**: http://localhost:3000/portal/courses
- **Assignments**: http://localhost:3000/portal/assignments
- **Quizzes**: http://localhost:3000/portal/quizzes
- **Results**: http://localhost:3000/portal/results
- **Resources**: http://localhost:3000/portal/resources
- **Profile**: http://localhost:3000/portal/profile

### Admin Panel
- **Admin Dashboard**: http://localhost:3000/admin
- **Students**: http://localhost:3000/admin/students
- **Courses**: http://localhost:3000/admin/courses
- **Assignments**: http://localhost:3000/admin/assignments
- **Quizzes**: http://localhost:3000/admin/quizzes
- **Applications**: http://localhost:3000/admin/applications
- **Payments**: http://localhost:3000/admin/payments
- **Resources**: http://localhost:3000/admin/resources
- **Announcements**: http://localhost:3000/admin/announcements
- **Messages**: http://localhost:3000/admin/contacts
- **Settings**: http://localhost:3000/admin/settings

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@thealiscollegiate.com | admin123 |

**Change these after first login!**

---

## Project Structure

```
thealiscollegiate-main/
├── server/                    # Backend (Node.js/Express)
│   ├── config.js              # Environment configuration
│   ├── db.js                  # MongoDB connection
│   ├── index.js               # Express server entry
│   ├── seed.js                # Database seeder
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Course.js
│   │   ├── Resource.js
│   │   ├── Announcement.js
│   │   ├── BlogPost.js
│   │   ├── Enrollment.js
│   │   ├── Assignment.js
│   │   ├── Quiz.js
│   │   ├── Application.js
│   │   ├── Payment.js
│   │   ├── Contact.js
│   │   ├── Testimonial.js
│   │   └── SiteSettings.js
│   ├── routes/                # API routes
│   │   ├── auth.js            # Login, register, password reset
│   │   ├── courses.js         # Course CRUD
│   │   ├── resources.js       # Resource CRUD
│   │   ├── blog.js            # Blog CRUD
│   │   ├── announcements.js   # Announcement CRUD
│   │   ├── testimonials.js    # Testimonial CRUD
│   │   ├── applications.js    # Admission applications
│   │   ├── student.js         # Student portal API
│   │   ├── admin.js           # Admin panel API
│   │   ├── payments.js        # Stripe integration
│   │   ├── contact.js         # Contact form
│   │   └── uploads.js         # File uploads
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── upload.js          # File upload handling
│   │   └── errorHandler.js    # Error handling
│   ├── utils/
│   │   └── email.js           # Email notifications
│   └── uploads/               # Uploaded files
├── src/                       # Frontend (React/TanStack)
│   ├── lib/
│   │   ├── api-client.ts      # API client for backend
│   │   ├── auth-context.tsx    # Authentication provider
│   │   └── api.ts             # Data fetching with fallback
│   ├── routes/                # Pages
│   │   ├── admin.*.tsx        # Admin panel pages
│   │   ├── portal.*.tsx       # Student portal pages
│   │   └── ...                # Public pages
│   └── components/
│       ├── admin/             # Admin components
│       │   └── AdminShell.tsx
│       └── portal/            # Portal components
│           └── PortalShell.tsx
├── .env                       # Environment variables
├── package.json
└── vite.config.ts
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new student
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password

### Courses
- `GET /api/courses` — List all courses
- `GET /api/courses/:slug` — Get course by slug
- `POST /api/courses` — Create course (admin)
- `PUT /api/courses/:id` — Update course (admin)
- `DELETE /api/courses/:id` — Delete course (admin)

### Resources
- `GET /api/resources` — List resources
- `POST /api/resources` — Create resource (admin)
- `PUT /api/resources/:id` — Update resource (admin)
- `DELETE /api/resources/:id` — Delete resource (admin)

### Blog
- `GET /api/blog` — List posts
- `GET /api/blog/:slug` — Get post
- `POST /api/blog` — Create post (admin)

### Announcements
- `GET /api/announcements` — List announcements
- `POST /api/announcements` — Create (admin)

### Admissions
- `POST /api/applications` — Submit application
- `GET /api/applications/status/:number` — Check status
- `GET /api/applications` — List all (admin)
- `PUT /api/applications/:id/status` — Update status (admin)

### Student Portal
- `GET /api/student/profile` — Get profile
- `PUT /api/student/profile` — Update profile
- `GET /api/student/courses` — Enrolled courses
- `GET /api/student/assignments` — Assignments
- `POST /api/student/assignments/:id/submit` — Submit assignment
- `GET /api/student/quizzes` — Quizzes
- `GET /api/student/results` — Results

### Admin
- `GET /api/admin/dashboard` — Dashboard stats
- `GET /api/admin/users` — List users
- `GET /api/admin/students` — List students
- `GET /api/admin/assignments` — List assignments
- `GET /api/admin/submissions` — List submissions
- `GET /api/admin/payments` — List payments
- `GET /api/admin/contacts` — List contacts

### Payments
- `POST /api/payments/create-session` — Create Stripe session
- `POST /api/payments/webhook` — Stripe webhook
- `GET /api/payments/verify/:reference` — Verify payment

### Contact
- `POST /api/contact` — Submit contact form

### Uploads
- `POST /api/uploads` — Upload single file
- `POST /api/uploads/multiple` — Upload multiple files

---

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update `MONGODB_URI` to your production MongoDB Atlas cluster
3. Set a strong `JWT_SECRET`
4. Configure Stripe production keys
5. Set up SMTP credentials for email
6. Build the frontend: `npm run build`
7. Start the server: `node server/index.js`

---

## Troubleshooting

### "MongoDB connection error"
- Check your `MONGODB_URI` in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify the database user credentials

### "Port already in use"
- Change `PORT` in `.env` or stop the process using the port

### "Cannot find module" errors
- Run `npm install` again
- Delete `node_modules` and reinstall

### Frontend not connecting to API
- Ensure the backend is running on port 3001
- Check Vite proxy configuration in `vite.config.ts`
