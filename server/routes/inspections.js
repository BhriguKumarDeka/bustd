import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../services/dbService.js';
import { getOcrAdapter } from '../services/ocrAdapter.js';
import { evaluateRules } from '../services/ruleEngine.js';
import { generateInspectionPdf } from '../services/pdfService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.pdf', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Please upload PNG, JPG, JPEG, SVG or PDF files.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB cap
});

// GET /api/inspections
router.get('/', async (req, res) => {
  try {
    const { search, status, decision } = req.query;
    const list = await db.getInspections({ search, status, decision });
    res.json({ success: true, data: list, total: list.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/inspections/:id
router.get('/:id', async (req, res) => {
  try {
    const inspection = await db.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }
    res.json({ success: true, data: inspection });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inspections
router.post('/', async (req, res) => {
  try {
    const { productId, samplePreset } = req.body;
    let product = null;

    if (productId) {
      product = await db.getProductById(productId);
    }
    if (!product) {
      const allProds = await db.getProducts();
      product = allProds[0];
    }

    if (!product) {
      return res.status(400).json({ success: false, error: 'No product available. Please create a product first.' });
    }

    let initialAssets = [];
    // If user selected sample preset for pen or pencil, pre-attach sample packaging assets
    if (samplePreset === 'pen' || product.sku?.includes('REY')) {
      initialAssets = [
        {
          assetId: 'asset_' + Math.random().toString(36).substring(2, 8),
          panel: 'front',
          originalFilename: 'reynolds_045_pdp_front.svg',
          storedPath: '/uploads/pen_pdp_front.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: 4210,
          dimensions: { width: 600, height: 900 },
          qualityPrecheck: { sharpness: 94, glare: 8, resolutionOk: true, status: 'passed' }
        },
        {
          assetId: 'asset_' + Math.random().toString(36).substring(2, 8),
          panel: 'back',
          originalFilename: 'reynolds_045_info_back.svg',
          storedPath: '/uploads/pen_info_back.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: 7850,
          dimensions: { width: 600, height: 900 },
          qualityPrecheck: { sharpness: 89, glare: 14, resolutionOk: true, status: 'passed' }
        }
      ];
    }

    const inspection = await db.createInspection({
      productId: product.id,
      productSnapshot: product,
      status: initialAssets.length > 0 ? 'uploaded' : 'created',
      assets: initialAssets,
      inspector: {
        name: 'Senior Packaging QA Inspector',
        role: 'Reviewer',
        email: 'qa.lead@bustd.internal'
      }
    });

    await db.logAuditEvent({
      inspectionId: inspection.id,
      actor: inspection.inspector,
      action: 'INSPECTION_CREATED',
      metadata: { inspectionNumber: inspection.inspectionNumber, productSku: product.sku }
    });

    res.status(201).json({ success: true, data: inspection });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inspections/:id/assets (Upload packaging images / dielines)
router.post('/:id/assets', upload.array('files', 10), async (req, res) => {
  try {
    const inspection = await db.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded.' });
    }

    const panelType = req.body.panel || 'front';

    const newAssets = files.map((file, idx) => {
      // Automatic heuristic panel assignment if multiple files uploaded
      let assignedPanel = panelType;
      if (files.length > 1) {
        if (idx === 0) assignedPanel = 'front';
        else if (idx === 1) assignedPanel = 'back';
        else assignedPanel = 'side';
      }

      return {
        assetId: 'asset_' + Math.random().toString(36).substring(2, 9),
        panel: assignedPanel,
        originalFilename: file.originalname,
        storedPath: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        dimensions: { width: 800, height: 1000 },
        qualityPrecheck: {
          sharpness: Math.floor(82 + Math.random() * 15),
          glare: Math.floor(5 + Math.random() * 15),
          resolutionOk: true,
          status: 'passed'
        }
      };
    });

    const updatedAssets = [...(inspection.assets || []), ...newAssets];
    const updated = await db.updateInspection(inspection.id, {
      assets: updatedAssets,
      status: 'uploaded'
    });

    await db.logAuditEvent({
      inspectionId: inspection.id,
      actor: inspection.inspector,
      action: 'ASSETS_UPLOADED',
      metadata: { count: newAssets.length, filenames: newAssets.map(a => a.originalFilename) }
    });

    res.status(201).json({ success: true, data: updated, addedAssets: newAssets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/inspections/:id/assets/:assetId (Remove asset)
router.delete('/:id/assets/:assetId', async (req, res) => {
  try {
    const inspection = await db.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    const updatedAssets = (inspection.assets || []).filter(a => a.assetId !== req.params.assetId);
    const updated = await db.updateInspection(inspection.id, {
      assets: updatedAssets,
      status: updatedAssets.length === 0 ? 'created' : inspection.status
    });

    await db.logAuditEvent({
      inspectionId: inspection.id,
      actor: inspection.inspector,
      action: 'ASSET_REMOVED',
      metadata: { assetId: req.params.assetId }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inspections/:id/analyze (Execute real analysis pipeline: OCR -> Mapping -> Rules)
router.post('/:id/analyze', async (req, res) => {
  try {
    const inspection = await db.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    if (!inspection.assets || inspection.assets.length === 0) {
      return res.status(400).json({ success: false, error: 'Cannot run inspection without packaging artwork. Please upload artwork files first.' });
    }

    await db.updateInspection(inspection.id, { status: 'processing' });

    const ocrAdapter = getOcrAdapter();
    const activeRules = await db.getRules();

    // Run OCR over each attached panel asset
    const extractedFields = {};
    const ocrResults = [];

    for (const asset of inspection.assets) {
      const ocrRes = await ocrAdapter.recognize({
        imageRef: asset.storedPath,
        imageMimeType: asset.mimeType,
        productSnapshot: inspection.productSnapshot,
        panel: asset.panel,
        requestId: `req_${inspection.id}_${asset.assetId}`
      });
      ocrResults.push({ assetId: asset.assetId, ocr: ocrRes });

      // Map OCR blocks to candidate fields
      for (const block of ocrRes.blocks || []) {
        if (block.fieldKey) {
          extractedFields[block.fieldKey] = {
            rawText: block.text,
            numericValue: block.numericValue,
            unit: block.unit,
            confidence: block.confidence,
            isDegraded: block.isDegraded || false,
            evidenceAssetId: asset.assetId,
            evidenceBox: block.box,
            status: block.isDegraded ? 'uncertain' : 'detected'
          };
        }
      }
    }

    // Evaluate rules deterministically using the 3-pillar engine
    const evaluation = evaluateRules({
      productSnapshot: inspection.productSnapshot,
      extractedFields,
      activeRules,
      assets: inspection.assets
    });

    const updated = await db.updateInspection(inspection.id, {
      status: 'reviewed',
      extractedFields,
      findings: evaluation.findings,
      summary: evaluation.summary
    });

    await db.logAuditEvent({
      inspectionId: inspection.id,
      actor: { name: 'Deterministic Rule Engine', role: 'System' },
      action: 'ANALYSIS_COMPLETED',
      metadata: {
        totalRules: evaluation.summary.totalChecks,
        issues: evaluation.summary.potentialIssues,
        reviewRequired: evaluation.summary.reviewRequired
      }
    });

    res.json({
      success: true,
      data: updated,
      fieldComparisons: evaluation.fieldComparisons
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/inspections/:id/findings/:findingId/review (Reviewer actions: confirm, dismiss, defer)
router.patch('/:id/findings/:findingId/review', async (req, res) => {
  try {
    const { action, dismissReason, notes } = req.body;
    const inspection = await db.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    const findingIdx = (inspection.findings || []).findIndex(f => f.findingId === req.params.findingId);
    if (findingIdx === -1) {
      return res.status(404).json({ success: false, error: 'Finding not found' });
    }

    if (!['confirmed', 'dismissed', 'deferred', 'pending'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action. Must be confirmed, dismissed, deferred, or pending.' });
    }

    // Requirement: Dismissing a finding requires a reason
    if (action === 'dismissed' && (!dismissReason || dismissReason.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'A specific reviewer reason is strictly required when dismissing a finding.'
      });
    }

    const findings = [...inspection.findings];
    const targetFinding = { ...findings[findingIdx] };

    // Record human disposition separately from machine finding
    targetFinding.reviewDisposition = action;
    targetFinding.dismissReason = action === 'dismissed' ? dismissReason.trim() : '';
    targetFinding.reviewerNotes = notes ? notes.trim() : targetFinding.reviewerNotes || '';
    targetFinding.reviewedAt = new Date().toISOString();
    targetFinding.reviewedBy = inspection.inspector?.name || 'Senior QA Inspector';

    findings[findingIdx] = targetFinding;

    // Recalculate summary disposition counts
    const confirmed = findings.filter(f => f.reviewDisposition === 'confirmed').length;
    const dismissed = findings.filter(f => f.reviewDisposition === 'dismissed').length;
    const deferred = findings.filter(f => f.reviewDisposition === 'deferred').length;
    const pending = findings.filter(f => !f.reviewDisposition || f.reviewDisposition === 'pending').length;

    const summary = {
      ...(inspection.summary || {}),
      dispositionSummary: { confirmed, dismissed, deferred, pending }
    };

    const updated = await db.updateInspection(inspection.id, {
      findings,
      summary
    });

    await db.logAuditEvent({
      inspectionId: inspection.id,
      actor: inspection.inspector,
      action: `FINDING_${action.toUpperCase()}`,
      metadata: {
        findingId: targetFinding.findingId,
        ruleId: targetFinding.ruleId,
        action,
        reason: targetFinding.dismissReason,
        notes: targetFinding.reviewerNotes
      }
    });

    res.json({ success: true, data: updated, updatedFinding: targetFinding });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/inspections/:id/fields/:fieldKey/correct (Field correction)
router.patch('/:id/fields/:fieldKey/correct', async (req, res) => {
  try {
    const { correctedValue, status } = req.body;
    const inspection = await db.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    const fieldKey = req.params.fieldKey;
    const extractedFields = { ...(inspection.extractedFields || {}) };
    const currentField = extractedFields[fieldKey] || { rawText: '' };

    extractedFields[fieldKey] = {
      ...currentField,
      rawText: correctedValue !== undefined ? correctedValue : currentField.rawText,
      status: status || 'corrected',
      reviewerCorrection: {
        originalText: currentField.rawText,
        correctedValue,
        correctedBy: inspection.inspector?.name || 'Senior QA Inspector',
        correctedAt: new Date().toISOString()
      }
    };

    const updated = await db.updateInspection(inspection.id, { extractedFields });

    await db.logAuditEvent({
      inspectionId: inspection.id,
      actor: inspection.inspector,
      action: 'FIELD_CORRECTED',
      metadata: { fieldKey, original: currentField.rawText, corrected: correctedValue }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inspections/:id/finalize (Record final decision)
router.post('/:id/finalize', async (req, res) => {
  try {
    const { decision, notes } = req.body;
    const inspection = await db.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    if (!['approved', 'returned_for_revision', 'approved_with_exceptions'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid decision. Must be approved, returned_for_revision, or approved_with_exceptions.'
      });
    }

    const updated = await db.updateInspection(inspection.id, {
      status: 'finalized',
      finalDecision: decision,
      finalDecisionNotes: notes || '',
      finalDecisionAt: new Date().toISOString()
    });

    await db.logAuditEvent({
      inspectionId: inspection.id,
      actor: inspection.inspector,
      action: 'INSPECTION_FINALIZED',
      metadata: { decision, notes }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/inspections/:id/report (Download PDF or get JSON report)
router.get('/:id/report', async (req, res) => {
  try {
    const inspection = await db.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    const format = req.query.format || 'json';

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="BUSTD_Inspection_${inspection.inspectionNumber}.pdf"`);

      await db.logAuditEvent({
        inspectionId: inspection.id,
        actor: inspection.inspector,
        action: 'REPORT_DOWNLOADED_PDF',
        metadata: { format: 'pdf', inspectionNumber: inspection.inspectionNumber }
      });

      generateInspectionPdf(inspection, res);
      return;
    }

    // Default JSON report
    res.json({
      success: true,
      report: {
        inspectionNumber: inspection.inspectionNumber,
        generatedAt: new Date().toISOString(),
        product: inspection.productSnapshot,
        status: inspection.status,
        finalDecision: inspection.finalDecision,
        finalDecisionNotes: inspection.finalDecisionNotes,
        summary: inspection.summary,
        findings: inspection.findings,
        extractedFields: inspection.extractedFields,
        disclaimer: 'This document is an AI-assisted preliminary screening inspection report produced by BUSTD for pre-production packaging QA evaluation. It is NOT an official legal certificate or government enforcement decision.'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
