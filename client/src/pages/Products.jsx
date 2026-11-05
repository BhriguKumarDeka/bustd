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
import Surface from '../components/ui/Surface';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
        addToast('Product specification updated.', 'success');
      } else {
        await api.createProduct({
          ...formData,
          mrp: parseFloat(formData.mrp)
        });
        addToast('New product baseline registered.', 'success');
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
          <h2 className="text-lg sm:text-xl font-semibold text-primary tracking-tight">
            SKU Master Specifications
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Authoritative product declaration records used as verification baselines.
          </p>
        </div>

        <Button
          variant="gradient"
          icon={Plus}
          onClick={openCreateModal}
          className="self-start sm:self-auto"
        >
          Register Master SKU
        </Button>
      </div>

      {/* Search & Category Filter with Double Layer */}
      <DoubleLayerCard innerClassName="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="w-full md:w-80">
            <Input
              icon={Search}
              placeholder="Search by SKU, Brand, or Product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'tactile-active-nav font-semibold shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-surface-interactive'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </DoubleLayerCard>

      {/* Products Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted space-y-2">
          <div className="w-6 h-6 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
          <p>Loading master SKU catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <DoubleLayerCard innerClassName="p-12 text-center space-y-3">
          <Package className="w-8 h-8 mx-auto text-muted" />
          <p className="text-xs text-muted">No master products found.</p>
        </DoubleLayerCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Surface
              key={p.id}
              variant="default"
              className="p-5 space-y-4 hover:shadow-soft-md transition-shadow group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-primary">
                      {p.sku}
                    </span>
                    <h3 className="text-sm font-semibold text-primary leading-snug">
                      {p.name}
                    </h3>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {p.brand}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-xl bg-surface-subtle border border-subtle">
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Declared MRP</span>
                    <span className="font-bold text-primary">₹{Number(p.mrp).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Net Quantity</span>
                    <span className="font-bold text-primary">{p.netQuantity}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-[10px] text-muted block uppercase font-mono">Manufacturer</span>
                    <p className="text-[11px] text-secondary leading-snug line-clamp-2">
                      {p.manufacturer}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block uppercase font-mono">Country of Origin</span>
                    <p className="text-[11px] text-primary font-medium">
                      {p.countryOfOrigin}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-subtle flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted font-mono">
                  Origin: {p.countryOfOrigin}
                </span>
                <button
                  onClick={() => openEditModal(p)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Spec</span>
                </button>
              </div>
            </Surface>
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
            <label className="block text-secondary mb-1 font-mono text-[11px]">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-secondary mb-1 font-mono text-[11px]">SKU Identifier *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary font-mono focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-secondary mb-1 font-mono text-[11px]">Brand *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-secondary mb-1 font-mono text-[11px]">Declared MRP (INR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.mrp}
                onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary font-mono focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-secondary mb-1 font-mono text-[11px]">Net Quantity *</label>
              <input
                type="text"
                required
                value={formData.netQuantity}
                onChange={e => setFormData({ ...formData, netQuantity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary font-mono focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-secondary mb-1 font-mono text-[11px]">Manufacturer Details &amp; PIN *</label>
            <textarea
              rows={2}
              required
              value={formData.manufacturer}
              onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-secondary mb-1 font-mono text-[11px]">Country of Origin *</label>
              <input
                type="text"
                required
                value={formData.countryOfOrigin}
                onChange={e => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-secondary mb-1 font-mono text-[11px]">Consumer Care Info *</label>
              <input
                type="text"
                required
                value={formData.consumerCare}
                onChange={e => setFormData({ ...formData, consumerCare: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-subtle">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              type="submit"
            >
              Save Master Spec
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
