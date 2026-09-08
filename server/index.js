import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';

import config from './config.js';
import { connectDB } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/helpers.js';

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

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => next());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

const uploadDir = join(__dirname, 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', cors(), express.static(uploadDir));

const staticPath = join(__dirname, '..', '.output', 'public');

if (existsSync(staticPath)) {
  const indexPath = join(staticPath, 'index.html');
  if (!existsSync(indexPath)) {
    try {
      const assets = readdirSync(join(staticPath, 'assets'));
      const mainJs = assets.find(f => f.startsWith('index-') && f.endsWith('.js'));
      const mainCss = assets.find(f => f.startsWith('styles-') && f.endsWith('.css'));
      if (mainJs) {
        writeFileSync(indexPath, `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>The Ali's Collegiate</title><meta name="description" content="A Complete Ecosystem for Students & Teachers"/><link rel="icon" type="image/svg+xml" href="/favicon.svg"/>${mainCss ? '<link rel="stylesheet" href="/assets/' + mainCss + '"/>' : ''}</head><body><div id="root"></div><script type="module" src="/assets/${mainJs}"></script></body></html>`);
        console.log('Generated index.html');
      }
    } catch (e) {
      console.error('Failed to generate index.html:', e.message);
    }
  }
  app.use(express.static(staticPath));
}

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

app.get('/api/health', (req, res) => {
  res.json(successResponse({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }));
});

app.use('/api/{*splat}', (req, res) => {
  res.status(404).json(successResponse(null, 'Endpoint not found', 404));
});

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    const indexPath = join(staticPath, 'index.html');
    if (existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`The Ali's Collegiate running on port ${config.port}`);
  });
}

start().catch(console.error);
