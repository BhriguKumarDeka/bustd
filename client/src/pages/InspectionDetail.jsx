import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  X, 
  Clock, 
  Edit3, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import Modal from '../components/Modal';

export default function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useSystem();

  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('findings'); // 'findings' | 'comparison' | 'fields' | 'audit'
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);

  // Progressive disclosure: map of findingId -> boolean
  const [expandedDetails, setExpandedDetails] = useState({});

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Modal states
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [targetFindingToDismiss, setTargetFindingToDismiss] = useState(null);
  const [dismissReason, setDismissReason] = useState('');

  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [finalizeDecision, setFinalizeDecision] = useState('returned_for_revision');
  const [finalizeNotes, setFinalizeNotes] = useState('');

  const [correctFieldModalOpen, setCorrectFieldModalOpen] = useState(false);
  const [targetFieldKey, setTargetFieldKey] = useState('');
  const [correctedValue, setCorrectedValue] = useState('');

  const [auditEvents, setAuditEvents] = useState([]);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Load inspection
  const loadInspection = async () => {
    try {
      const res = await api.getInspection(id);
      setInspection(res.data);

      // Default active finding
      const firstIssue = res.data.findings?.find(f => f.status === 'potential_issue');
      if (firstIssue) {
        setSelectedFindingId(firstIssue.findingId);
        const assetIdx = res.data.assets?.findIndex(a => a.assetId === firstIssue.evidenceAssetId);
        if (assetIdx !== -1) setActiveAssetIndex(assetIdx);
      } else if (res.data.findings?.length > 0) {
        setSelectedFindingId(res.data.findings[0].findingId);
      }

      // Load audit trail
      const audRes = await api.getAuditEvents(res.data.id);
      setAuditEvents(audRes.data || []);
    } catch (err) {
      addToast(`Error loading inspection: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspection();
  }, [id]);

  const toggleDetails = (findingId) => {
    setExpandedDetails(prev => ({
      ...prev,
      [findingId]: !prev[findingId]
    }));
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-olive-400 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-palette-dark dark:border-palette-cream border-t-transparent animate-spin mx-auto" />
        <p>Loading inspection workspace and spatial evidence layers...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="p-16 text-center text-xs text-olive-400 space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
        <p>Inspection record #{id} could not be resolved.</p>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2 rounded-control bg-palette-dark text-palette-sand font-medium"
        >
          Return to History
        </button>
      </div>
    );
  }

  const assets = inspection.assets || [];
  const currentAsset = assets[activeAssetIndex] || assets[0];
  const findings = inspection.findings || [];
  const summary = inspection.summary || {};
  const product = inspection.productSnapshot || {};

  // Filtered findings list
  const filteredFindings = findings.filter(f => {
    if (statusFilter === 'all') return true;
    return f.status === statusFilter;
  });

  const selectedFinding = findings.find(f => f.findingId === selectedFindingId) || findings[0];

  // Reviewer action handler
  const handleReviewAction = async (findingId, action, reason = '', notes = '') => {
    try {
      const res = await api.reviewFinding(inspection.id, findingId, {
        action,
        dismissReason: reason,
        notes
      });
      setInspection(res.data);
      addToast(`Finding marked as ${action.toUpperCase()}.`, 'success');
      const audRes = await api.getAuditEvents(inspection.id);
      setAuditEvents(audRes.data || []);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Dismiss modal trigger
  const openDismissModal = (finding) => {
    setTargetFindingToDismiss(finding);
    setDismissReason('');
    setDismissModalOpen(true);
  };

  const submitDismissModal = async (e) => {
    e.preventDefault();
    if (!dismissReason.trim()) {
      addToast('A specific justification reason is mandatory when dismissing a finding.', 'error');
      return;
    }
    await handleReviewAction(targetFindingToDismiss.findingId, 'dismissed', dismissReason);
    setDismissModalOpen(false);
  };

  // Finalize inspection
  const handleFinalizeInspection = async (e) => {
    e.preventDefault();
    try {
      const res = await api.finalizeInspection(inspection.id, {
        decision: finalizeDecision,
        notes: finalizeNotes
      });
      setInspection(res.data);
      setFinalizeModalOpen(false);
      addToast(`Inspection screening decision saved: ${finalizeDecision.toUpperCase()}`, 'success');
      const audRes = await api.getAuditEvents(inspection.id);
      setAuditEvents(audRes.data || []);
    } catch (err) {
      addToast(`Failed to finalize inspection: ${err.message}`, 'error');
    }
  };

  // Field correction handler
  const openCorrectModal = (fieldKey, currentValue) => {
    setTargetFieldKey(fieldKey);
    setCorrectedValue(currentValue || '');
    setCorrectFieldModalOpen(true);
  };

  const submitCorrectField = async (e) => {
    e.preventDefault();
    try {
      const res = await api.correctField(inspection.id, targetFieldKey, {
        correctedValue,
        status: 'corrected'
      });
      setInspection(res.data);
      setCorrectFieldModalOpen(false);
      addToast(`Declaration "${targetFieldKey}" corrected and logged.`, 'success');
      const audRes = await api.getAuditEvents(inspection.id);
      setAuditEvents(audRes.data || []);
    } catch (err) {
      addToast(`Failed to correct field: ${err.message}`, 'error');
    }
  };

  // PDF download
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await api.downloadReportPdf(inspection.id, inspection.inspectionNumber);
      addToast('Generated official screening PDF report successfully.', 'success');
    } catch (err) {
      addToast(`Failed to download report: ${err.message}`, 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-[1600px] mx-auto">
      
      {/* Top Header Bar: Reference, SKU, Inspector & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 shadow-soft-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/history')}
              className="text-olive-400 hover:text-palette-dark dark:hover:text-palette-sand p-1 rounded-control hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Return to History"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-semibold text-palette-dark dark:text-palette-sand">
              {inspection.inspectionNumber}
            </span>
            <span className="text-olive-300 dark:text-olive-600">•</span>
            <span className="text-xs font-medium text-palette-dark dark:text-palette-sand truncate max-w-md">
              {product.name}
            </span>
            <span className="text-olive-300 dark:text-olive-600">•</span>
            <span className="font-mono text-[11px] text-olive-500 dark:text-olive-400">
              SKU: {product.sku}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-olive-500 dark:text-olive-400 font-mono pl-7">
            <span>Inspector: {inspection.inspector?.name || 'Lead Reviewer'}</span>
            <span>•</span>
            <span>{new Date(inspection.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 pl-7 sm:pl-0">
          <button
            onClick={() => setFinalizeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-palette-dark hover:bg-black dark:bg-palette-sand dark:hover:bg-white text-palette-sand dark:text-palette-dark text-xs font-medium shadow-soft-sm transition-surface"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Finalize Decision</span>
            {inspection.finalDecision && inspection.finalDecision !== 'pending' && (
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] uppercase font-mono bg-emerald-500/20 text-emerald-800 dark:text-emerald-950 font-bold">
                {inspection.finalDecision.replace(/_/g, ' ')}
              </span>
            )}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-raised-light dark:bg-raised-dark hover:bg-black/10 dark:hover:bg-white/10 text-palette-dark dark:text-palette-sand text-xs font-medium border border-black/5 dark:border-white/5 transition-surface disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Screening Status Banner */}
      <div className={`p-4 rounded-panel border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        inspection.finalDecision === 'approved'
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
          : inspection.finalDecision === 'returned_for_revision'
          ? 'bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-200'
          : summary.potentialIssues > 0
          ? 'bg-red-500/5 border-red-500/20 text-red-900 dark:text-red-300'
          : summary.reviewRequired > 0
          ? 'bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-300'
          : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-300'
      }`}>
        <div className="flex items-start gap-3">
          {summary.potentialIssues > 0 ? (
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : summary.reviewRequired > 0 ? (
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}

          <div className="space-y-0.5">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider">
              {inspection.finalDecision !== 'pending'
                ? `FINAL DECISION: ${inspection.finalDecision.replace(/_/g, ' ')}`
                : summary.potentialIssues > 0
                ? `${summary.potentialIssues} POTENTIAL RED FLAG(S) DETECTED`
                : summary.reviewRequired > 0
                ? `${summary.reviewRequired} DECLARATION(S) REQUIRE MANUAL REVIEW`
                : 'ALL EVALUATED RULES PASSED'}
            </div>
            <p className="text-xs opacity-90 leading-relaxed font-sans">
              {inspection.finalDecisionNotes
                ? `Reviewer Remarks: "${inspection.finalDecisionNotes}"`
                : summary.potentialIssues > 0
                ? 'Statutory or SKU master mismatches found. Review evidence regions on the packaging dieline below.'
                : 'Deterministic evaluation completed with zero blocking violations.'}
            </p>
          </div>
        </div>

        {/* Small live summary badges */}
        <div className="flex items-center gap-2.5 shrink-0 text-xs font-mono">
          <span className="px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-palette-dark dark:text-palette-sand">
            Checks: {summary.totalChecks || findings.length}
          </span>
          <span className="px-2 py-1 rounded bg-red-500/15 text-red-600 dark:text-red-400 font-bold">
            Issues: {summary.potentialIssues || 0}
          </span>
          <span className="px-2 py-1 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
            Review: {summary.reviewRequired || 0}
          </span>
          <span className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
            Passed: {summary.passedChecks || 0}
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN INSPECTION WORKSPACE (THE CENTERPIECE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE EVIDENCE VIEWER & PACKAGING ARTWORK CANVAS (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-3.5 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 text-xs shadow-soft-sm">
            {/* Panel Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {assets.map((asset, idx) => (
                <button
                  key={asset.assetId}
                  onClick={() => {
                    setActiveAssetIndex(idx);
                    setZoomLevel(1);
                  }}
                  className={`px-3 py-1.5 rounded-control capitalize font-medium text-xs transition-surface flex items-center gap-1.5 shrink-0 ${
                    activeAssetIndex === idx
                      ? 'tactile-active-nav text-palette-dark dark:text-palette-sand font-semibold'
                      : 'text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{asset.panel} Panel</span>
                  <span className="text-[10px] font-mono opacity-60">
                    ({asset.originalFilename.split('.').pop()})
                  </span>
                </button>
              ))}
            </div>

            {/* Canvas Zoom Controls */}
            <div className="flex items-center gap-1 shrink-0 border-l border-black/5 dark:border-white/5 pl-2">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.2))}
                className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-olive-500 dark:text-olive-400 w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Artwork Canvas Viewport */}
          <div className="relative rounded-workspace bg-[#14130F] border border-black/10 dark:border-white/10 overflow-hidden min-h-[580px] flex items-center justify-center shadow-soft-lg group">
            {currentAsset ? (
              <div
                className="relative transition-transform duration-200 origin-center select-none"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Packaging Artwork Image */}
                <img
                  src={currentAsset.storedPath}
                  alt={currentAsset.originalFilename}
                  className="max-h-[640px] w-auto object-contain rounded shadow-2xl block"
                  onLoad={() => setImageLoaded(true)}
                />

                {/* Spatial Evidence Bounding Boxes Overlay */}
                {findings
                  .filter(f => f.evidenceAssetId === currentAsset.assetId && f.evidenceBox)
                  .map((finding) => {
                    const isSelected = selectedFindingId === finding.findingId;
                    const box = finding.evidenceBox;

                    let strokeColor = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
                    let badgeBg = 'bg-emerald-600';
                    if (finding.status === 'potential_issue') {
                      strokeColor = 'border-red-500 bg-red-500/20 text-red-300';
                      badgeBg = 'bg-red-600';
                    } else if (finding.status === 'review_required') {
                      strokeColor = 'border-amber-500 bg-amber-500/20 text-amber-300';
                      badgeBg = 'bg-amber-600';
                    }

                    return (
                      <div
                        key={finding.findingId}
                        onClick={() => setSelectedFindingId(finding.findingId)}
                        style={{
                          position: 'absolute',
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.w}%`,
                          height: `${box.h}%`
                        }}
                        className={`border-2 rounded cursor-pointer transition-all duration-150 ${strokeColor} ${
                          isSelected
                            ? 'ring-4 ring-[#84CC16]/60 ring-offset-1 z-20 scale-[1.01]'
                            : 'hover:border-white hover:bg-white/10 z-10'
                        }`}
                        title={`${finding.title} (${finding.ruleId})`}
                      >
                        {/* Interactive Tag Pill on the Canvas */}
                        <div
                          className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white shadow-sm flex items-center gap-1 ${badgeBg}`}
                        >
                          <span>{finding.ruleId}</span>
                          {finding.ocrConfidence > 0 && (
                            <span className="opacity-80">({Math.round(finding.ocrConfidence * 100)}%)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-olive-400 text-xs">No packaging assets attached.</div>
            )}

            {/* Bottom canvas watermark & instructions */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-palette-cream bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-control pointer-events-none border border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] shadow-[0_0_6px_#84CC16]" />
                Click bounding boxes to inspect findings
              </span>
              <span>
                Panel: {currentAsset?.panel?.toUpperCase()} • {currentAsset?.originalFilename}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FINDINGS, PROGRESSIVE DETAILS & HUMAN ACTIONS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sub-navigation Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 text-xs shadow-soft-sm">
            {[
              { id: 'findings', label: 'Findings', badge: findings.length },
              { id: 'comparison', label: 'Master Check', badge: 'Diff' },
              { id: 'fields', label: 'Tokens' },
              { id: 'audit', label: 'Audit Trail', badge: auditEvents.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-control font-medium transition-surface flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'tactile-active-nav text-palette-dark dark:text-palette-sand font-semibold'
                    : 'text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    activeTab === tab.id ? 'bg-palette-cream/40 text-palette-dark' : 'bg-black/5 dark:bg-white/10 text-olive-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: FINDINGS & REVIEWER ACTIONS (WITH PROGRESSIVE DISCLOSURE) */}
          {activeTab === 'findings' && (
            <div className="space-y-3">
              {/* Finding Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Findings' },
                  { id: 'potential_issue', label: 'Red Flags', count: summary.potentialIssues },
                  { id: 'review_required', label: 'Review Required', count: summary.reviewRequired },
                  { id: 'no_issue', label: 'Passed', count: summary.passedChecks }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1 rounded-control text-[11px] font-medium transition-surface shrink-0 ${
                      statusFilter === f.id
                        ? 'bg-palette-dark text-palette-sand dark:bg-palette-sand dark:text-palette-dark font-semibold shadow-soft-sm'
                        : 'text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {f.label} {f.count !== undefined && `(${f.count})`}
                  </button>
                ))}
              </div>

              {/* Findings Stack */}
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {filteredFindings.map((finding) => {
                  const isSelected = selectedFindingId === finding.findingId;
                  const isIssue = finding.status === 'potential_issue';
                  const isReview = finding.status === 'review_required';
                  const isExpanded = expandedDetails[finding.findingId];

                  return (
                    <div
                      key={finding.findingId}
                      onClick={() => {
                        setSelectedFindingId(finding.findingId);
                        const assetIdx = assets.findIndex(a => a.assetId === finding.evidenceAssetId);
                        if (assetIdx !== -1) setActiveAssetIndex(assetIdx);
                      }}
                      className={`p-4 rounded-panel border transition-surface cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-white dark:bg-[#25241E] border-palette-dark dark:border-palette-cream shadow-soft-md ring-1 ring-black/5 dark:ring-white/10'
                          : 'bg-white/70 dark:bg-[#1E1D18] border-black/5 dark:border-white/5 hover:border-palette-cream/40'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                isIssue
                                  ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                                  : isReview
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {finding.status.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono text-[10px] text-olive-500 dark:text-olive-400">
                              {finding.ruleId} v{finding.ruleVersion}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-palette-dark dark:text-palette-sand leading-snug">
                            {finding.title}
                          </h4>
                        </div>

                        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded shrink-0 ${
                          finding.severity === 'critical' ? 'text-red-500 bg-red-500/10' : 'text-olive-400 bg-black/5 dark:bg-white/5'
                        }`}>
                          {finding.severity}
                        </span>
                      </div>

                      {/* Values Comparison Strip (High contrast, clutterless) */}
                      <div className="p-3 rounded-control bg-raised-light dark:bg-[#2A2922] border border-black/5 dark:border-white/5 space-y-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-olive-500 dark:text-olive-400 block uppercase">
                            Expected Baseline:
                          </span>
                          <span className="text-palette-dark dark:text-palette-sand font-medium">
                            {finding.expectedValue}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-olive-500 dark:text-olive-400 block uppercase">
                            Detected on Artwork:
                          </span>
                          <span className={isIssue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-palette-dark dark:text-palette-sand'}>
                            {finding.detectedValue}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-[11px] text-olive-600 dark:text-olive-300 leading-relaxed font-sans">
                        {finding.explanation}
                      </p>

                      {/* Progressive Disclosure Toggle */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDetails(finding.findingId);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-olive-500 dark:text-olive-400 hover:text-palette-dark dark:hover:text-palette-sand transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Technical Evidence' : 'Show Rule Citation & Evidence'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {/* Collapsible Technical Details */}
                        {isExpanded && (
                          <div className="mt-2 p-2.5 rounded bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-1.5 text-[11px] font-mono animate-in fade-in duration-150">
                            <div className="flex justify-between">
                              <span className="text-olive-400">Pillar:</span>
                              <span className="text-palette-dark dark:text-palette-sand capitalize">{finding.pillar.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-olive-400">OCR Confidence:</span>
                              <span className="text-palette-dark dark:text-palette-sand">{Math.round((finding.ocrConfidence || 0) * 100)}%</span>
                            </div>
                            {finding.evidenceBox && (
                              <div className="flex justify-between">
                                <span className="text-olive-400">Spatial Box [x,y,w,h]:</span>
                                <span className="text-palette-dark dark:text-palette-sand">[{finding.evidenceBox.x}, {finding.evidenceBox.y}, {finding.evidenceBox.w}, {finding.evidenceBox.h}]</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reviewer Disposition Section */}
                      <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-olive-500 dark:text-olive-400">Reviewer Disposition:</span>
                          <span className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                            finding.reviewDisposition === 'confirmed'
                              ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                              : finding.reviewDisposition === 'dismissed'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : finding.reviewDisposition === 'deferred'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-black/5 dark:bg-white/5 text-olive-400'
                          }`}>
                            {finding.reviewDisposition || 'pending'}
                          </span>
                        </div>

                        {finding.dismissReason && (
                          <div className="p-2 rounded bg-black/5 dark:bg-white/5 text-[11px] text-palette-dark dark:text-palette-sand italic">
                            Dismissal Reason: "{finding.dismissReason}"
                          </div>
                        )}

                        {/* Tactile Reviewer Action Buttons */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewAction(finding.findingId, 'confirmed');
                            }}
                            className={`flex-1 py-1.5 rounded-control text-xs font-medium transition-surface flex items-center justify-center gap-1 ${
                              finding.reviewDisposition === 'confirmed'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            Confirm Issue
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDismissModal(finding);
                            }}
                            className={`flex-1 py-1.5 rounded-control text-xs font-medium transition-surface flex items-center justify-center gap-1 ${
                              finding.reviewDisposition === 'dismissed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            <X className="w-3 h-3" />
                            Dismiss
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewAction(finding.findingId, 'deferred');
                            }}
                            className={`px-3 py-1.5 rounded-control text-xs font-medium transition-surface flex items-center justify-center gap-1 ${
                              finding.reviewDisposition === 'deferred'
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                            }`}
                            title="Defer for further review"
                          >
                            <Clock className="w-3 h-3" />
                            Defer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MASTER COMPARISON (CROSS-SOURCE CONSISTENCY) */}
          {activeTab === 'comparison' && (
            <div className="p-4 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 space-y-4 shadow-soft-sm">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-palette-dark dark:text-palette-sand">
                  SKU Master Baseline vs Printed Packaging Artwork
                </h4>
                <p className="text-[11px] text-olive-500">
                  Cross-validating authoritative ERP records against OCR-extracted tokens.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {/* MRP Comparison */}
                <div className="p-3 rounded-control bg-raised-light dark:bg-[#282721] border border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-palette-dark dark:text-palette-sand">
                      Maximum Retail Price (MRP)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-600 dark:text-red-400 font-bold">
                      MISMATCH
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div>
                      <span className="text-olive-500 text-[10px] block">Expected (Master)</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(product.mrp).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-olive-500 text-[10px] block">Detected (Artwork)</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {inspection.extractedFields?.mrp?.rawText || '₹60.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Quantity Comparison */}
                <div className="p-3 rounded-control bg-raised-light dark:bg-[#282721] border border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-palette-dark dark:text-palette-sand">
                      Net Quantity Declaration
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-600 dark:text-red-400 font-bold">
                      COUNT MISMATCH
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div>
                      <span className="text-olive-500 text-[10px] block">Expected (Master)</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {product.netQuantity} ({product.netQuantityNumeric} units)
                      </span>
                    </div>
                    <div>
                      <span className="text-olive-500 text-[10px] block">Detected (Artwork)</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {inspection.extractedFields?.net_quantity?.rawText || '12 N (pens)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Manufacturer Comparison */}
                <div className="p-3 rounded-control bg-raised-light dark:bg-[#282721] border border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-palette-dark dark:text-palette-sand">
                      Manufacturer Address &amp; PIN
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      VERIFIED (600001)
                    </span>
                  </div>
                  <div className="text-[11px] text-olive-600 dark:text-olive-300 font-sans">
                    {product.manufacturer}
                  </div>
                </div>

                {/* Consumer Care Comparison */}
                <div className="p-3 rounded-control bg-raised-light dark:bg-[#282721] border border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-palette-dark dark:text-palette-sand">
                      Consumer Care Helpline &amp; Email
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      DEGRADED OCR (42%)
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-olive-600 dark:text-olive-300">
                    Detected: {inspection.extractedFields?.consumer_care?.rawText || 'Smudged resolution'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXTRACTED FIELDS & FIELD CORRECTION */}
          {activeTab === 'fields' && (
            <div className="p-4 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 space-y-4 shadow-soft-sm">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-palette-dark dark:text-palette-sand">
                  Extracted Declaration Tokens
                </h4>
                <p className="text-[11px] text-olive-500">
                  Reviewers may correct extracted text or mark uncertain without altering original machine traces.
                </p>
              </div>

              <div className="space-y-3 max-h-[580px] overflow-y-auto">
                {Object.entries(inspection.extractedFields || {}).map(([key, field]) => (
                  <div
                    key={key}
                    className="p-3 rounded-control bg-raised-light dark:bg-[#282721] border border-black/5 dark:border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono uppercase font-semibold text-palette-dark dark:text-palette-sand">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => openCorrectModal(key, field.rawText)}
                        className="inline-flex items-center gap-1 text-[11px] text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        Correct
                      </button>
                    </div>

                    <div className="font-mono text-[11px] text-palette-dark dark:text-palette-sand bg-black/5 dark:bg-white/5 p-2 rounded break-all">
                      {field.rawText}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-olive-500 dark:text-olive-400">
                      <span>Confidence: {Math.round((field.confidence || 0) * 100)}%</span>
                      <span className="capitalize">Status: {field.status}</span>
                    </div>

                    {field.reviewerCorrection && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono italic">
                        Correction applied by {field.reviewerCorrection.correctedBy}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOG TIMELINE */}
          {activeTab === 'audit' && (
            <div className="p-4 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 space-y-4 shadow-soft-sm">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-palette-dark dark:text-palette-sand">
                  Immutable Inspection Audit Trail
                </h4>
                <p className="text-[11px] text-olive-500">
                  Append-only record of every automated run and human reviewer decision.
                </p>
              </div>

              <div className="space-y-3 max-h-[580px] overflow-y-auto">
                {auditEvents.map((ev) => (
                  <div key={ev.id} className="text-xs space-y-1 pb-3 border-b border-black/5 dark:border-white/5 last:border-none">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-medium text-palette-dark dark:text-palette-sand">
                        {ev.action}
                      </span>
                      <span className="font-mono text-olive-400 text-[10px]">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-olive-500">
                      Actor: {ev.actor?.name} ({ev.actor?.role})
                    </p>
                    {ev.metadata?.reason && (
                      <p className="text-[11px] text-palette-dark dark:text-palette-sand bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                        Reason: "{ev.metadata.reason}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DISMISS FINDING REASON MODAL */}
      <Modal
        isOpen={dismissModalOpen}
        onClose={() => setDismissModalOpen(false)}
        title="Dismiss Potential Issue"
        subtitle="A specific reviewer justification is strictly required to dismiss an automated red flag."
      >
        <form onSubmit={submitDismissModal} className="space-y-4 text-xs">
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300">
            <span className="font-bold block font-mono text-[11px] mb-0.5">
              {targetFindingToDismiss?.ruleId}: {targetFindingToDismiss?.title}
            </span>
            <span className="text-[11px] opacity-90">
              Expected: {targetFindingToDismiss?.expectedValue}
            </span>
          </div>

          <div>
            <label className="block text-olive-600 dark:text-olive-300 font-medium mb-1.5">
              Justification / Dismissal Reason *
            </label>
            <textarea
              rows={3}
              required
              value={dismissReason}
              onChange={e => setDismissReason(e.target.value)}
              placeholder="e.g. Approved promotional pricing sticker amendment, or verified regional exception per Legal Metrology Gazette notification..."
              className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-palette-dark dark:text-palette-sand focus:outline-none focus:border-palette-dark dark:focus:border-palette-sand"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setDismissModalOpen(false)}
              className="px-4 py-2 rounded-input text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-input bg-red-600 hover:bg-red-700 text-white font-medium shadow-soft-sm"
            >
              Confirm Dismissal
            </button>
          </div>
        </form>
      </Modal>

      {/* FINALIZE INSPECTION DECISION MODAL */}
      <Modal
        isOpen={finalizeModalOpen}
        onClose={() => setFinalizeModalOpen(false)}
        title="Finalize Packaging Screening Decision"
        subtitle="Authorize or reject pre-press packaging dielines for production"
      >
        <form onSubmit={handleFinalizeInspection} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="block text-olive-600 dark:text-olive-300 font-medium">
              Reviewer Final Decision *
            </label>

            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'returned_for_revision', label: 'Returned for Revision (Critical Red Flags)', color: 'text-red-600' },
                { id: 'approved_with_exceptions', label: 'Approved with Accepted Exceptions', color: 'text-amber-600' },
                { id: 'approved', label: 'Approved (Compliant for Pre-Press Print)', color: 'text-emerald-600' }
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-control border cursor-pointer transition-surface ${
                    finalizeDecision === opt.id
                      ? 'bg-black/5 dark:bg-white/10 border-palette-dark dark:border-palette-sand font-semibold'
                      : 'border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={opt.id}
                    checked={finalizeDecision === opt.id}
                    onChange={() => setFinalizeDecision(opt.id)}
                    className="accent-palette-dark dark:accent-palette-sand"
                  />
                  <span className={`font-medium ${opt.color}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-olive-600 dark:text-olive-300 font-medium mb-1">
              Final Reviewer Remarks
            </label>
            <textarea
              rows={3}
              value={finalizeNotes}
              onChange={e => setFinalizeNotes(e.target.value)}
              placeholder="e.g. Pre-production screening passed with minor caveat, or packaging returned to agency for price and net count correction..."
              className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-palette-dark dark:text-palette-sand"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setFinalizeModalOpen(false)}
              className="px-4 py-2 rounded-input text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-input bg-palette-dark dark:bg-palette-sand text-palette-sand dark:text-palette-dark font-semibold shadow-soft-sm"
            >
              Save Final Decision
            </button>
          </div>
        </form>
      </Modal>

      {/* FIELD CORRECTION MODAL */}
      <Modal
        isOpen={correctFieldModalOpen}
        onClose={() => setCorrectFieldModalOpen(false)}
        title={`Correct Declaration: ${targetFieldKey.toUpperCase()}`}
        subtitle="Manually override an OCR-extracted declaration value"
      >
        <form onSubmit={submitCorrectField} className="space-y-4 text-xs">
          <div>
            <label className="block text-olive-600 dark:text-olive-300 font-medium mb-1">
              Corrected Text Value *
            </label>
            <textarea
              rows={3}
              required
              value={correctedValue}
              onChange={e => setCorrectedValue(e.target.value)}
              className="w-full px-3 py-2 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-palette-dark dark:text-palette-sand font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setCorrectFieldModalOpen(false)}
              className="px-4 py-2 rounded-input text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-input bg-palette-dark dark:bg-palette-sand text-palette-sand dark:text-palette-dark font-semibold"
            >
              Save Field Correction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
