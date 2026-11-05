import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit3, 
  Package, 
  Tag, 
  Building2, 
  FileText 
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import Modal from '../components/Modal';
import DoubleLayerCard from '../components/DoubleLayerCard';

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

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto pb-20"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            SKU Master Specifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authoritative product declaration records used as verification baselines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-shimmer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-bustd hover:opacity-95 text-white text-xs font-semibold self-start sm:self-auto shadow-sm transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Master SKU</span>
        </button>
      </div>

      {/* Search & Category Filter with Double Layer */}
      <DoubleLayerCard innerClassName="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, Brand, or Product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </DoubleLayerCard>

      {/* Products Grid (Clean 1D cards with subtle double-layered details) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 space-y-2">
          <div className="w-6 h-6 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
          <p>Loading master SKU catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <DoubleLayerCard innerClassName="p-12 text-center space-y-3">
          <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-xs text-slate-500">No master products found.</p>
        </DoubleLayerCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-4 shadow-soft-sm hover:shadow-soft-md transition-shadow group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {p.sku}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                      {p.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-semibold shrink-0">
                    {p.brand}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Declared MRP</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{Number(p.mrp).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Net Quantity</span>
                    <span className="font-bold text-slate-900 dark:text-white">{p.netQuantity}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Manufacturer</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                      {p.manufacturer}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Country of Origin</span>
                    <p className="text-[11px] text-slate-900 dark:text-white font-medium">
                      {p.countryOfOrigin}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  Origin: {p.countryOfOrigin}
                </span>
                <button
                  onClick={() => openEditModal(p)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Spec</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Master Spec: ${editingProduct.sku}` : 'Register Master Product Baseline'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">SKU Identifier *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Brand *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Declared MRP (INR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.mrp}
                onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Net Quantity *</label>
              <input
                type="text"
                required
                value={formData.netQuantity}
                onChange={e => setFormData({ ...formData, netQuantity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Manufacturer Details &amp; PIN *</label>
            <textarea
              rows={2}
              required
              value={formData.manufacturer}
              onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Country of Origin *</label>
              <input
                type="text"
                required
                value={formData.countryOfOrigin}
                onChange={e => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Consumer Care Info *</label>
              <input
                type="text"
                required
                value={formData.consumerCare}
                onChange={e => setFormData({ ...formData, consumerCare: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-shimmer px-4 py-2 rounded-xl bg-gradient-bustd text-white font-semibold shadow-sm"
            >
              Save Master Spec
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
