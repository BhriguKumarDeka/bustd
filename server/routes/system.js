import express from 'express';
import { getSystemStorageStatus } from '../services/dbService.js';
import { getOcrAdapter } from '../services/ocrAdapter.js';

const router = express.Router();

router.get('/status', (req, res) => {
  const dbStatus = getSystemStorageStatus();
  const ocr = getOcrAdapter();

  res.json({
    success: true,
    data: {
      appName: 'BUSTD',
      tagline: 'Spot the red flags.',
      version: '0.3.0',
      environment: process.env.NODE_ENV || 'development',
      storage: {
        mode: dbStatus.storageMode, // 'mongodb' or 'local_file_store'
        isMongoConnected: dbStatus.isMongoConnected,
        description: dbStatus.isMongoConnected
          ? 'MongoDB Active (Mongoose connection established)'
          : 'Local File Store Fallback Active (Zero configuration, persisting to server/data/store.json)'
      },
      ocr: {
        provider: ocr.name,
        version: ocr.version,
        isHosted: !!process.env.GOOGLE_VISION_API_KEY,
        description: process.env.GOOGLE_VISION_API_KEY
          ? 'Hosted Google Cloud Vision OCR'
          : 'Deterministic Multi-Panel Spatial OCR Adapter (Pre-configured capstone demo fixture)'
      },
      demoUser: {
        name: 'Senior Packaging QA Inspector',
        role: 'Lead Metrology Reviewer',
        organization: 'Enterprise Pre-Press Quality Assurance'
      }
    }
  });
});

export default router;
