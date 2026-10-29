import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  inspectionId: { type: String, default: null, index: true },
  actor: {
    name: { type: String, default: 'Inspector / QA Lead' },
    role: { type: String, default: 'Inspector' }
  },
  action: { type: String, required: true },
  metadata: { type: Object, default: {} },
  timestamp: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.AuditEvent || mongoose.model('AuditEvent', auditEventSchema);
