import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true, index: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  mrp: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  netQuantity: { type: String, required: true },
  netQuantityNumeric: { type: Number, default: 0 },
  netQuantityUnit: { type: String, default: 'N' },
  manufacturer: { type: String, required: true },
  packerOrImporter: { type: String, default: '' },
  countryOfOrigin: { type: String, required: true },
  consumerCare: { type: String, required: true },
  monthYearOfManufacture: { type: String, default: '' },
  brandGuidelines: {
    logoMinHeightMm: { type: Number, default: 10 },
    clearSpaceMm: { type: Number, default: 5 },
    primaryHex: { type: String, default: '#003399' }
  }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
