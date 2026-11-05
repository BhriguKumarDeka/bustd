import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Upload, 
  FileText, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Plus, 
  Layers, 
  Scan, 
  Sparkles,
  Box,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import Modal from '../components/Modal';
import DoubleLayerCard from '../components/DoubleLayerCard';
import FilePill from '../components/FilePill';
import PackFormatSelector, { PACK_FORMATS } from '../components/PackFormatSelector';

export default function NewInspection() {
  const navigate = useNavigate();
  const { addToast } = useSystem();

  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedPackFormat, setSelectedPackFormat] = useState(PACK_FORMATS[0]); // Default Tuck-End Carton
  const [inspection, setInspection] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [panelType, setPanelType] = useState('back');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);

  // New product inline modal state
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    sku: '',
    brand: '',
    category: 'Writing Instruments / Ball Pens',
    mrp: '',
    netQuantity: '10 N',
    countryOfOrigin: 'India',
    manufacturer: 'Reynolds Pens India Pvt. Ltd., Chennai - 600001',
    consumerCare: 'Phone: 1800-209-1234, Email: customercare@reynoldspens.in'
  });

  const stages = [
    'Validating packaging assets and file integrity...',
    'Calling OCR adapter and normalizing text polygon tokens...',
    'Mapping candidate declarations to canonical fields...',
    'Evaluating statutory compliance rules...',
    'Preparing spatial evidence links and audit records...'
  ];

  useEffect(() => {
    async function loadInitial() {
      try {
        const [prodRes, rulesRes] = await Promise.all([
          api.getProducts(),
          api.getRules()
        ]);
        setProducts(prodRes.data || []);
        setRules(rulesRes.data || []);
        if (prodRes.data && prodRes.data.length > 0) {
          setSelectedProductId(prodRes.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial inspection data:', err);
      }
    }
    loadInitial();
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Step 1 -> Step 2: Initialize inspection session
  const handleProceedFromProduct = async () => {
    if (!selectedProduct) {
      addToast('Please select a product first.', 'error');
      return;
    }
    setLoading(true);
    try {
      const isSamplePen = selectedProduct.sku?.includes('REY');
      const res = await api.createInspection({
        productId: selectedProduct.id,
        samplePreset: isSamplePen ? 'pen' : 'custom',
        packFormat: selectedPackFormat?.name || 'Tuck-End Carton'
      });
      setInspection(res.data);
      setUploadedFiles(res.data.assets || []);
      setStep(2); // Advance to Pack Format Template Selection
    } catch (err) {
      addToast(`Error initializing inspection: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Confirm pack format template
  const handleProceedFromFormat = () => {
    if (!selectedPackFormat) {
      addToast('Please select a pack format template.', 'error');
      return;
    }
    setStep(3); // Advance to Artwork Upload
  };

  // Step 3: Handle real file uploads
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!inspection) return;

    setLoading(true);
    try {
      const res = await api.uploadAssets(inspection.id, files, panelType);
      setInspection(res.data);
      setUploadedFiles(res.data.assets || []);
      addToast(`Uploaded ${files.length} artwork panel(s) successfully.`, 'success');
    } catch (err) {
      addToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAsset = async (assetId) => {
    if (!inspection) return;
    try {
      const res = await api.removeAsset(inspection.id, assetId);
      setInspection(res.data);
      setUploadedFiles(res.data.assets || []);
      addToast('Asset removed.', 'info');
    } catch (err) {
      addToast(`Failed to remove asset: ${err.message}`, 'error');
    }
  };

  // Load sample pen artwork preset (FIXED: loads seeded assets directly into active session)
  const handleLoadSampleAssets = async () => {
    if (!inspection) return;
    setLoading(true);
    try {
      const res = await api.loadPreset(inspection.id, 'pen');
      setInspection(res.data);
      setUploadedFiles(res.data.assets || []);
      addToast('Loaded high-resolution Reynolds 045 sample packaging dielines.', 'success');
    } catch (err) {
      addToast(`Failed to load demo assets: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Run real inspection analysis with meaningful progress stages
  const handleRunAnalysis = async () => {
    if (!inspection) return;
    if (uploadedFiles.length === 0) {
      addToast('Please upload at least one packaging image before running inspection.', 'warning');
      return;
    }

    setAnalyzing(true);
    setAnalysisStage(0);

    const timer1 = setTimeout(() => setAnalysisStage(1), 500);
    const timer2 = setTimeout(() => setAnalysisStage(2), 1200);
    const timer3 = setTimeout(() => setAnalysisStage(3), 1900);
    const timer4 = setTimeout(() => setAnalysisStage(4), 2600);

    try {
      await api.runAnalysis(inspection.id);
      setTimeout(() => {
        setAnalyzing(false);
        addToast('Inspection analysis complete! Review findings.', 'success');
        navigate(`/inspections/${inspection.id}`);
      }, 3200);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setAnalyzing(false);
      addToast(`Analysis failed: ${err.message}`, 'error');
    }
  };

  // Create new product form submit
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.sku || !newProductForm.mrp) {
      addToast('Please complete name, SKU, and MRP.', 'error');
      return;
    }

    try {
      const res = await api.createProduct({
        ...newProductForm,
        mrp: parseFloat(newProductForm.mrp)
      });
      setProducts(prev => [res.data, ...prev]);
      setSelectedProductId(res.data.id);
      setIsNewProductModalOpen(false);
      addToast(`Created product ${res.data.name} (${res.data.sku}).`, 'success');
    } catch (err) {
      addToast(`Failed to create product: ${err.message}`, 'error');
    }
  };

  const stepsList = [
    { num: 1, title: 'Select Spec' },
    { num: 2, title: 'Pack Format' },
    { num: 3, title: 'Upload Proofs' },
    { num: 4, title: 'Check Rules' },
    { num: 5, title: 'Run Scan' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* 5-Step Stepper with Radiant Gradient & Butter Transition */}
      <DoubleLayerCard innerClassName="py-3 px-4 sm:px-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {stepsList.map((s, idx) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-all ${
                      isCompleted
                        ? 'bg-gradient-bustd text-white shadow-sm'
                        : isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isActive
                        ? 'text-slate-900 dark:text-white font-semibold'
                        : isCompleted
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 transition-colors ${
                      isCompleted ? 'bg-gradient-bustd' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </DoubleLayerCard>

      {/* STEP 1: SELECT PRODUCT MASTER SPEC */}
      {step === 1 && (
        <motion.section 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                1. Select Product Specification Baseline
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Declarations on packaging artwork will be audited against this ERP master record.
              </p>
            </div>
            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              New Product Spec
            </button>
          </div>

          {/* Product Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => {
              const isSelected = selectedProductId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all text-xs space-y-2.5 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-850 border-pink-500/50 shadow-soft-md ring-2 ring-pink-500/30'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-white">
                      {p.sku}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
                      {p.brand}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {p.category}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Declared MRP</span>
                      <span className="font-bold text-slate-900 dark:text-white">₹{Number(p.mrp).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Net Quantity</span>
                      <span className="font-bold text-slate-900 dark:text-white">{p.netQuantity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Product Master Details in Double Layer Shell */}
          {selectedProduct && (
            <DoubleLayerCard
              header={
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Master Baseline Specifications
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Manufacturer</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 leading-snug">
                    {selectedProduct.manufacturer}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Country of Origin</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 leading-snug">
                    {selectedProduct.countryOfOrigin}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Consumer Care Declaration</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 leading-snug">
                    {selectedProduct.consumerCare}
                  </p>
                </div>
              </div>
            </DoubleLayerCard>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleProceedFromProduct}
              disabled={loading || !selectedProduct}
              className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-bustd hover:opacity-95 text-white text-xs font-semibold shadow-sm transition-opacity"
            >
              <span>{loading ? 'Initializing Session...' : 'Next: Choose Pack Format'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.section>
      )}

      {/* STEP 2: PACK FORMAT TEMPLATE (From user's uploaded reference image!) */}
      {step === 2 && (
        <motion.section 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono uppercase text-pink-500 font-bold tracking-wider mb-0.5">
                STEP 02 / PACK FORMAT
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                What type of pack is this?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecting the packaging structure helps the AI localize label directions, panel boundaries, and aspect ratios automatically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                Active: <span className="text-slate-900 dark:text-white font-semibold">{selectedPackFormat?.name}</span>
              </span>
            </div>
          </div>

          {/* Interactive Pack Format Template Grid */}
          <PackFormatSelector
            selectedFormatId={selectedPackFormat?.id}
            onSelectFormat={(format) => setSelectedPackFormat(format)}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              onClick={handleProceedFromFormat}
              className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-bustd hover:opacity-95 text-white text-xs font-semibold shadow-sm transition-opacity"
            >
              <span>Next: Upload Artwork Proofs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.section>
      )}

      {/* STEP 3: UPLOAD PACKAGING ARTWORK */}
      {step === 3 && (
        <motion.section 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                3. Ingest Packaging Artwork Panels
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Template: <span className="font-semibold text-slate-900 dark:text-white">{selectedPackFormat?.name}</span> • Ingests {selectedPackFormat?.panels.join(', ')}
              </p>
            </div>

            {/* FIXED: Load Seeded Pen Dielines Button */}
            <button
              onClick={handleLoadSampleAssets}
              disabled={loading}
              className="btn-shimmer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 transition-colors self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Load Seeded Pen Dielines</span>
            </button>
          </div>

          {/* Double-Layered Upload & File Tag Shell */}
          <DoubleLayerCard
            header={
              uploadedFiles.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  <AnimatePresence>
                    {uploadedFiles.map((asset) => {
                      const panelLabel = asset.panel || asset.panelType || 'artwork';
                      return (
                        <FilePill
                          key={asset.assetId}
                          name={asset.originalFilename}
                          type={asset.mimeType?.includes('pdf') ? 'pdf' : 'image'}
                          size={`${panelLabel.toUpperCase()} panel`}
                          onRemove={() => handleRemoveAsset(asset.assetId)}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              )
            }
          >
            {/* Inner Upload Drop Target */}
            <div className="text-center space-y-4 py-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-500">
                <Upload className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Drag and drop packaging artwork proofs or select files
                </h3>
                <p className="text-xs text-slate-400">
                  Accepts PNG, JPG, JPEG, and PDF (Max 25MB). Actual artwork is used as inspection evidence.
                </p>
              </div>

              {/* Panel Assignment Pills */}
              <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 text-xs">
                <span className="text-slate-500 px-2 font-mono text-[11px]">Assign Panel:</span>
                {['back', 'front', 'side'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPanelType(p)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                      panelType === p
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {p === 'back' ? 'Back (Declarations)' : p === 'front' ? 'Front (PDP)' : 'Side'}
                  </button>
                ))}
              </div>

              <div>
                <label className="btn-shimmer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold cursor-pointer shadow-sm hover:opacity-95 transition-opacity">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Choose Files from Computer</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </DoubleLayerCard>

          {/* Uploaded Panel Proof Cards */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Attached Artwork Panels ({uploadedFiles.length})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedFiles.map((asset) => {
                  const panelLabel = asset.panel || asset.panelType || 'artwork';
                  return (
                    <div
                      key={asset.assetId}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-2.5 shadow-soft-sm group relative"
                    >
                      <div className="aspect-[4/3] rounded-xl bg-slate-100 dark:bg-black/40 overflow-hidden relative border border-slate-200/60 dark:border-white/5 flex items-center justify-center">
                        <img
                          src={asset.storedPath}
                          alt={asset.originalFilename}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <button
                          onClick={() => handleRemoveAsset(asset.assetId)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove panel"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-900 dark:text-white truncate max-w-[140px]">
                          {asset.originalFilename}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-semibold">
                          {panelLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              onClick={() => setStep(4)}
              disabled={uploadedFiles.length === 0}
              className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-bustd hover:opacity-95 text-white text-xs font-semibold shadow-sm transition-opacity disabled:opacity-50"
            >
              <span>Next: Review Active Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.section>
      )}

      {/* STEP 4: CONFIGURE SCAN RULES */}
      {step === 4 && (
        <motion.section 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              4. Review Configured Statutory Compliance Rules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              These deterministic rules will execute against detected packaging tokens on your {selectedPackFormat?.name}.
            </p>
          </div>

          <DoubleLayerCard innerClassName="p-0 overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {rules.map((rule) => {
                const isEnabled = rule.status === 'enabled';
                return (
                  <div key={rule.ruleId} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {rule.ruleId}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {rule.name}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/5 text-slate-500">
                          {rule.pillar.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                        {rule.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                          isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </DoubleLayerCard>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              onClick={() => setStep(5)}
              className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-bustd hover:opacity-95 text-white text-xs font-semibold shadow-sm transition-opacity"
            >
              <span>Next: Execute Inspection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.section>
      )}

      {/* STEP 5: RUN ANALYSIS (With Radiant Progress Shimmer) */}
      {step === 5 && (
        <motion.section 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center max-w-xl mx-auto space-y-2 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ready to Execute Inspection Scan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Target SKU: <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedProduct?.sku}</span> ({selectedProduct?.name})
              <br />
              Pack Format: <span className="font-semibold text-pink-600 dark:text-pink-400">{selectedPackFormat?.name}</span> • <span className="font-mono font-bold text-slate-900 dark:text-white">{uploadedFiles.length} panels</span> attached.
            </p>
          </div>

          {analyzing ? (
            /* Analysis Progress Shell with Multi-Hue Gradient & Continuous Shimmer Flare */
            <DoubleLayerCard className="max-w-md mx-auto" innerClassName="text-center space-y-6 py-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-bustd flex items-center justify-center text-white mx-auto shadow-glow-bustd animate-pulse">
                <Scan className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-xs text-gradient-bustd uppercase tracking-wider font-bold">
                  Stage {analysisStage + 1} of 5
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {stages[analysisStage]}
                </p>
              </div>

              {/* Fluid Gradient Progress Bar with Animated Shimmer Sweep */}
              <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden relative">
                <motion.div
                  className="bg-gradient-bustd h-full rounded-full relative overflow-hidden progress-bar-shimmer"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((analysisStage + 1) / 5) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <p className="text-[11px] text-slate-400 font-mono">
                Preserving original OCR tokens &amp; computing spatial coordinates...
              </p>
            </DoubleLayerCard>
          ) : (
            <DoubleLayerCard className="max-w-lg mx-auto" innerClassName="text-center space-y-5 py-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 flex items-center justify-center mx-auto">
                <Scan className="w-6 h-6" />
              </div>

              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  All Inputs &amp; Templates Validated
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click below to trigger OCR token extraction, field mapping, and deterministic rule evaluation.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRunAnalysis}
                  className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-bustd hover:opacity-95 text-white text-xs font-semibold shadow-glow-bustd transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Inspection Scan</span>
                </button>
              </div>
            </DoubleLayerCard>
          )}

          {!analyzing && (
            <div className="flex justify-start">
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>
          )}
        </motion.section>
      )}

      {/* CREATE NEW PRODUCT MODAL */}
      <Modal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        title="Register Master Product Baseline"
      >
        <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Product Name *</label>
            <input
              type="text"
              required
              value={newProductForm.name}
              onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
              placeholder="e.g. Reynolds 045 Fine Carbure Ball Pen (Blue)"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">SKU Identifier *</label>
              <input
                type="text"
                required
                value={newProductForm.sku}
                onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                placeholder="e.g. REY-045-BLU-10"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Brand Name *</label>
              <input
                type="text"
                required
                value={newProductForm.brand}
                onChange={(e) => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                placeholder="e.g. Reynolds"
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
                value={newProductForm.mrp}
                onChange={(e) => setNewProductForm({ ...newProductForm, mrp: e.target.value })}
                placeholder="50.00"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Declared Net Quantity *</label>
              <input
                type="text"
                required
                value={newProductForm.netQuantity}
                onChange={(e) => setNewProductForm({ ...newProductForm, netQuantity: e.target.value })}
                placeholder="10 N (Pens)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-[11px]">Manufacturer &amp; Address *</label>
            <textarea
              rows={2}
              required
              value={newProductForm.manufacturer}
              onChange={(e) => setNewProductForm({ ...newProductForm, manufacturer: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewProductModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-shimmer px-4 py-2 rounded-xl bg-gradient-bustd text-white font-semibold text-xs shadow-sm"
            >
              Save Product Master
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
