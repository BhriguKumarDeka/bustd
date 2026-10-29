import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// GET /api/audit-events
router.get('/', async (req, res) => {
  try {
    const { inspectionId } = req.query;
    const events = await db.getAuditEvents(inspectionId);
    res.json({ success: true, data: events, total: events.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
