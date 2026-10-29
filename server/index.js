import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase, db } from './services/dbService.js';
import { getInitialSeedData, writeSampleAssets } from './data/seedData.js';

import productsRouter from './routes/products.js';
import inspectionsRouter from './routes/inspections.js';
import rulesRouter from './routes/rules.js';
import auditRouter from './routes/audit.js';
import systemRouter from './routes/system.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve uploaded artwork assets
app.use('/uploads', express.static(UPLOADS_DIR));

// Mount API routes
app.use('/api/products', productsRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/audit-events', auditRouter);
app.use('/api/system', systemRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve frontend production build if available
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

async function startServer() {
  // Generate sample asset files
  writeSampleAssets();

  // Initialize DB (MongoDB or Local Store fallback)
  await initDatabase(process.env.MONGODB_URI);

  // Check if we need to seed the data
  const rawStore = db.getRawStore();
  if (!rawStore.products || rawStore.products.length === 0) {
    console.log('ℹ [DB] Empty database detected. Seeding realistic sample products, rules, and demo inspection...');
    const seed = getInitialSeedData();
    db.setInitialSeed(seed);
    console.log(`✓ [DB] Seeded ${seed.products.length} products, ${seed.rules.length} compliance rules, and 1 demo inspection.`);
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  BUSTD Backend Server running on http://localhost:${PORT}`);
    console.log(`  Tagline: "Spot the red flags."`);
    console.log(`  API Status: http://localhost:${PORT}/api/system/status`);
    console.log(`=======================================================`);
  });
}

startServer();
