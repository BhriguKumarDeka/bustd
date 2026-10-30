import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ScanSearch, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Package, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Plus,
  Play
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';

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
      const analyzeRes = await api.runAnalysis(inspRes.data.id);
      addToast('Quick Audit complete! Inspect findings on packaging dieline.', 'success');
      navigate(`/inspections/${inspRes.data.id}`);
    } catch (err) {
      addToast(`Quick audit failed: ${err.message}`, 'error');
    } finally {
      setCreatingQuickScan(false);
    }
  };

  // Compute metrics strictly from stored data
  const totalInspections = inspections.length;
  const totalPotentialIssues = inspections.reduce((acc, i) => acc + (i.summary?.potentialIssues || 0), 0);
  const totalReviewRequired = inspections.reduce((acc, i) => acc + (i.summary?.reviewRequired || 0), 0);
  const pendingReviews = inspections.reduce((acc, i) => acc + (i.summary?.dispositionSummary?.pending || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Editorial Hero Statement */}
      <section className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-palette-cream/20 dark:bg-palette-dark border border-palette-cream/30 text-palette-dark dark:text-palette-cream text-xs font-mono font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] shadow-[0_0_8px_#84CC16]" />
          Pre-Production Legal Metrology &amp; SKU Master Audit
        </div>
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-palette-dark dark:text-palette-sand">
          Spot the red flags in packaging dielines before they go to print.
        </h2>
        <p className="text-xs sm:text-sm text-olive-500 dark:text-olive-300 max-w-2xl leading-relaxed">
          BUSTD cross-validates packaging declarations simultaneously across SKU master records, brand guidelines, and statutory Legal Metrology rules. Every finding is anchored to visible spatial evidence.
        </p>
      </section>

      {/* QUICK START SECTION (Inspired by SmartShort Reference UI) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-olive-500 dark:text-olive-400">
          <span>Quick Start Actions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary Quick Start Card (+ Text to Video style in SmartShort) */}
          <div
            onClick={() => navigate('/inspections/new')}
            className="p-5 rounded-card-lg bg-palette-dark text-palette-sand dark:bg-[#25241E] dark:text-palette-sand border border-palette-cream/15 cursor-pointer shadow-soft-md hover:shadow-soft-lg hover:scale-[1.01] transition-surface group relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-control bg-palette-sand/10 dark:bg-palette-sand/10 text-palette-sand flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-palette-sand tracking-tight">
                  Start New Inspection
                </h3>
                <p className="text-[11px] text-palette-cream/80 leading-snug mt-0.5">
                  Multi-panel dieline upload &amp; scanner
                </p>
              </div>
            </div>
            {/* Subtle glow accent */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#84CC16]/10 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Quick 1-Click Demo Audit */}
          <div
            onClick={handleQuickAuditDemo}
            className="p-5 rounded-card-lg bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 cursor-pointer shadow-soft-sm hover:shadow-soft-md hover:border-palette-cream/40 transition-surface group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-control bg-palette-cream/30 dark:bg-palette-dark text-palette-dark dark:text-palette-cream flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-palette-dark dark:text-palette-sand truncate">
                    1-Click Pen Audit
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-palette-cream/30 text-palette-dark dark:text-palette-cream font-bold">
                    Preset
                  </span>
                </div>
                <p className="text-[11px] text-olive-500 dark:text-olive-400 leading-snug mt-0.5 truncate">
                  {creatingQuickScan ? 'Analyzing dielines...' : 'Audit Reynolds 045 test dielines'}
                </p>
              </div>
            </div>
          </div>

          {/* Manage SKU Catalog */}
          <div
            onClick={() => navigate('/products')}
            className="p-5 rounded-card-lg bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 cursor-pointer shadow-soft-sm hover:shadow-soft-md hover:border-palette-cream/40 transition-surface group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-control bg-black/5 dark:bg-white/5 text-palette-dark dark:text-palette-sand flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-palette-dark dark:text-palette-sand">
                  SKU Master Catalog
                </h3>
                <p className="text-[11px] text-olive-500 dark:text-olive-400 leading-snug mt-0.5">
                  {products.length} master products registered
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLUTTERLESS METRIC SUMMARY PILLS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 shadow-soft-sm">
          <div className="flex items-center justify-between text-olive-500 dark:text-olive-400 text-xs mb-1">
            <span>Inspections Run</span>
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-mono font-semibold text-palette-dark dark:text-palette-sand">
            {totalInspections}
          </div>
          <p className="text-[11px] text-olive-500 dark:text-olive-400 mt-0.5">
            Persisted in session
          </p>
        </div>

        <div className="p-4 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 shadow-soft-sm">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400 text-xs mb-1">
            <span>Potential Red Flags</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-mono font-semibold text-red-600 dark:text-red-400">
            {totalPotentialIssues}
          </div>
          <p className="text-[11px] text-olive-500 dark:text-olive-400 mt-0.5">
            Mismatches flagged
          </p>
        </div>

        <div className="p-4 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 shadow-soft-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs mb-1">
            <span>Reviews Required</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-mono font-semibold text-amber-600 dark:text-amber-400">
            {totalReviewRequired}
          </div>
          <p className="text-[11px] text-olive-500 dark:text-olive-400 mt-0.5">
            Degraded OCR text
          </p>
        </div>

        <div className="p-4 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 shadow-soft-sm">
          <div className="flex items-center justify-between text-olive-500 dark:text-olive-400 text-xs mb-1">
            <span>Reviews Pending</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-mono font-semibold text-palette-dark dark:text-palette-sand">
            {pendingReviews}
          </div>
          <p className="text-[11px] text-olive-500 dark:text-olive-400 mt-0.5">
            Awaiting human sign-off
          </p>
        </div>
      </section>

      {/* COMPACT OUTCOME PRINCIPLES */}
      <section className="p-4 rounded-panel bg-raised-light dark:bg-raised-dark border border-black/5 dark:border-white/5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-olive-500 dark:text-olive-400 mb-2.5">
          Tri-State Evaluation Protocol
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-control bg-white dark:bg-[#1C1B17] border border-black/5 dark:border-white/5">
            <span className="w-2.5 h-2.5 mt-0.5 rounded-full bg-red-500 shrink-0" />
            <div>
              <div className="font-semibold text-palette-dark dark:text-palette-sand">Potential Issue</div>
              <p className="text-olive-500 dark:text-olive-400 mt-0.5 leading-relaxed text-[11px]">
                Statutory violation or SKU master contradiction detected (e.g. MRP ₹60 vs ₹50). Requires confirmation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-control bg-white dark:bg-[#1C1B17] border border-black/5 dark:border-white/5">
            <span className="w-2.5 h-2.5 mt-0.5 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="font-semibold text-palette-dark dark:text-palette-sand">Review Required</div>
              <p className="text-olive-500 dark:text-olive-400 mt-0.5 leading-relaxed text-[11px]">
                Low OCR confidence (&lt;0.80), glare, or smudged print. Absence is never assumed from missing text.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-control bg-white dark:bg-[#1C1B17] border border-black/5 dark:border-white/5">
            <span className="w-2.5 h-2.5 mt-0.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="font-semibold text-palette-dark dark:text-palette-sand">No Issue Detected</div>
              <p className="text-olive-500 dark:text-olive-400 mt-0.5 leading-relaxed text-[11px]">
                Available evidence deterministically satisfies the evaluated rule. Not a blanket legal immunity claim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT INSPECTIONS & AUDIT FEED (PROGRESSIVE SPLIT) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Inspections (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-olive-500 dark:text-olive-400">
              Recent Inspection Sessions
            </h3>
            <Link
              to="/history"
              className="text-xs text-olive-600 dark:text-olive-300 hover:text-palette-dark dark:hover:text-palette-sand flex items-center gap-1 transition-colors"
            >
              View all ({inspections.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 overflow-hidden shadow-soft-sm">
            {loading ? (
              <div className="p-8 text-center text-xs text-olive-400">Loading inspection records...</div>
            ) : inspections.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <FileText className="w-8 h-8 mx-auto text-olive-300 dark:text-olive-600" />
                <p className="text-xs text-olive-500">No inspections recorded yet.</p>
                <button
                  onClick={() => navigate('/inspections/new')}
                  className="px-3.5 py-1.5 text-xs rounded-control bg-palette-dark dark:bg-palette-sand text-palette-sand dark:text-palette-dark font-medium"
                >
                  Create first inspection
                </button>
              </div>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {inspections.slice(0, 5).map((insp) => {
                  const issues = insp.summary?.potentialIssues || 0;
                  const reviews = insp.summary?.reviewRequired || 0;

                  return (
                    <div
                      key={insp.id}
                      onClick={() => navigate(`/inspections/${insp.id}`)}
                      className="p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-palette-dark dark:text-palette-sand">
                            {insp.inspectionNumber}
                          </span>
                          <span className="text-olive-300 dark:text-olive-600">•</span>
                          <span className="text-xs font-medium text-palette-dark dark:text-palette-sand truncate">
                            {insp.productSnapshot?.name || 'Packaged Commodity'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-olive-500 dark:text-olive-400 font-mono">
                          <span>SKU: {insp.productSnapshot?.sku || 'N/A'}</span>
                          <span>•</span>
                          <span>{new Date(insp.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {issues > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {issues} {issues === 1 ? 'Red Flag' : 'Red Flags'}
                          </span>
                        ) : reviews > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {reviews} Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Clean Pass
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-olive-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Append-Only Audit Feed (1 Col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-olive-500 dark:text-olive-400">
              Audit Event Feed
            </h3>
            <span className="text-[10px] font-mono text-olive-400">Append-only</span>
          </div>

          <div className="p-4 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 space-y-3 max-h-[380px] overflow-y-auto shadow-soft-sm">
            {auditEvents.length === 0 ? (
              <p className="text-xs text-olive-400 py-4 text-center">No recent audit logs.</p>
            ) : (
              auditEvents.slice(0, 6).map((ev) => (
                <div key={ev.id} className="text-xs space-y-1 pb-2.5 border-b border-black/5 dark:border-white/5 last:border-none last:pb-0">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-semibold text-palette-dark dark:text-palette-sand">
                      {ev.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-olive-400 font-mono text-[10px]">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-olive-500 dark:text-olive-400">
                    By {ev.actor?.name || 'Inspector'}
                  </p>
                  {ev.metadata?.note && (
                    <p className="text-[11px] text-palette-dark dark:text-palette-sand italic bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                      "{ev.metadata.note}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </section>

    </div>
  );
}
