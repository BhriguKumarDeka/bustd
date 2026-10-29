import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema({
  findingId: { type: String, required: true },
  ruleId: { type: String, required: true },
  ruleVersion: { type: String, default: '1.0.0' },
  pillar: { type: String, required: true },
  title: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['potential_issue', 'no_issue', 'review_required'] 
  },
  severity: { 
    type: String, 
    required: true, 
    enum: ['critical', 'warning', 'info'] 
  },
  expectedValue: { type: String, default: '' },
  detectedValue: { type: String, default: '' },
  explanation: { type: String, required: true },
  evidenceAssetId: { type: String, default: '' },
  evidenceBox: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    h: { type: Number, default: 0 }
  },
  ocrConfidence: { type: Number, default: 0 },
  reviewDisposition: { 
    type: String, 
    enum: ['pending', 'confirmed', 'dismissed', 'deferred'],
    default: 'pending' 
  },
  dismissReason: { type: String, default: '' },
  reviewerNotes: { type: String, default: '' },
  reviewedAt: { type: String, default: '' },
  reviewedBy: { type: String, default: '' }
}, { _id: false });

const assetSchema = new mongoose.Schema({
  assetId: { type: String, required: true },
  panel: { type: String, default: 'front' },
  originalFilename: { type: String, required: true },
  storedPath: { type: String, required: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, default: 0 },
  dimensions: {
    width: { type: Number, default: 800 },
    height: { type: Number, default: 600 }
  },
  qualityPrecheck: {
    sharpness: { type: Number, default: 85 },
    glare: { type: Number, default: 12 },
    resolutionOk: { type: Boolean, default: true },
    status: { type: String, default: 'passed' }
  }
}, { _id: false });

const inspectionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  inspectionNumber: { type: String, required: true, unique: true, index: true },
  productId: { type: String, required: true, index: true },
  productSnapshot: { type: Object, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['created', 'uploaded', 'processing', 'reviewed', 'finalized'],
    default: 'created' 
  },
  finalDecision: { 
    type: String, 
    enum: ['pending', 'approved', 'returned_for_revision', 'approved_with_exceptions'],
    default: 'pending' 
  },
  finalDecisionNotes: { type: String, default: '' },
  finalDecisionAt: { type: String, default: '' },
  inspector: {
    name: { type: String, default: 'Senior QA Inspector' },
    role: { type: String, default: 'Reviewer' },
    email: { type: String, default: 'inspector@bustd.internal' }
  },
  assets: [assetSchema],
  extractedFields: { type: Object, default: {} },
  findings: [findingSchema],
  summary: {
    totalChecks: { type: Number, default: 0 },
    potentialIssues: { type: Number, default: 0 },
    passedChecks: { type: Number, default: 0 },
    reviewRequired: { type: Number, default: 0 },
    dispositionSummary: {
      confirmed: { type: Number, default: 0 },
      dismissed: { type: Number, default: 0 },
      deferred: { type: Number, default: 0 },
      pending: { type: Number, default: 0 }
    }
  }
}, { timestamps: true });

export default mongoose.models.Inspection || mongoose.model('Inspection', inspectionSchema);
