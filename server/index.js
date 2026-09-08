import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

import config from './config.js';
import { connectDB } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/helpers.js';
import { verifyEmailConnection } from './utils/email.js';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import resourceRoutes from './routes/resources.js';
import blogRoutes from './routes/blog.js';
import announcementRoutes from './routes/announcements.js';
import testimonialRoutes from './routes/testimonials.js';
import applicationRoutes from './routes/applications.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/uploads.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS — allow frontend origin + credentials
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [config.frontendUrl, process.env.FRONTEND_URL].filter(Boolean);
    if (!origin || allowed.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

// Stripe webhook needs raw body (must be before json parser)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => next());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.url.startsWith('/api')) {
        console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
      }
    });
    next();
  });
}

// Static file uploads with CORS
const uploadDir = join(__dirname, 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', cors(), express.static(uploadDir));

// Serve built frontend (TanStack Start output)
const frontendBuildPath = join(__dirname, '..', '.output', 'public');
const distPath = join(__dirname, '..', 'dist');
const staticPath = existsSync(frontendBuildPath) ? frontendBuildPath : distPath;

if (existsSync(staticPath)) {
  app.use(express.static(staticPath));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json(successResponse({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));
});

// 404 for unknown API routes
app.use('/api/{*splat}', (req, res) => {
  res.status(404).json(successResponse(null, 'Endpoint not found', 404));
});

// Serve frontend for all non-API routes (SPA fallback)
const indexPath = join(staticPath, 'index.html');
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: 'Frontend not built. Run npm run build.' });
    }
  } else {
    next();
  }
});

// Global error handler (must be last)
app.use(errorHandler);

async function start() {
  await connectDB();
  await verifyEmailConnection();
  app.listen(config.port, () => {
    console.log(`\n  The Ali's Collegiate API`);
    console.log(`  ────────────────────────`);
    console.log(`  Server:  http://localhost:${config.port}`);
    console.log(`  Health:  http://localhost:${config.port}/api/health`);
    console.log(`  Env:     ${config.nodeEnv}\n`);
  });
}

start().catch(console.error);
