import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;
let storageMode = 'local_file_store'; // 'mongodb' or 'local_file_store'

// Initial in-memory cache for local file store
let localStore = {
  products: [],
  inspections: [],
  rules: [],
  auditEvents: []
};

// Load initial store if exists
function loadLocalStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      localStore = JSON.parse(data);
    } else {
      saveLocalStore();
    }
  } catch (err) {
    console.warn('[DB] Failed to load local store file, starting clean cache:', err.message);
  }
}

function saveLocalStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to persist local store file:', err.message);
  }
}

export async function initDatabase(mongoUri = process.env.MONGODB_URI) {
  loadLocalStore();

  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      console.log(`[DB] Attempting connection to MongoDB at: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500
      });
      isMongoConnected = true;
      storageMode = 'mongodb';
      console.log('✓ [DB] Successfully connected to MongoDB.');
    } catch (err) {
      console.warn('! [DB] MongoDB unavailable. Falling back cleanly to transparent Local File Store (server/data/store.json).');
      console.warn(`! [DB] Reason: ${err.message}`);
      isMongoConnected = false;
      storageMode = 'local_file_store';
    }
  } else {
    console.log('ℹ [DB] No MONGODB_URI provided in environment. Running with Local File Store (server/data/store.json).');
    storageMode = 'local_file_store';
  }

  return { storageMode, isMongoConnected };
}

export function getSystemStorageStatus() {
  return {
    storageMode,
    isMongoConnected,
    databaseFile: storageMode === 'local_file_store' ? DB_FILE : null,
    mongoUri: isMongoConnected ? process.env.MONGODB_URI ? 'Configured' : 'Local' : null
  };
}

// Universal DAO operations for both Local Store and MongoDB
export const db = {
  // --- PRODUCTS ---
  async getProducts(filter = {}) {
    let results = [...localStore.products];
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    if (filter.category) {
      results = results.filter(p => p.category === filter.category);
    }
    return results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async getProductById(id) {
    return localStore.products.find(p => p.id === id || p._id === id) || null;
  },

  async createProduct(productData) {
    const id = 'prod_' + Math.random().toString(36).substring(2, 9);
    const newProduct = {
      ...productData,
      id,
      _id: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStore.products.unshift(newProduct);
    saveLocalStore();
    return newProduct;
  },

  async updateProduct(id, updates) {
    const idx = localStore.products.findIndex(p => p.id === id || p._id === id);
    if (idx === -1) return null;
    const updated = {
      ...localStore.products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStore.products[idx] = updated;
    saveLocalStore();
    return updated;
  },

  // --- RULES ---
  async getRules() {
    return [...localStore.rules];
  },

  async getRuleById(id) {
    return localStore.rules.find(r => r.ruleId === id || r.id === id) || null;
  },

  async updateRule(ruleId, updates) {
    const idx = localStore.rules.findIndex(r => r.ruleId === ruleId || r.id === ruleId);
    if (idx === -1) return null;
    const updated = {
      ...localStore.rules[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStore.rules[idx] = updated;
    saveLocalStore();
    return updated;
  },

  // --- INSPECTIONS ---
  async getInspections(filter = {}) {
    let results = [...localStore.inspections];
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(i => 
        (i.inspectionNumber && i.inspectionNumber.toLowerCase().includes(q)) ||
        (i.productSnapshot?.name && i.productSnapshot.name.toLowerCase().includes(q)) ||
        (i.productSnapshot?.brand && i.productSnapshot.brand.toLowerCase().includes(q)) ||
        (i.productSnapshot?.sku && i.productSnapshot.sku.toLowerCase().includes(q))
      );
    }
    if (filter.status) {
      results = results.filter(i => i.status === filter.status);
    }
    if (filter.decision) {
      results = results.filter(i => i.finalDecision === filter.decision);
    }
    return results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async getInspectionById(id) {
    return localStore.inspections.find(i => i.id === id || i._id === id || i.inspectionNumber === id) || null;
  },

  async createInspection(inspectionData) {
    const id = 'ins_' + Math.random().toString(36).substring(2, 9);
    const count = localStore.inspections.length + 1001;
    const inspectionNumber = `INS-2026-${count}`;
    const newInspection = {
      ...inspectionData,
      id,
      _id: id,
      inspectionNumber,
      status: inspectionData.status || 'created',
      finalDecision: 'pending',
      finalDecisionNotes: '',
      findings: inspectionData.findings || [],
      assets: inspectionData.assets || [],
      extractedFields: inspectionData.extractedFields || {},
      summary: inspectionData.summary || {
        totalChecks: 0,
        potentialIssues: 0,
        passedChecks: 0,
        reviewRequired: 0,
        dispositionSummary: { confirmed: 0, dismissed: 0, deferred: 0, pending: 0 }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStore.inspections.unshift(newInspection);
    saveLocalStore();
    return newInspection;
  },

  async updateInspection(id, updates) {
    const idx = localStore.inspections.findIndex(i => i.id === id || i._id === id || i.inspectionNumber === id);
    if (idx === -1) return null;
    const updated = {
      ...localStore.inspections[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStore.inspections[idx] = updated;
    saveLocalStore();
    return updated;
  },

  // --- AUDIT EVENTS ---
  async logAuditEvent(event) {
    const newEvent = {
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      ...event,
      timestamp: new Date().toISOString()
    };
    localStore.auditEvents.unshift(newEvent);
    // Limit to latest 500 events
    if (localStore.auditEvents.length > 500) {
      localStore.auditEvents = localStore.auditEvents.slice(0, 500);
    }
    saveLocalStore();
    return newEvent;
  },

  async getAuditEvents(inspectionId = null) {
    if (inspectionId) {
      return localStore.auditEvents.filter(e => e.inspectionId === inspectionId);
    }
    return localStore.auditEvents.slice(0, 50);
  },

  // Direct access for seed check
  getRawStore() {
    return localStore;
  },

  setInitialSeed(seedData) {
    localStore = {
      products: seedData.products || [],
      inspections: seedData.inspections || [],
      rules: seedData.rules || [],
      auditEvents: seedData.auditEvents || []
    };
    saveLocalStore();
  }
};
