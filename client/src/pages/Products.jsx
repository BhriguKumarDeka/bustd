import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Package, 
  ExternalLink, 
  ShieldCheck, 
  Tag, 
  Building2, 
  FileText 
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import Modal from '../components/Modal';

export default function Products() {
  const { addToast } = useSystem();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: '',
    category: 'Writing Instruments / Ball Pens',
    mrp: '',
    netQuantity: '',
    countryOfOrigin: 'India',
    manufacturer: '',
    packerOrImporter: '',
    consumerCare: ''
  });

  const loadProducts = async () => {
    try {
      const res = await api.getProducts();
      setProducts(res.data || []);
    } catch (err) {
      addToast(`Failed to load products: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      brand: '',
      category: 'Writing Instruments / Ball Pens',
      mrp: '',
      netQuantity: '10 N',
      countryOfOrigin: 'India',
      manufacturer: 'Reynolds Pens India Pvt. Ltd., Chennai - 600001, Tamil Nadu',
      packerOrImporter: '',
      consumerCare: 'Phone: 1800-209-1234, Email: customercare@reynoldspens.in'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      sku: p.sku || '',
      brand: p.brand || '',
      category: p.category || 'Writing Instruments',
      mrp: p.mrp || '',
      netQuantity: p.netQuantity || '',
      countryOfOrigin: p.countryOfOrigin || 'India',
      manufacturer: p.manufacturer || '',
      packerOrImporter: p.packerOrImporter || '',
      consumerCare: p.consumerCare || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.mrp) {
      addToast('Name, SKU code, and MRP are required fields.', 'error');
      return;
    }

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          ...formData,
          mrp: parseFloat(formData.mrp)
        });
        addToast(`Updated product master: ${formData.sku}`, 'success');
      } else {
        await api.createProduct({
          ...formData,
          mrp: parseFloat(formData.mrp)
        });
        addToast(`Created product master: ${formData.sku}`, 'success');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      addToast(`Operation failed: ${err.message}`, 'error');
    }
  };

  // Filtered
  const filtered = products.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900 dark:text-zinc-100 tracking-tight">
            Product Master &amp; SKU Catalog
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Authoritative product records used as the source of truth for pre-press packaging consistency checks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-charcoal-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium shadow-soft-sm transition-surface"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Product Master
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-3.5 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-soft-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by SKU, Brand, or Name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white placeholder-zinc-400 text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-control text-xs font-medium capitalize transition-surface shrink-0 ${
                selectedCategory === cat
                  ? 'bg-charcoal-900 dark:bg-white text-white dark:text-black font-semibold shadow-soft-sm'
                  : 'text-zinc-500 hover:text-charcoal-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading product master records...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-400 space-y-2">
          <Package className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
          <p>No products match your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className="p-5 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 space-y-4 shadow-soft-sm hover:border-black/15 dark:hover:border-white/15 transition-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-charcoal-900 dark:text-zinc-100">
                      {product.sku}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/5 dark:bg-white/5 text-zinc-500">
                      {product.brand}
                    </span>
                  </div>
                  <h3 className="font-medium text-xs text-charcoal-800 dark:text-zinc-200 line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                </div>

                <button
                  onClick={() => openEditModal(product)}
                  className="p-1 rounded text-zinc-400 hover:text-charcoal-900 dark:hover:text-white transition-colors"
                  title="Edit Master Record"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Master Data Metrics */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-control bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Master MRP</span>
                  <span className="font-semibold text-charcoal-900 dark:text-zinc-100">
                    ₹{Number(product.mrp).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Declared Net Qty</span>
                  <span className="font-semibold text-charcoal-900 dark:text-zinc-100">
                    {product.netQuantity}
                  </span>
                </div>
              </div>

              {/* Manufacturer & Origin */}
              <div className="space-y-1.5 text-[11px] text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-zinc-400">Origin:</span>
                  <span className="text-charcoal-800 dark:text-zinc-300 font-medium">
                    {product.countryOfOrigin}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-zinc-400 shrink-0">Mfr:</span>
                  <span className="text-zinc-600 dark:text-zinc-400 line-clamp-2 font-sans">
                    {product.manufacturer}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-zinc-400 shrink-0">Care:</span>
                  <span className="text-zinc-600 dark:text-zinc-400 line-clamp-1 font-sans">
                    {product.consumerCare}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product Master: ${editingProduct.sku}` : 'Add Authoritative Product Master'}
        subtitle="Used as the authoritative baseline for packaging compliance verification"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-500 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Reynolds 045 Carbure Ball Pen"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="REY-045-BLU-10"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-500 mb-1">Brand *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Reynolds"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Master MRP (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.mrp}
                onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                placeholder="50.00"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Net Quantity *</label>
              <input
                type="text"
                required
                value={formData.netQuantity}
                onChange={e => setFormData({ ...formData, netQuantity: e.target.value })}
                placeholder="10 N"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-500 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Writing Instruments"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Country of Origin *</label>
              <input
                type="text"
                required
                value={formData.countryOfOrigin}
                onChange={e => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                placeholder="India"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-500 mb-1">Manufacturer Address (with 6-digit PIN code) *</label>
            <textarea
              rows={2}
              required
              value={formData.manufacturer}
              onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1">Consumer Care Details *</label>
            <input
              type="text"
              required
              value={formData.consumerCare}
              onChange={e => setFormData({ ...formData, consumerCare: e.target.value })}
              className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-input text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-input bg-charcoal-900 dark:bg-white text-white dark:text-black font-semibold shadow-soft-sm"
            >
              {editingProduct ? 'Save Changes' : 'Create Product Master'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
