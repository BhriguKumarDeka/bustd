import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// GET /api/rules
router.get('/', async (req, res) => {
  try {
    const rules = await db.getRules();
    res.json({ success: true, data: rules, total: rules.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/rules/:id
router.get('/:id', async (req, res) => {
  try {
    const rule = await db.getRuleById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/rules/:id
router.patch('/:id', async (req, res) => {
  try {
    const { status, severity, description } = req.body;
    const rule = await db.getRuleById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    const updates = {};
    if (status !== undefined) {
      if (!['enabled', 'disabled', 'draft'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status. Must be enabled, disabled, or draft.' });
      }
      updates.status = status;
    }
    if (severity !== undefined) updates.severity = severity;
    if (description !== undefined) updates.description = description;

    const updated = await db.updateRule(req.params.id, updates);

    await db.logAuditEvent({
      inspectionId: null,
      actor: { name: 'Regulatory Rule Admin', role: 'Rule Administrator' },
      action: 'RULE_STATUS_CHANGED',
      metadata: { ruleId: rule.ruleId, oldStatus: rule.status, newStatus: updates.status || rule.status }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
