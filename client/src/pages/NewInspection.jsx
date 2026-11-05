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
import Surface from '../components/ui/Surface';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
    const files = Array.from(e.target.files);
    if (!files.length || !inspection) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('artwork', file);
      formData.append('panel', panelType);

      try {
        setLoading(true);
        const res = await api.uploadAsset(inspection.id, formData);
        setUploadedFiles(prev => [...prev, res.data]);
        addToast(`Uploaded ${file.name} as ${panelType} panel`, 'success');
      } catch (err) {
        addToast(`Failed to upload ${file.name}: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Step 3: Load sample assets
  const handleLoadSampleAssets = async () => {
    if (!inspection) return;
    setLoading(true);
    try {
      const res = await api.loadPreset(inspection.id, 'pen');
      setUploadedFiles(res.data.assets || []);
      addToast('Loaded seeded pen packaging dieline assets.', 'success');
    } catch (err) {
      addToast(`Failed to load preset assets: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Remove asset
  const handleRemoveAsset = async (assetId) => {
    if (!inspection) return;
    try {
      await api.deleteAsset(inspection.id, assetId);
      setUploadedFiles(prev => prev.filter(a => a.assetId !== assetId));
      addToast('Packaging panel removed.', 'info');
    } catch (err) {
      addToast(`Failed to remove asset: ${err.message}`, 'error');
    }
  };

  // Step 5: Execute real analysis workflow with staged progress
  const handleRunAnalysis = async () => {
    if (!inspection) return;
    setAnalyzing(true);
    setAnalysisStage(0);

    const interval = setInterval(() => {
      setAnalysisStage(prev => {
        if (prev < 4) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 650);

    try {
      await api.runAnalysis(inspection.id);
      setTimeout(() => {
        clearInterval(interval);
        addToast('Inspection scan complete! Redirecting to Evidence Viewer...', 'success');
        navigate(`/inspections/${inspection.id}`);
      }, 3400);
    } catch (err) {
      clearInterval(interval);
      setAnalyzing(false);
      addToast(`Analysis run failed: ${err.message}`, 'error');
    }
  };

  // Create inline product baseline
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createProduct({
        ...newProductForm,
        mrp: parseFloat(newProductForm.mrp)
      });
      addToast('Product baseline registered.', 'success');
      setProducts(prev => [res.data, ...prev]);
      setSelectedProductId(res.data.id);
      setIsNewProductModalOpen(false);
    } catch (err) {
      addToast(`Failed to save product: ${err.message}`, 'error');
    }
  };

  const stepsList = [
    { num: 1, title: 'Product Master' },
    { num: 2, title: 'Pack Format' },
    { num: 3, title: 'Artwork Ingestion' },
    { num: 4, title: 'Rule Set' },
    { num: 5, title: 'Execute Scan' }
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
                        ? 'tactile-active-nav font-bold shadow-sm'
                        : 'bg-surface-subtle text-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isActive
                        ? 'text-primary font-semibold'
                        : isCompleted
                        ? 'text-secondary'
                        : 'text-muted'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 transition-colors ${
                      isCompleted ? 'bg-gradient-bustd' : 'bg-surface-interactive'
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
              <h2 className="text-lg sm:text-xl font-semibold text-primary tracking-tight">
                1. Select Product Specification Baseline
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Declarations on packaging artwork will be audited against this ERP master record.
              </p>
            </div>
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => setIsNewProductModalOpen(true)}
              className="self-start sm:self-auto"
            >
              New Product Spec
            </Button>
          </div>

          {/* Product Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => {
              const isSelected = selectedProductId === p.id;
              return (
                <Surface
                  key={p.id}
                  variant="interactive"
                  onClick={() => setSelectedProductId(p.id)}
                  className={`p-4 text-xs space-y-2.5 ${
                    isSelected ? 'ring-2 ring-pink-500/40 border-pink-500/50 shadow-soft-md' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-primary">
                      {p.sku}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {p.brand}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-secondary mt-0.5 line-clamp-1">
                      {p.category}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-subtle grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-muted block text-[10px]">Declared MRP</span>
                      <span className="font-bold text-primary">₹{Number(p.mrp).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px]">Net Quantity</span>
                      <span className="font-bold text-primary">{p.netQuantity}</span>
                    </div>
                  </div>
                </Surface>
              );
            })}
          </div>

          {/* Selected Product Master Details in Double Layer Shell */}
          {selectedProduct && (
            <DoubleLayerCard
              header={
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  Master Baseline Specifications
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-muted block uppercase font-mono">Manufacturer</span>
                  <p className="font-medium text-primary mt-0.5 leading-snug">
                    {selectedProduct.manufacturer}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted block uppercase font-mono">Country of Origin</span>
                  <p className="font-medium text-primary mt-0.5 leading-snug">
                    {selectedProduct.countryOfOrigin}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-muted block uppercase font-mono">Consumer Care Declaration</span>
                  <p className="font-medium text-primary mt-0.5 leading-snug">
                    {selectedProduct.consumerCare}
                  </p>
                </div>
              </div>
            </DoubleLayerCard>
          )}

          <div className="flex justify-end pt-2">
            <Button
              variant="gradient"
              icon={ArrowRight}
              disabled={loading || !selectedProduct}
              onClick={handleProceedFromProduct}
            >
              {loading ? 'Initializing Session...' : 'Next: Choose Pack Format'}
            </Button>
          </div>
        </motion.section>
      )}

      {/* STEP 2: PACK FORMAT TEMPLATE */}
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
              <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                What type of pack is this?
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Selecting the packaging structure helps the AI localize label directions, panel boundaries, and aspect ratios automatically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted">
                Active: <span className="text-primary font-semibold">{selectedPackFormat?.name}</span>
              </span>
            </div>
          </div>

          {/* Interactive Pack Format Template Grid */}
          <PackFormatSelector
            selectedFormatId={selectedPackFormat?.id}
            onSelectFormat={(format) => setSelectedPackFormat(format)}
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => setStep(1)}
            >
              Back
            </Button>

            <Button
              variant="gradient"
              icon={ArrowRight}
              onClick={handleProceedFromFormat}
            >
              Next: Upload Artwork Proofs
            </Button>
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
              <h2 className="text-lg sm:text-xl font-semibold text-primary tracking-tight">
                3. Ingest Packaging Artwork Panels
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Template: <span className="font-semibold text-primary">{selectedPackFormat?.name}</span> • Ingests {selectedPackFormat?.panels.join(', ')}
              </p>
            </div>

            <Button
              variant="secondary"
              icon={Sparkles}
              disabled={loading}
              onClick={handleLoadSampleAssets}
              className="self-start sm:self-auto"
            >
              Load Seeded Pen Dielines
            </Button>
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
              <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center mx-auto text-secondary">
                <Upload className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-primary">
                  Drag and drop packaging artwork proofs or select files
                </h3>
                <p className="text-xs text-muted">
                  Accepts PNG, JPG, JPEG, and PDF (Max 25MB). Actual artwork is used as inspection evidence.
                </p>
              </div>

              {/* Panel Assignment Pills */}
              <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface-subtle text-xs border border-subtle">
                <span className="text-secondary px-2 font-mono text-[11px]">Assign Panel:</span>
                {['back', 'front', 'side'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPanelType(p)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                      panelType === p
                        ? 'tactile-active-nav font-semibold shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    {p === 'back' ? 'Back (Declarations)' : p === 'front' ? 'Front (PDP)' : 'Side'}
                  </button>
                ))}
              </div>

              <div>
                <label className="btn-shimmer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-btn text-xs font-semibold cursor-pointer shadow-sm active:scale-[0.98]">
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
              <div className="text-xs font-mono uppercase tracking-wider text-muted">
                Attached Artwork Panels ({uploadedFiles.length})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedFiles.map((asset) => {
                  const panelLabel = asset.panel || asset.panelType || 'artwork';
                  return (
                    <Surface
                      key={asset.assetId}
                      variant="default"
                      className="p-3 space-y-2.5 shadow-soft-sm group relative"
                    >
                      <div className="aspect-[4/3] rounded-xl bg-surface-subtle overflow-hidden relative border border-subtle flex items-center justify-center">
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
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface-overlay border border-subtle hover:bg-red-600 hover:text-white text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          title="Remove panel"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-primary truncate max-w-[140px]">
                          {asset.originalFilename}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {panelLabel}
                        </Badge>
                      </div>
                    </Surface>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => setStep(2)}
            >
              Back
            </Button>

            <Button
              variant="gradient"
              icon={ArrowRight}
              disabled={uploadedFiles.length === 0}
              onClick={() => setStep(4)}
            >
              Next: Review Active Rules
            </Button>
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
            <h2 className="text-lg sm:text-xl font-semibold text-primary tracking-tight">
              4. Review Configured Statutory Compliance Rules
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              These deterministic rules will execute against detected packaging tokens on your {selectedPackFormat?.name}.
            </p>
          </div>

          <DoubleLayerCard innerClassName="p-0 overflow-hidden">
            <div className="divide-y divide-subtle">
              {rules.map((rule) => {
                const isEnabled = rule.status === 'enabled';
                return (
                  <div key={rule.ruleId} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">
                          {rule.ruleId}
                        </span>
                        <span className="text-muted">•</span>
                        <span className="font-semibold text-primary">
                          {rule.name}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {rule.pillar.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-secondary text-[11px] leading-snug">
                        {rule.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Badge variant={isEnabled ? 'pass' : 'neutral'} size="sm">
                        {rule.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </DoubleLayerCard>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => setStep(3)}
            >
              Back
            </Button>

            <Button
              variant="gradient"
              icon={ArrowRight}
              onClick={() => setStep(5)}
            >
              Next: Execute Inspection
            </Button>
          </div>
        </motion.section>
      )}

      {/* STEP 5: RUN ANALYSIS */}
      {step === 5 && (
        <motion.section 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center max-w-xl mx-auto space-y-2 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              Ready to Execute Inspection Scan
            </h2>
            <p className="text-xs text-secondary leading-relaxed">
              Target SKU: <span className="font-mono font-bold text-primary">{selectedProduct?.sku}</span> ({selectedProduct?.name})
              <br />
              Pack Format: <span className="font-semibold text-pink-600 dark:text-pink-400">{selectedPackFormat?.name}</span> • <span className="font-mono font-bold text-primary">{uploadedFiles.length} panels</span> attached.
            </p>
          </div>

          {analyzing ? (
            <DoubleLayerCard className="max-w-md mx-auto" innerClassName="text-center space-y-6 py-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-bustd flex items-center justify-center text-white mx-auto shadow-glow-bustd animate-pulse">
                <Scan className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-xs text-gradient-bustd uppercase tracking-wider font-bold">
                  Stage {analysisStage + 1} of 5
                </span>
                <p className="text-xs sm:text-sm font-semibold text-primary">
                  {stages[analysisStage]}
                </p>
              </div>

              {/* Fluid Gradient Progress Bar with Animated Shimmer Sweep */}
              <div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden relative border border-subtle">
                <motion.div
                  className="bg-gradient-bustd h-full rounded-full relative overflow-hidden progress-bar-shimmer"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((analysisStage + 1) / 5) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <p className="text-[11px] text-muted font-mono">
                Preserving original OCR tokens &amp; computing spatial coordinates...
              </p>
            </DoubleLayerCard>
          ) : (
            <DoubleLayerCard className="max-w-lg mx-auto" innerClassName="text-center space-y-5 py-6">
              <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-primary flex items-center justify-center mx-auto border border-subtle">
                <Scan className="w-6 h-6" />
              </div>

              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-semibold text-primary">
                  All Inputs &amp; Templates Validated
                </h3>
                <p className="text-xs text-secondary">
                  Click below to trigger OCR token extraction, field mapping, and deterministic rule evaluation.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="gradient"
                  icon={Sparkles}
                  size="lg"
                  onClick={handleRunAnalysis}
                >
                  Run Inspection Scan
                </Button>
              </div>
            </DoubleLayerCard>
          )}

          {!analyzing && (
            <div className="flex justify-start">
              <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => setStep(4)}
              >
                Back
              </Button>
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
            <label className="block text-secondary mb-1 font-mono text-[11px]">Product Name *</label>
            <input
              type="text"
              required
              value={newProductForm.name}
              onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
              placeholder="e.g. Reynolds 045 Fine Carbure Ball Pen (Blue)"
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-secondary mb-1 font-mono text-[11px]">SKU Identifier *</label>
              <input
                type="text"
                required
                value={newProductForm.sku}
                onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                placeholder="e.g. REY-045-BLU-10"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-secondary mb-1 font-mono text-[11px]">Brand Name *</label>
              <input
                type="text"
                required
                value={newProductForm.brand}
                onChange={(e) => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                placeholder="e.g. Reynolds"
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
                value={newProductForm.mrp}
                onChange={(e) => setNewProductForm({ ...newProductForm, mrp: e.target.value })}
                placeholder="50.00"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-secondary mb-1 font-mono text-[11px]">Declared Net Quantity *</label>
              <input
                type="text"
                required
                value={newProductForm.netQuantity}
                onChange={(e) => setNewProductForm({ ...newProductForm, netQuantity: e.target.value })}
                placeholder="10 N (Pens)"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-secondary mb-1 font-mono text-[11px]">Manufacturer &amp; Address *</label>
            <textarea
              rows={2}
              required
              value={newProductForm.manufacturer}
              onChange={(e) => setNewProductForm({ ...newProductForm, manufacturer: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary focus:outline-none focus:border-pink-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsNewProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              type="submit"
            >
              Save Product Master
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
