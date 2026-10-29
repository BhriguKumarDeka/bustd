import mongoose from 'mongoose';

const complianceRuleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  pillar: { 
    type: String, 
    required: true, 
    enum: ['legal_metrology', 'product_master', 'brand_identity', 'visual_legibility'] 
  },
  field: { type: String, required: true },
  severity: { 
    type: String, 
    required: true, 
    enum: ['critical', 'warning', 'info'],
    default: 'critical' 
  },
  legalReference: { type: String, required: true },
  version: { type: String, default: '1.0.0' },
  status: { 
    type: String, 
    required: true, 
    enum: ['enabled', 'disabled', 'draft'],
    default: 'enabled' 
  },
  validationType: { type: String, required: true },
  testCasesSummary: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.ComplianceRule || mongoose.model('ComplianceRule', complianceRuleSchema);
