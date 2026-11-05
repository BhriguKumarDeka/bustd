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
  Box
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import StoryGuide from '../components/StoryGuide';
import DoubleLayerCard from '../components/DoubleLayerCard';
import Surface from '../components/ui/Surface';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Overview() {
  const navigate = useNavigate();
  const { addToast } = useSystem();
  const [inspections, setInspections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingQuickScan, setCreatingQuickScan] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [inspRes, prodRes] = await Promise.all([
          api.getInspections(),
          api.getProducts()
        ]);
        setInspections(inspRes.data || []);
        setProducts(prodRes.data || []);
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
        samplePreset: 'pen',
        packFormat: 'Tuck-End Carton'
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
      {/* Narrative Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-9 bg-neutral-900 text-white shadow-soft-lg noisy-overlay border border-neutral-800">
        {/* Soft Multi-hue Glow Background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-bustd opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3.5">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight">
            Spot packaging red flags before they go to print.
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
            BUSTD cross-examines packaging artwork against ERP master records and statutory declarations. Pre-configured 3D pack format dielines provide structured, evidence-backed inspection.
          </p>

          {/* Quick Trigger Buttons with Shimmer on Hover */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="gradient"
              icon={Plus}
              onClick={() => navigate('/inspections/new')}
            >
              Start New Inspection
            </Button>

            <Button
              variant="subtle"
              icon={Play}
              disabled={creatingQuickScan}
              onClick={handleQuickAuditDemo}
              className="text-white bg-white/10 hover:bg-white/15 border border-subtle"
            >
              {creatingQuickScan ? 'Analyzing Pen Artwork...' : 'Try 1-Click Pen Demo'}
            </Button>
          </div>
        </div>
      </section>

      {/* Storytelling Workflow Strip: 5 Stages including Pack Format */}
      <section>
        <StoryGuide onStartScan={handleQuickAuditDemo} />
      </section>

      {/* DOUBLE-LAYER QUICK ACTIONS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted">
          <span>Inspection Actions</span>
          <span className="text-[11px] normal-case text-muted">Pre-seeded fixtures ready</span>
        </div>

        <DoubleLayerCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: New Inspection */}
            <div
              onClick={() => navigate('/inspections/new')}
              className="p-4 rounded-xl cursor-pointer bg-neutral-900 text-white hover:scale-[1.01] transition-transform group flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">
                  Start New Inspection
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                  Choose pack format template &amp; scan packaging panels
                </p>
              </div>
            </div>

            {/* Action 2: 1-Click Pen Audit */}
            <div
              onClick={handleQuickAuditDemo}
              className="p-4 rounded-xl cursor-pointer bg-surface-subtle hover:bg-surface-interactive transition-colors group flex items-start gap-3.5 border border-subtle"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-primary">
                    Reynolds Pen Audit
                  </span>
                  <Badge variant="accent" size="sm">
                    Preset
                  </Badge>
                </div>
                <p className="text-[11px] text-secondary mt-0.5 leading-snug">
                  {creatingQuickScan ? 'Executing 5 analysis stages...' : 'Instant test with ₹10 mismatch & degraded text'}
                </p>
              </div>
            </div>

            {/* Action 3: SKU Master Catalog */}
            <div
              onClick={() => navigate('/products')}
              className="p-4 rounded-xl cursor-pointer bg-surface-subtle hover:bg-surface-interactive transition-colors group flex items-start gap-3.5 border border-subtle"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-primary">
                  SKU Master Catalog
                </div>
                <p className="text-[11px] text-secondary mt-0.5 leading-snug">
                  {products.length} master product specifications configured
                </p>
              </div>
            </div>
          </div>
        </DoubleLayerCard>
      </section>

      {/* PLAIN 1D METRICS SECTION */}
      <section className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-muted">
          Metrology Summary Metrics
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              <span>Inspections Run</span>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-primary">
              {totalInspections}
            </div>
            <p className="text-[11px] text-muted">
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
            <p className="text-[11px] text-muted">
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
            <p className="text-[11px] text-muted">
              Degraded OCR confidence
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-bustd" />
              <span>Reviews Pending</span>
            </div>
            <div className="text-3xl font-mono font-bold tracking-tight text-primary">
              {pendingReviews}
            </div>
            <p className="text-[11px] text-muted">
              Awaiting QA sign-off
            </p>
          </div>
        </div>
      </section>

      {/* COMPACT TRI-STATE EVALUATION PRINCIPLES */}
      <section className="space-y-3 pt-2">
        <div className="text-xs font-mono uppercase tracking-wider text-muted">
          Inspection Evaluation Protocol
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <Surface variant="default" className="p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <span className="font-semibold text-primary">Potential Issue</span>
            </div>
            <p className="text-secondary text-[11px] leading-relaxed">
              Direct contradiction with SKU master or statutory rule (e.g. MRP ₹60 vs ₹50). Must be confirmed or dismissed with justification.
            </p>
          </Surface>

          <Surface variant="default" className="p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span className="font-semibold text-primary">Review Required</span>
            </div>
            <p className="text-secondary text-[11px] leading-relaxed">
              Degraded print quality, smudges, or OCR confidence &lt; 0.80. Missing text is never treated as absent unless confirmed by the auditor.
            </p>
          </Surface>

          <Surface variant="default" className="p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-primary">No Issue Detected</span>
            </div>
            <p className="text-secondary text-[11px] leading-relaxed">
              Visible packaging declaration satisfies the statutory rule. Decision-support verification; not a blanket legal liability shield.
            </p>
          </Surface>
        </div>
      </section>

      {/* RECENT INSPECTIONS TABLE */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-muted">
            Recent Inspections ({inspections.length})
          </div>
          <Link
            to="/history"
            className="text-xs text-secondary hover:text-primary flex items-center gap-1 transition-colors font-medium"
          >
            <span>View All Records</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DoubleLayerCard innerClassName="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              Loading inspection sessions...
            </div>
          ) : inspections.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <FileText className="w-8 h-8 mx-auto text-muted" />
              <p className="text-xs text-muted">No inspections stored yet.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/inspections/new')}
              >
                Create your first inspection
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-subtle">
              {inspections.slice(0, 5).map((insp) => {
                const issues = insp.summary?.potentialIssues || 0;
                const reviews = insp.summary?.reviewRequired || 0;

                return (
                  <div
                    key={insp.id}
                    onClick={() => navigate(`/inspections/${insp.id}`)}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-subtle cursor-pointer transition-colors group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {insp.id}
                        </span>
                        <span className="text-muted text-xs">•</span>
                        <span className="text-xs font-medium text-primary">
                          {insp.productSnapshot?.name || 'Packaged Product'}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {insp.productSnapshot?.sku}
                        </Badge>
                        {insp.packFormat && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            {insp.packFormat}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-3">
                        <span>{new Date(insp.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{insp.assets?.length || 0} artwork panels</span>
                        <span>•</span>
                        <span className="capitalize">{insp.status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {issues > 0 && (
                        <Badge variant="issue" size="sm">
                          {issues} {issues === 1 ? 'issue' : 'issues'}
                        </Badge>
                      )}
                      {reviews > 0 && (
                        <Badge variant="review" size="sm">
                          {reviews} review
                        </Badge>
                      )}
                      {issues === 0 && reviews === 0 && (
                        <Badge variant="pass" size="sm">
                          Passed
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted group-hover:translate-x-0.5 transition-transform" />
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
