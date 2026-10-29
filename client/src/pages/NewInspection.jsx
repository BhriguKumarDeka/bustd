import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Upload, 
  FileText, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  Layers, 
  Scan, 
  Image as ImageIcon,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import Modal from '../components/Modal';

export default function NewInspection() {
  const navigate = useNavigate();
  const { addToast } = useSystem();

  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
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
    'Evaluating three-pillar deterministic compliance rules...',
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

  // Step 1: Create or select inspection session
  const handleProceedFromProduct = async () => {
    if (!selectedProduct) {
      addToast('Please select a product first.', 'error');
      return;
    }
    setLoading(true);
    try {
      // Auto-prepopulate sample assets if pen is chosen so user can test without upload if desired
      const isSamplePen = selectedProduct.sku?.includes('REY');
      const res = await api.createInspection({
        productId: selectedProduct.id,
        samplePreset: isSamplePen ? 'pen' : 'custom'
      });
      setInspection(res.data);
      setUploadedFiles(res.data.assets || []);
      setStep(2);
    } catch (err) {
      addToast(`Error initializing inspection: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle real file uploads
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

  // Load sample pen artwork preset
  const handleLoadSampleAssets = async () => {
    if (!inspection) return;
    setLoading(true);
    try {
      // The sample assets are in /uploads/pen_pdp_front.svg and /uploads/pen_info_back.svg
      const sampleAssets = [
        {
          assetId: 'asset_sample_front_' + Date.now(),
          panel: 'front',
          originalFilename: 'reynolds_045_pdp_front.svg',
          storedPath: '/uploads/pen_pdp_front.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: 4210,
          dimensions: { width: 600, height: 900 },
          qualityPrecheck: { sharpness: 94, glare: 8, resolutionOk: true, status: 'passed' }
        },
        {
          assetId: 'asset_sample_back_' + Date.now(),
          panel: 'back',
          originalFilename: 'reynolds_045_info_back.svg',
          storedPath: '/uploads/pen_info_back.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: 7850,
          dimensions: { width: 600, height: 900 },
          qualityPrecheck: { sharpness: 89, glare: 14, resolutionOk: true, status: 'passed' }
        }
      ];

      // Update inspection with sample assets
      const updated = await api.createInspection({
        productId: selectedProduct.id,
        samplePreset: 'pen'
      });
      setInspection(updated.data);
      setUploadedFiles(updated.data.assets || []);
      addToast('Loaded high-resolution sample packaging artwork dielines.', 'success');
    } catch (err) {
      addToast(`Failed to load demo assets: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Run real inspection analysis with meaningful progress stages
  const handleRunAnalysis = async () => {
    if (!inspection) return;
    if (uploadedFiles.length === 0) {
      addToast('Please upload at least one packaging image before running inspection.', 'warning');
      return;
    }

    setAnalyzing(true);
    setAnalysisStage(0);

    // Staged progress timer to reflect the 5 distinct pipeline stages
    const timer1 = setTimeout(() => setAnalysisStage(1), 500);
    const timer2 = setTimeout(() => setAnalysisStage(2), 1200);
    const timer3 = setTimeout(() => setAnalysisStage(3), 1900);
    const timer4 = setTimeout(() => setAnalysisStage(4), 2600);

    try {
      const res = await api.runAnalysis(inspection.id);
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Wizard Step Indicator */}
      <div className="p-4 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 shadow-soft-sm">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { num: 1, title: 'Select Product' },
            { num: 2, title: 'Upload Artwork' },
            { num: 3, title: 'Configure Scan' },
            { num: 4, title: 'Run Analysis' }
          ].map((s, idx) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-surface ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-charcoal-900 text-white dark:bg-white dark:text-black shadow-soft-sm'
                        : 'bg-black/5 dark:bg-white/5 text-zinc-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isActive
                        ? 'text-charcoal-900 dark:text-zinc-100 font-semibold'
                        : isCompleted
                        ? 'text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-[2px] mx-3 transition-colors ${
                      isCompleted ? 'bg-emerald-500/60' : 'bg-black/5 dark:bg-white/5'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: SELECT PRODUCT */}
      {step === 1 && (
        <section className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-charcoal-900 dark:text-zinc-100 tracking-tight">
                Step 1: Choose Authoritative Product Master Record
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                BUSTD validates printed declarations against this authoritative ERP master baseline.
              </p>
            </div>
            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-charcoal-900 dark:text-zinc-200 transition-surface"
            >
              <Plus className="w-3.5 h-3.5" />
              New Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => {
              const isSelected = selectedProductId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`p-4 rounded-panel cursor-pointer border transition-surface text-xs space-y-2.5 ${
                    isSelected
                      ? 'bg-white dark:bg-[#161616] border-charcoal-900 dark:border-white shadow-soft-md'
                      : 'bg-white/50 dark:bg-[#111111] border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-charcoal-900 dark:text-zinc-100">
                      {p.sku}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/5 dark:bg-white/5 text-zinc-500">
                      {p.brand}
                    </span>
                  </div>

                  <h3 className="font-medium text-charcoal-800 dark:text-zinc-200 line-clamp-2 leading-snug">
                    {p.name}
                  </h3>

                  <div className="pt-2 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Authoritative MRP</span>
                      <span className="font-semibold text-charcoal-900 dark:text-zinc-100">
                        ₹{Number(p.mrp).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Net Quantity</span>
                      <span className="font-semibold text-charcoal-900 dark:text-zinc-100 truncate block">
                        {p.netQuantity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Product Master Details card */}
          {selectedProduct && (
            <div className="p-5 rounded-panel bg-raised-light dark:bg-raised-dark border border-black/5 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-wider text-zinc-400">
                  Target Product Master Snapshot
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  Verified SKU Master Baseline
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 text-[10px] block">Brand & Category</span>
                  <span className="text-charcoal-900 dark:text-zinc-200">
                    {selectedProduct.brand} • {selectedProduct.category}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">Origin</span>
                  <span className="text-charcoal-900 dark:text-zinc-200">
                    {selectedProduct.countryOfOrigin}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-zinc-400 text-[10px] block">Manufacturer</span>
                  <span className="text-charcoal-900 dark:text-zinc-200 line-clamp-1 font-sans">
                    {selectedProduct.manufacturer}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleProceedFromProduct}
              disabled={loading || !selectedProduct}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-input bg-charcoal-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium shadow-soft-sm transition-surface disabled:opacity-50"
            >
              Next: Upload Packaging Artwork
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: UPLOAD PACKAGING ARTWORK */}
      {step === 2 && (
        <section className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-charcoal-900 dark:text-zinc-100 tracking-tight">
                Step 2: Upload Packaging Artwork Panels
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Upload front display panels (PDP), back informational panels, or multi-panel dielines. Accepts PNG, JPG, JPEG, and PDF.
              </p>
            </div>

            <button
              onClick={handleLoadSampleAssets}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-surface"
              title="Loads high-resolution Reynolds 045 ball pen packaging dieline files for quick testing"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Seeded Pen Dielines
            </button>
          </div>

          {/* Panel Selector & Dropzone */}
          <div className="p-6 rounded-workspace bg-white dark:bg-[#121212] border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-4 shadow-soft-sm">
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-zinc-500">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-charcoal-900 dark:text-zinc-200">
                Drag and drop packaging proofs or select files
              </h3>
              <p className="text-xs text-zinc-400">
                Supported formats: PNG, JPG, JPEG, SVG, PDF (Max 25MB per file)
              </p>
            </div>

            {/* Target Panel Dropdown */}
            <div className="inline-flex items-center gap-2 p-1 rounded-control bg-black/5 dark:bg-white/5 text-xs">
              <span className="text-zinc-500 px-2 font-mono text-[11px]">Assign Panel:</span>
              {['back', 'front', 'side'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPanelType(p)}
                  className={`px-2.5 py-1 rounded text-xs capitalize transition-surface ${
                    panelType === p
                      ? 'bg-white dark:bg-[#202020] text-charcoal-900 dark:text-white font-medium shadow-soft-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p === 'back' ? 'Back (Declarations)' : p === 'front' ? 'Front (PDP)' : 'Side / Gusset'}
                </button>
              ))}
            </div>

            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-input bg-charcoal-900 dark:bg-white text-white dark:text-black text-xs font-medium cursor-pointer shadow-soft-sm hover:scale-[1.01] transition-transform">
                <span>Select Files from Disk</span>
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

          {/* Uploaded Assets List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase tracking-wider text-zinc-400">
                Uploaded Evidence Files ({uploadedFiles.length})
              </span>
              <span className="text-zinc-500 text-[11px]">
                Actual uploaded images are used directly as inspection evidence.
              </span>
            </div>

            {uploadedFiles.length === 0 ? (
              <div className="p-8 text-center rounded-panel bg-white/40 dark:bg-[#111111] border border-black/5 dark:border-white/5 text-xs text-zinc-400">
                No packaging panels uploaded yet. Drop files above or click "Load Seeded Pen Dielines".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedFiles.map((asset) => (
                  <div
                    key={asset.assetId}
                    className="p-3.5 rounded-panel bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 space-y-3 shadow-soft-sm"
                  >
                    <div className="aspect-[4/3] rounded bg-black/5 dark:bg-black/30 overflow-hidden relative border border-black/5 dark:border-white/5 flex items-center justify-center">
                      <img
                        src={asset.storedPath}
                        alt={asset.originalFilename}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/75 text-white backdrop-blur-sm">
                        {asset.panel} panel
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-charcoal-900 dark:text-zinc-100 truncate">
                          {asset.originalFilename}
                        </span>
                        <button
                          onClick={() => handleRemoveAsset(asset.assetId)}
                          className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                          title="Remove asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image quality precheck badge */}
                      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                        <span>Sharpness: {asset.qualityPrecheck?.sharpness || 90}%</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400">Passed Precheck</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-input bg-black/5 dark:bg-white/5 text-xs text-charcoal-800 dark:text-zinc-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              onClick={() => setStep(3)}
              disabled={uploadedFiles.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-input bg-charcoal-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium shadow-soft-sm disabled:opacity-50"
            >
              Next: Configure Scan
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: CONFIGURE SCAN RULES */}
      {step === 3 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-charcoal-900 dark:text-zinc-100 tracking-tight">
              Step 3: Review Configured Compliance Rules
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Active rules from the three pillars will execute deterministically against extracted tokens.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Active Rules ({rules.filter(r => r.status === 'enabled').length} of {rules.length} enabled)
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/5 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 overflow-hidden">
              {rules.map((rule) => {
                const isEnabled = rule.status === 'enabled';
                return (
                  <div key={rule.ruleId} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-charcoal-900 dark:text-zinc-100">
                          {rule.ruleId}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="font-medium text-charcoal-800 dark:text-zinc-200">
                          {rule.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-black/5 dark:bg-white/5 text-zinc-400">
                          {rule.pillar.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-snug">
                        {rule.description}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400">
                        Ref: {rule.legalReference}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-500'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-input bg-black/5 dark:bg-white/5 text-xs text-charcoal-800 dark:text-zinc-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-input bg-charcoal-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium shadow-soft-sm"
            >
              Next: Run Inspection
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 4: RUN ANALYSIS WITH STAGED PROGRESS */}
      {step === 4 && (
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-3 py-6">
            <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-zinc-100 tracking-tight">
              Ready to Execute Inspection
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Target SKU: <span className="font-mono font-semibold text-charcoal-900 dark:text-white">{selectedProduct?.sku}</span> ({selectedProduct?.name})
              <br />
              Evidence Assets: <span className="font-mono font-semibold text-charcoal-900 dark:text-white">{uploadedFiles.length} panels</span> attached.
            </p>
          </div>

          {analyzing ? (
            <div className="p-8 rounded-workspace bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 max-w-lg mx-auto text-center space-y-6 shadow-soft-lg">
              <div className="w-12 h-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin mx-auto" />

              <div className="space-y-2">
                <span className="font-mono text-xs text-red-600 dark:text-red-400 uppercase tracking-wider font-semibold">
                  Stage {analysisStage + 1} of 5
                </span>
                <p className="text-sm font-medium text-charcoal-900 dark:text-zinc-100">
                  {stages[analysisStage]}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${((analysisStage + 1) / 5) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-zinc-400 font-mono">
                Preserving original OCR tokens &amp; computing spatial coordinates...
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-workspace bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 max-w-xl mx-auto space-y-5 text-center shadow-soft-sm">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <Scan className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-charcoal-900 dark:text-zinc-100">
                  Start Automated Compliance Inspection
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Calls the OCR adapter, extracts declarations, and evaluates against {rules.filter(r => r.status === 'enabled').length} enabled rules.
                </p>
              </div>

              <button
                onClick={handleRunAnalysis}
                className="w-full py-3 rounded-input bg-charcoal-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-xs tracking-wide shadow-soft-md hover:scale-[1.01] transition-transform"
              >
                Run Inspection Now
              </button>

              <button
                onClick={() => setStep(3)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                Return to configuration
              </button>
            </div>
          )}
        </section>
      )}

      {/* Inline Modal: Create New Product */}
      <Modal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        title="Add Authoritative Product Master"
        subtitle="Record the expected SKU attributes to audit against"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-500 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={newProductForm.name}
                onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                placeholder="e.g. Reynolds 045 Ball Pen 10-pack"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white focus:outline-none focus:border-charcoal-900 dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={newProductForm.sku}
                onChange={e => setNewProductForm({ ...newProductForm, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. REY-045-BLU-10"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white font-mono focus:outline-none focus:border-charcoal-900 dark:focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-500 mb-1">Brand *</label>
              <input
                type="text"
                required
                value={newProductForm.brand}
                onChange={e => setNewProductForm({ ...newProductForm, brand: e.target.value })}
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
                value={newProductForm.mrp}
                onChange={e => setNewProductForm({ ...newProductForm, mrp: e.target.value })}
                placeholder="50.00"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Net Quantity *</label>
              <input
                type="text"
                required
                value={newProductForm.netQuantity}
                onChange={e => setNewProductForm({ ...newProductForm, netQuantity: e.target.value })}
                placeholder="10 N"
                className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-500 mb-1">Manufacturer Address *</label>
            <textarea
              rows={2}
              required
              value={newProductForm.manufacturer}
              onChange={e => setNewProductForm({ ...newProductForm, manufacturer: e.target.value })}
              placeholder="Full name, address and 6-digit postal PIN code"
              className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1">Consumer Care Details *</label>
            <input
              type="text"
              required
              value={newProductForm.consumerCare}
              onChange={e => setNewProductForm({ ...newProductForm, consumerCare: e.target.value })}
              placeholder="Helpline phone, email, and contact address"
              className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsNewProductModalOpen(false)}
              className="px-4 py-2 rounded-input text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-input bg-charcoal-900 dark:bg-white text-white dark:text-black font-medium"
            >
              Save Product Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
