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
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function Overview() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [products, setProducts] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Compute metrics strictly from stored data
  const totalInspections = inspections.length;
  const totalPotentialIssues = inspections.reduce((acc, i) => acc + (i.summary?.potentialIssues || 0), 0);
  const totalReviewRequired = inspections.reduce((acc, i) => acc + (i.summary?.reviewRequired || 0), 0);
  const pendingReviews = inspections.reduce((acc, i) => acc + (i.summary?.dispositionSummary?.pending || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Editorial Hero Action Banner */}
      <section className="relative overflow-hidden rounded-workspace bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 p-6 sm:p-8 shadow-soft-sm">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-control bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Decision-Support Screening Engine
          </div>

          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-charcoal-900 dark:text-zinc-100">
            Spot the red flags in packaging dielines before they go to print.
          </h2>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            BUSTD cross-validates packaging declarations simultaneously across SKU master records, corporate brand guidelines, and statutory Legal Metrology rules. Every finding is anchored to visible spatial evidence.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/inspections/new')}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-input bg-charcoal-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium tracking-wide shadow-soft-md hover:shadow-soft-lg transition-surface"
            >
              <ScanSearch className="w-4 h-4" />
              Start New Inspection
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-input bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-charcoal-800 dark:text-zinc-200 text-xs font-medium transition-surface"
            >
              <Package className="w-3.5 h-3.5" />
              Manage Products ({products.length})
            </Link>
          </div>
        </div>

        {/* Subtle decorative background graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-5 dark:opacity-10 flex items-center justify-center overflow-hidden">
          <ScanSearch className="w-80 h-80 -mr-16 text-charcoal-900 dark:text-white" strokeWidth={1} />
        </div>
      </section>

      {/* Derived Summary Metrics (No fake analytics) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs mb-1.5">
            <span>Inspections Run</span>
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-mono font-semibold text-charcoal-900 dark:text-zinc-100">
            {totalInspections}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
            Persisted in current session
          </p>
        </div>

        <div className="p-4 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between text-red-500 text-xs mb-1.5">
            <span>Potential Issues</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-mono font-semibold text-red-600 dark:text-red-400">
            {totalPotentialIssues}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
            Red flags flagged by engine
          </p>
        </div>

        <div className="p-4 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between text-amber-500 text-xs mb-1.5">
            <span>Reviews Required</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-mono font-semibold text-amber-600 dark:text-amber-400">
            {totalReviewRequired}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
            Ambiguous or degraded text
          </p>
        </div>

        <div className="p-4 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs mb-1.5">
            <span>Human Sign-Offs Pending</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-mono font-semibold text-charcoal-900 dark:text-zinc-100">
            {pendingReviews}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
            Awaiting inspector action
          </p>
        </div>
      </section>

      {/* Compact explanation of the three possible outcomes */}
      <section className="p-5 rounded-panel bg-raised-light dark:bg-raised-dark border border-black/5 dark:border-white/5">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
          Inspection Outcome Principles
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-control bg-white dark:bg-[#101010] border border-black/5 dark:border-white/5">
            <span className="w-2.5 h-2.5 mt-0.5 rounded-full bg-red-500 shrink-0" />
            <div>
              <div className="font-semibold text-charcoal-900 dark:text-zinc-200">Potential Issue</div>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Evidence triggers an active rule (e.g. price mismatch or missing tax clause). Requires human reviewer confirmation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-control bg-white dark:bg-[#101010] border border-black/5 dark:border-white/5">
            <span className="w-2.5 h-2.5 mt-0.5 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="font-semibold text-charcoal-900 dark:text-zinc-200">Review Required</div>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Image quality, low OCR confidence (&lt;0.80), or ambiguous mapping. Missing OCR text is never assumed to be absent.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-control bg-white dark:bg-[#101010] border border-black/5 dark:border-white/5">
            <span className="w-2.5 h-2.5 mt-0.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="font-semibold text-charcoal-900 dark:text-zinc-200">No Issue Detected</div>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Available evidence satisfies the specific evaluated rule. Does not claim universal legal immunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Recent Inspections & Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Inspections Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-charcoal-900 dark:text-zinc-200">
              Recent Inspections
            </h3>
            <Link
              to="/history"
              className="text-xs text-zinc-500 hover:text-charcoal-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              View all ({inspections.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-400">Loading inspection records...</div>
            ) : inspections.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <FileText className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
                <p className="text-xs text-zinc-500">No inspections recorded yet.</p>
                <button
                  onClick={() => navigate('/inspections/new')}
                  className="px-3 py-1.5 text-xs rounded-control bg-charcoal-900 text-white font-medium"
                >
                  Create first inspection
                </button>
              </div>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {inspections.slice(0, 5).map((insp) => {
                  const issues = insp.summary?.potentialIssues || 0;
                  const reviews = insp.summary?.reviewRequired || 0;
                  const isClean = issues === 0 && reviews === 0;

                  return (
                    <div
                      key={insp.id}
                      onClick={() => navigate(`/inspections/${insp.id}`)}
                      className="p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-charcoal-900 dark:text-zinc-100">
                            {insp.inspectionNumber}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">
                            {insp.productSnapshot?.name || 'Packaged Commodity'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                          <span>SKU: {insp.productSnapshot?.sku || 'N/A'}</span>
                          <span>•</span>
                          <span>{new Date(insp.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {issues > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {issues} {issues === 1 ? 'Red Flag' : 'Red Flags'}
                          </span>
                        ) : reviews > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {reviews} Needs Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Clean
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Audit Trail Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-charcoal-900 dark:text-zinc-200">
              Recent Activity & Audit
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">Append-only</span>
          </div>

          <div className="p-4 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 space-y-3 max-h-[380px] overflow-y-auto">
            {auditEvents.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No recent audit logs.</p>
            ) : (
              auditEvents.slice(0, 7).map((ev) => (
                <div key={ev.id} className="text-xs space-y-1 pb-2.5 border-b border-black/5 dark:border-white/5 last:border-none last:pb-0">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-medium text-charcoal-800 dark:text-zinc-300">
                      {ev.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-zinc-400 font-mono text-[10px]">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    By {ev.actor?.name || 'Inspector'}
                  </p>
                  {ev.metadata?.note && (
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 italic bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
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
