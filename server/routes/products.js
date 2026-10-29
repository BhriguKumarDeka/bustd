import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const products = await db.getProducts({ search, category });
    res.json({ success: true, data: products, total: products.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const {
      name, sku, brand, category, mrp, netQuantity,
      manufacturer, packerOrImporter, countryOfOrigin, consumerCare,
      monthYearOfManufacture, brandGuidelines
    } = req.body;

    if (!name || !sku || !brand || !mrp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required product attributes (name, sku, brand, mrp).'
      });
    }

    const netQuantityNumeric = parseFloat(netQuantity) || 1;

    const newProduct = await db.createProduct({
      name,
      sku: sku.toUpperCase().trim(),
      brand,
      category: category || 'Stationery / Writing Instruments',
      mrp: Number(mrp),
      currency: 'INR',
      netQuantity: netQuantity || '1 N',
      netQuantityNumeric,
      netQuantityUnit: 'N',
      manufacturer: manufacturer || 'Authorized Manufacturer, India',
      packerOrImporter: packerOrImporter || '',
      countryOfOrigin: countryOfOrigin || 'India',
      consumerCare: consumerCare || 'Helpline: 1800-000-0000, Email: care@domain.com',
      monthYearOfManufacture: monthYearOfManufacture || '',
      brandGuidelines: brandGuidelines || {
        logoMinHeightMm: 12,
        clearSpaceMm: 8,
        primaryHex: '#18181B'
      }
    });

    await db.logAuditEvent({
      inspectionId: null,
      actor: { name: 'Packaging Master Admin', role: 'Catalog Manager' },
      action: 'PRODUCT_CREATED',
      metadata: { productId: newProduct.id, sku: newProduct.sku, name: newProduct.name }
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await db.logAuditEvent({
      inspectionId: null,
      actor: { name: 'Packaging Master Admin', role: 'Catalog Manager' },
      action: 'PRODUCT_UPDATED',
      metadata: { productId: updated.id, sku: updated.sku }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
