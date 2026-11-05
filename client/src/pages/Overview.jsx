import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ScanSearch, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Package, 
  ChevronRight,
  Sparkles,
  Plus,
  Play,
  RotateCw
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import StoryGuide from '../components/StoryGuide';
import DoubleLayerCard from '../components/DoubleLayerCard';

export default function Overview() {
  const navigate = useNavigate();
  const { addToast } = useSystem();
  const [inspections, setInspections] = useState([]);
  const [products, setProducts] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingQuickScan, setCreatingQuickScan] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [inspRes, prodRes, audRes] = await Promise.all([
          api.getInspections(),
          api.getProducts(),
          api.getAuditEvents()
        ]);
        setInspections(inspRes.data || []);
        setProducts(prodRes.data || []);
        setAuditEvents(audRes.data || []);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Quick 1-click test audit using seeded Reynolds pen packaging
  const handleQuickAuditDemo = async () => {
    setCreatingQuickScan(true);
    try {
      const penProduct = products.find(p => p.sku?.includes('REY')) || products[0];
      if (!penProduct) {
        addToast('No product available.', 'error');
        return;
      }
      const inspRes = await api.createInspection({
        productId: penProduct.id,
        samplePreset: 'pen'
      });
      // Run analysis immediately
      await api.runAnalysis(inspRes.data.id);
      addToast('Quick Audit complete! Inspect findings on packaging dieline.', 'success');
      navigate(`/inspections/${inspRes.data.id}`);
    } catch (err) {
      addToast(`Quick audit failed: ${err.message}`, 'error');
    } finally {
      setCreatingQuickScan(false);
    }
  };

  // Derive metrics strictly from stored data
  const totalInspections = inspections.length;
  const totalPotentialIssues = inspections.reduce((acc, i) => acc + (i.summary?.potentialIssues || 0), 0);
  const totalReviewRequired = inspections.reduce((acc, i) => acc + (i.summary?.reviewRequired || 0), 0);
  const pendingReviews = inspections.reduce((acc, i) => acc + (i.summary?.dispositionSummary?.pending || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-10 max-w-7xl mx-auto pb-16"
    >
      {/* Narrative Hero Banner with Vibrant Gradient Accent (Image 3 Inspiration) */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-palette-dark dark:bg-[#1E1D18] text-palette-sand shadow-soft-lg noisy-overlay">
        {/* Soft Multi-hue Glow Background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-bustd opacity-25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-[#38BDF8] opacity-15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-gradient-bustd shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            Legal Metrology &amp; SKU Master Verification
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight">
            Spot packaging red flags before they go to print.
          </h2>

          <p className="text-xs sm:text-sm text-palette-cream/80 leading-relaxed max-w-xl">
            BUSTD cross-examines packaging artwork against ERP master records and statutory Legal Metrology rules. Traceable, evidence-backed decision support for packaging QA teams.
          </p>

          {/* Quick Trigger Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/inspections/new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-bustd hover:opacity-95 shadow-glow-bustd transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Inspection</span>
            </button>

            <button
              onClick={handleQuickAuditDemo}
              disabled={creatingQuickScan}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-palette-sand bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{creatingQuickScan ? 'Analyzing Pen Artwork...' : 'Try 1-Click Pen Demo'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Storytelling Workflow Strip: Eliminates all knowledge gap */}
      <section>
        <StoryGuide onStartScan={handleQuickAuditDemo} />
      </section>

      {/* DOUBLE-LAYER QUICK ACTIONS (Reference 1 & 2 Inspiration) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-olive-500 dark:text-olive-400">
          <span>Inspection Actions</span>
          <span className="text-[11px] normal-case text-olive-400">Pre-seeded fixtures ready</span>
        </div>

        <DoubleLayerCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: New Inspection */}
            <div
              onClick={() => navigate('/inspections/new')}
              className="p-4 rounded-xl cursor-pointer bg-palette-dark text-palette-sand dark:bg-[#2A2922] hover:scale-[1.01] transition-transform group flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">
                  Start New Inspection
                </div>
                <p className="text-[11px] text-palette-cream/70 mt-0.5 leading-snug">
                  Upload multi-panel dielines &amp; run compliance scanner
                </p>
              </div>
            </div>

            {/* Action 2: 1-Click Pen Audit */}
            <div
              onClick={handleQuickAuditDemo}
              className="p-4 rounded-xl cursor-pointer bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors group flex items-start gap-3.5 border border-black/5 dark:border-white/5"
            >
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-palette-dark dark:text-palette-sand">
                    Reynolds Pen Audit
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-pink-500/15 text-pink-700 dark:text-pink-300">
                    Preset
                  </span>
                </div>
                <p className="text-[11px] text-olive-500 dark:text-olive-400 mt-0.5 leading-snug">
                  {creatingQuickScan ? 'Executing 5 analysis stages...' : 'Instant test with ₹10 mismatch & degraded text'}
                </p>
              </div>
            </div>

            {/* Action 3: SKU Master Catalog */}
            <div
              onClick={() => navigate('/products')}
              className="p-4 rounded-xl cursor-pointer bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors group flex items-start gap-3.5 border border-black/5 dark:border-white/5"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-palette-dark dark:text-palette-sand">
                  SKU Master Catalog
                </div>
                <p className="text-[11px] text-olive-500 dark:text-olive-400 mt-0.5 leading-snug">
                  {products.length} master product specifications configured
                </p>
              </div>
            </div>
          </div>
        </DoubleLayerCard>
      </section>

      {/* PLAIN 1D METRICS SECTION (No boxed borders around every number!) */}
      <section className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-olive-500 dark:text-olive-400">
          Metrology Summary Metrics
        </div>

        {/* 1D Grid: Pure typographic hierarchy with generous whitespace */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-olive-500 dark:text-olive-400">
              <span className="w-1.5 h-1.5 rounded-full bg-olive-400" />
              <span>Inspections Run</span>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-palette-dark dark:text-palette-sand">
              {totalInspections}
            </div>
            <p className="text-[11px] text-olive-500 dark:text-olive-400">
              Saved in current session
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>Potential Red Flags</span>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-red-600 dark:text-red-400">
              {totalPotentialIssues}
            </div>
            <p className="text-[11px] text-olive-500 dark:text-olive-400">
              Statutory mismatches found
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Review Required</span>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {totalReviewRequired}
            </div>
            <p className="text-[11px] text-olive-500 dark:text-olive-400">
              Degraded OCR confidence
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-palette-dark dark:text-palette-sand">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-bustd" />
              <span>Reviews Pending</span>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-palette-dark dark:text-palette-sand">
              {pendingReviews}
            </div>
            <p className="text-[11px] text-olive-500 dark:text-olive-400">
              Awaiting QA sign-off
            </p>
          </div>
        </div>
      </section>

      {/* COMPACT TRI-STATE EVALUATION PRINCIPLES (Plain 1D Flow) */}
      <section className="space-y-3 pt-2">
        <div className="text-xs font-mono uppercase tracking-wider text-olive-500 dark:text-olive-400">
          Inspection Evaluation Protocol
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <span className="font-semibold text-palette-dark dark:text-palette-sand">Potential Issue</span>
            </div>
            <p className="text-olive-500 dark:text-olive-400 text-[11px] leading-relaxed">
              Direct contradiction with SKU master or Legal Metrology rule (e.g. MRP ₹60 vs ₹50). Must be confirmed or dismissed with justification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span className="font-semibold text-palette-dark dark:text-palette-sand">Review Required</span>
            </div>
            <p className="text-olive-500 dark:text-olive-400 text-[11px] leading-relaxed">
              Degraded print quality, smudges, or OCR confidence &lt; 0.80. Missing text is never treated as absent unless confirmed by the auditor.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-palette-dark dark:text-palette-sand">No Issue Detected</span>
            </div>
            <p className="text-olive-500 dark:text-olive-400 text-[11px] leading-relaxed">
              Visible packaging declaration satisfies the statutory rule. Decision-support verification; not a blanket legal liability shield.
            </p>
          </div>
        </div>
      </section>

      {/* RECENT INSPECTIONS TABLE */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-olive-500 dark:text-olive-400">
            Recent Inspections ({inspections.length})
          </div>
          <Link
            to="/history"
            className="text-xs text-olive-600 dark:text-olive-300 hover:text-palette-dark dark:hover:text-palette-sand flex items-center gap-1 transition-colors font-medium"
          >
            <span>View All Records</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DoubleLayerCard innerClassName="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-olive-400">
              Loading inspection sessions...
            </div>
          ) : inspections.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <FileText className="w-8 h-8 mx-auto text-olive-300 dark:text-olive-600" />
              <p className="text-xs text-olive-500">No inspections stored yet.</p>
              <button
                onClick={() => navigate('/inspections/new')}
                className="px-4 py-2 text-xs rounded-xl bg-palette-dark text-palette-sand font-medium"
              >
                Create your first inspection
              </button>
            </div>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {inspections.slice(0, 5).map((insp) => {
                const issues = insp.summary?.potentialIssues || 0;
                const reviews = insp.summary?.reviewRequired || 0;
                const passed = insp.summary?.noIssueDetected || 0;

                return (
                  <div
                    key={insp.id}
                    onClick={() => navigate(`/inspections/${insp.id}`)}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-palette-dark dark:text-palette-sand group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {insp.id}
                        </span>
                        <span className="text-olive-400 text-xs">•</span>
                        <span className="text-xs font-medium text-palette-dark dark:text-palette-sand">
                          {insp.productSnapshot?.name || 'Packaged Product'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/5 dark:bg-white/5 text-olive-600 dark:text-olive-400">
                          {insp.productSnapshot?.sku}
                        </span>
                      </div>
                      <div className="text-[11px] text-olive-500 dark:text-olive-400 flex items-center gap-3">
                        <span>{new Date(insp.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{insp.assets?.length || 0} artwork panels</span>
                        <span>•</span>
                        <span className="capitalize">{insp.status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {issues > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {issues} {issues === 1 ? 'issue' : 'issues'}
                        </span>
                      )}
                      {reviews > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {reviews} review
                        </span>
                      )}
                      {issues === 0 && reviews === 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Passed
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-olive-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DoubleLayerCard>
      </section>
    </motion.div>
  );
}
