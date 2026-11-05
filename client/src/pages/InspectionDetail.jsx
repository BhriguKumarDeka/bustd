import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  X, 
  Clock, 
  Edit3, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import Modal from '../components/Modal';
import DoubleLayerCard from '../components/DoubleLayerCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

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
      <div className="p-16 text-center text-xs text-muted space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
        <p>Loading inspection workspace and spatial evidence layers...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="p-16 text-center text-xs text-muted space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
        <p>Inspection record #{id} could not be resolved.</p>
        <Button
          variant="primary"
          onClick={() => navigate('/history')}
        >
          Return to History
        </Button>
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
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-24 max-w-[1600px] mx-auto"
    >
      {/* Top Header: Inspection SKU Context & Actions */}
      <DoubleLayerCard innerClassName="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/history')}
              className="text-muted hover:text-primary p-1.5 rounded-lg hover:bg-surface-subtle transition-colors"
              title="Return to History"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">
                  {inspection.inspectionNumber}
                </span>
                <span className="text-muted text-xs">•</span>
                <span className="text-xs font-semibold text-primary truncate max-w-xs sm:max-w-md">
                  {product.name}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-surface-subtle text-secondary font-semibold border border-subtle">
                  {product.sku}
                </span>
                {inspection.packFormat && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-pink-500/10 text-pink-600 dark:text-pink-400 font-medium">
                    {inspection.packFormat}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted font-mono mt-0.5">
                Inspector: {inspection.inspector?.name || 'QA Reviewer'} • {new Date(inspection.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              icon={ShieldCheck}
              onClick={() => setFinalizeModalOpen(true)}
            >
              <span>Sign-Off Decision</span>
              {inspection.finalDecision && inspection.finalDecision !== 'pending' && (
                <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] uppercase font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                  {inspection.finalDecision.replace(/_/g, ' ')}
                </span>
              )}
            </Button>

            <Button
              variant="gradient"
              size="sm"
              icon={Download}
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </DoubleLayerCard>

      {/* Real-time Screening Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        inspection.finalDecision === 'approved'
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200'
          : inspection.finalDecision === 'returned_for_revision'
          ? 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-200'
          : summary.potentialIssues > 0
          ? 'bg-red-500/5 border-red-500/20 text-red-800 dark:text-red-300'
          : summary.reviewRequired > 0
          ? 'bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-300'
          : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
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
        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-primary border border-subtle">
            Checks: {summary.totalChecks || findings.length}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-bold">
            Issues: {summary.potentialIssues || 0}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
            Review: {summary.reviewRequired || 0}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
            Passed: {summary.passedChecks || 0}
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN INSPECTION WORKSPACE (THE CENTERPIECE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE EVIDENCE VIEWER & PACKAGING ARTWORK CANVAS (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <DoubleLayerCard innerClassName="p-2.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              {/* Panel Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {assets.map((asset, idx) => (
                  <button
                    key={asset.assetId}
                    onClick={() => {
                      setActiveAssetIndex(idx);
                      setZoomLevel(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl capitalize font-medium text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                      activeAssetIndex === idx
                        ? 'bg-surface-raised text-primary font-semibold shadow-sm border border-subtle'
                        : 'text-muted hover:text-primary hover:bg-surface-subtle'
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
              <div className="flex items-center gap-1 shrink-0 border-l border-subtle pl-2">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.2))}
                  className="p-1.5 rounded hover:bg-surface-subtle text-muted hover:text-primary transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-muted w-10 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                  className="p-1.5 rounded hover:bg-surface-subtle text-muted hover:text-primary transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded hover:bg-surface-subtle text-muted hover:text-primary transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </DoubleLayerCard>

          {/* Interactive Artwork Canvas Viewport */}
          <div className="relative rounded-2xl bg-surface-subtle border border-subtle overflow-hidden min-h-[580px] flex items-center justify-center shadow-soft-lg group">
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
                            ? 'ring-4 ring-pink-500/70 ring-offset-1 z-20 scale-[1.01]'
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
              <div className="text-muted text-xs">No packaging assets attached.</div>
            )}

            {/* Bottom canvas watermark & instructions */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-primary bg-surface-raised/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl pointer-events-none border border-subtle">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gradient-bustd shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
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
          <DoubleLayerCard innerClassName="p-1">
            <div className="flex items-center gap-1 text-xs">
              {[
                { id: 'findings', label: 'Findings', badge: findings.length },
                { id: 'comparison', label: 'Master Check', badge: 'Diff' },
                { id: 'fields', label: 'Tokens' },
                { id: 'audit', label: 'Audit Trail', badge: auditEvents.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-1.5 px-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'text-primary font-semibold'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeSubTabMorph"
                      className="absolute inset-0 bg-surface-raised rounded-xl shadow-soft-sm border border-subtle"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`relative z-10 px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      activeTab === tab.id ? 'bg-pink-500/15 text-pink-600 dark:text-pink-400 font-bold' : 'bg-surface-subtle text-muted'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </DoubleLayerCard>

          {/* TAB 1: FINDINGS & REVIEWER ACTIONS */}
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
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                      statusFilter === f.id
                        ? 'bg-surface-raised text-primary font-semibold shadow-sm border border-subtle'
                        : 'text-muted hover:text-primary hover:bg-surface-subtle'
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
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-surface-raised border-pink-500/50 shadow-soft-md ring-1 ring-pink-500/20'
                          : 'bg-surface border-subtle hover:border-muted'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isIssue ? 'issue' : isReview ? 'review' : 'pass'}
                            >
                              {finding.status.replace(/_/g, ' ')}
                            </Badge>
                            <span className="font-mono text-[10px] text-muted">
                              {finding.ruleId} v{finding.ruleVersion}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-primary leading-snug">
                            {finding.title}
                          </h4>
                        </div>

                        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded shrink-0 ${
                          finding.severity === 'critical' ? 'text-red-500 bg-red-500/10' : 'text-muted bg-surface-subtle'
                        }`}>
                          {finding.severity}
                        </span>
                      </div>

                      {/* Values Comparison Strip */}
                      <div className="p-3 rounded-xl bg-surface-subtle border border-subtle space-y-1.5 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-muted block uppercase">
                            Expected Baseline:
                          </span>
                          <span className="text-primary font-medium">
                            {finding.expectedValue}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted block uppercase">
                            Detected on Artwork:
                          </span>
                          <span className={isIssue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-primary'}>
                            {finding.detectedValue}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-[11px] text-secondary leading-relaxed font-sans">
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
                          className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-muted hover:text-primary transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Technical Evidence' : 'Show Rule Citation & Evidence'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {/* Collapsible Technical Details */}
                        {isExpanded && (
                          <div className="mt-2 p-2.5 rounded-lg bg-surface border border-subtle space-y-1.5 text-[11px] font-mono animate-in fade-in duration-150">
                            <div className="flex justify-between">
                              <span className="text-muted">Pillar:</span>
                              <span className="text-primary capitalize">{finding.pillar.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">OCR Confidence:</span>
                              <span className="text-primary">{Math.round((finding.ocrConfidence || 0) * 100)}%</span>
                            </div>
                            {finding.evidenceBox && (
                              <div className="flex justify-between">
                                <span className="text-muted">Spatial Box [x,y,w,h]:</span>
                                <span className="text-primary">[{finding.evidenceBox.x}, {finding.evidenceBox.y}, {finding.evidenceBox.w}, {finding.evidenceBox.h}]</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reviewer Disposition Section */}
                      <div className="pt-2 border-t border-subtle flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-muted">Reviewer Disposition:</span>
                          <span className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                            finding.reviewDisposition === 'confirmed'
                              ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                              : finding.reviewDisposition === 'dismissed'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : finding.reviewDisposition === 'deferred'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-surface-subtle text-muted'
                          }`}>
                            {finding.reviewDisposition || 'pending'}
                          </span>
                        </div>

                        {finding.dismissReason && (
                          <div className="p-2 rounded-lg bg-surface-subtle border border-subtle text-[11px] text-primary italic">
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
                            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
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
                            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
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
            <DoubleLayerCard>
              <div className="space-y-4 text-xs">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-primary">
                    Master Baseline vs Detected Artwork
                  </h4>
                  <p className="text-[11px] text-muted">
                    Cross-validating authoritative ERP records against OCR-extracted tokens.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* MRP Comparison */}
                  <div className="p-3 rounded-xl bg-surface-subtle border border-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        Maximum Retail Price (MRP)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/10 text-red-600 dark:text-red-400 font-bold">
                        MISMATCH
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-muted text-[10px] block">Expected (Master)</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(product.mrp).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted text-[10px] block">Detected (Artwork)</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {inspection.extractedFields?.mrp?.rawText || '₹60.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Quantity Comparison */}
                  <div className="p-3 rounded-xl bg-surface-subtle border border-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        Net Quantity Declaration
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/10 text-red-600 dark:text-red-400 font-bold">
                        COUNT MISMATCH
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-muted text-[10px] block">Expected (Master)</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {product.netQuantity} ({product.netQuantityNumeric} units)
                        </span>
                      </div>
                      <div>
                        <span className="text-muted text-[10px] block">Detected (Artwork)</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {inspection.extractedFields?.net_quantity?.rawText || '12 N (pens)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manufacturer Comparison */}
                  <div className="p-3 rounded-xl bg-surface-subtle border border-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        Manufacturer Address &amp; PIN
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        VERIFIED (600001)
                      </span>
                    </div>
                    <div className="text-[11px] text-secondary font-sans">
                      {product.manufacturer}
                    </div>
                  </div>

                  {/* Consumer Care Comparison */}
                  <div className="p-3 rounded-xl bg-surface-subtle border border-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        Consumer Care Helpline &amp; Email
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                        DEGRADED OCR (42%)
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-secondary">
                      Detected: {inspection.extractedFields?.consumer_care?.rawText || 'Smudged resolution'}
                    </div>
                  </div>
                </div>
              </div>
            </DoubleLayerCard>
          )}

          {/* TAB 3: EXTRACTED FIELDS & FIELD CORRECTION */}
          {activeTab === 'fields' && (
            <DoubleLayerCard>
              <div className="space-y-4 text-xs">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-primary">
                    Extracted Declaration Tokens
                  </h4>
                  <p className="text-[11px] text-muted">
                    Reviewers may correct extracted text or mark uncertain without altering original machine traces.
                  </p>
                </div>

                <div className="space-y-3 max-h-[580px] overflow-y-auto">
                  {Object.entries(inspection.extractedFields || {}).map(([key, field]) => (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-surface-subtle border border-subtle space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono uppercase font-semibold text-primary">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <button
                          onClick={() => openCorrectModal(key, field.rawText)}
                          className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-primary transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          Correct
                        </button>
                      </div>

                      <div className="font-mono text-[11px] text-primary bg-surface p-2 rounded-lg border border-subtle break-all">
                        {field.rawText}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-muted">
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
            </DoubleLayerCard>
          )}

          {/* TAB 4: AUDIT LOG TIMELINE */}
          {activeTab === 'audit' && (
            <DoubleLayerCard>
              <div className="space-y-4 text-xs">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-primary">
                    Immutable Inspection Audit Trail
                  </h4>
                  <p className="text-[11px] text-muted">
                    Append-only record of every automated run and human reviewer decision.
                  </p>
                </div>

                <div className="space-y-3 max-h-[580px] overflow-y-auto">
                  {auditEvents.map((ev) => (
                    <div key={ev.id} className="text-xs space-y-1 pb-3 border-b border-subtle last:border-none">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-medium text-primary">
                          {ev.action}
                        </span>
                        <span className="font-mono text-muted text-[10px]">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted">
                        Actor: {ev.actor?.name} ({ev.actor?.role})
                      </p>
                      {ev.metadata?.reason && (
                        <p className="text-[11px] text-primary bg-surface p-2 rounded border border-subtle">
                          Reason: "{ev.metadata.reason}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DoubleLayerCard>
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
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300">
            <span className="font-bold block font-mono text-[11px] mb-0.5">
              {targetFindingToDismiss?.ruleId}: {targetFindingToDismiss?.title}
            </span>
            <span className="text-[11px] opacity-90">
              Expected: {targetFindingToDismiss?.expectedValue}
            </span>
          </div>

          <div>
            <label className="block text-secondary font-medium mb-1.5">
              Justification / Dismissal Reason *
            </label>
            <textarea
              rows={3}
              required
              value={dismissReason}
              onChange={e => setDismissReason(e.target.value)}
              placeholder="e.g. Approved promotional pricing sticker amendment, or verified regional exception per Legal Metrology Gazette notification..."
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary placeholder:text-muted focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-subtle">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDismissModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
            >
              Confirm Dismissal
            </Button>
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
            <label className="block text-secondary font-medium">
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
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    finalizeDecision === opt.id
                      ? 'bg-surface-raised border-primary font-semibold'
                      : 'border-subtle hover:bg-surface-subtle'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={opt.id}
                    checked={finalizeDecision === opt.id}
                    onChange={() => setFinalizeDecision(opt.id)}
                    className="accent-pink-500"
                  />
                  <span className={`font-medium ${opt.color}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-secondary font-medium mb-1">
              Final Reviewer Remarks
            </label>
            <textarea
              rows={3}
              value={finalizeNotes}
              onChange={e => setFinalizeNotes(e.target.value)}
              placeholder="e.g. Pre-production screening passed with minor caveat, or packaging returned to agency for price and net count correction..."
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary placeholder:text-muted focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-subtle">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFinalizeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
            >
              Save Final Decision
            </Button>
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
            <label className="block text-secondary font-medium mb-1">
              Corrected Text Value *
            </label>
            <textarea
              rows={3}
              required
              value={correctedValue}
              onChange={e => setCorrectedValue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-subtle text-primary font-mono placeholder:text-muted focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-subtle">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCorrectFieldModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Save Field Correction
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}