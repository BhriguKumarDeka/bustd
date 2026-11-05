import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  ArrowUpDown, 
  Download, 
  FileText, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import DoubleLayerCard from '../components/DoubleLayerCard';

export default function InspectionHistory() {
  const navigate = useNavigate();
  const { addToast } = useSystem();

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('all'); // 'all', 'issues', 'review', 'clean'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getInspections();
        setInspections(res.data || []);
      } catch (err) {
        addToast(`Failed to load history: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleDownloadPdf = async (e, inspection) => {
    e.stopPropagation();
    setDownloadingId(inspection.id);
    try {
      await api.downloadReportPdf(inspection.id, inspection.inspectionNumber);
      addToast(`Downloaded PDF report for ${inspection.inspectionNumber}`, 'success');
    } catch (err) {
      addToast(`Failed to download report: ${err.message}`, 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter & Search
  const filtered = inspections.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      item.inspectionNumber?.toLowerCase().includes(q) ||
      item.productSnapshot?.name?.toLowerCase().includes(q) ||
      item.productSnapshot?.sku?.toLowerCase().includes(q) ||
      item.productSnapshot?.brand?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterOutcome === 'issues') return (item.summary?.potentialIssues || 0) > 0;
    if (filterOutcome === 'review') return (item.summary?.reviewRequired || 0) > 0;
    if (filterOutcome === 'clean') return (item.summary?.potentialIssues || 0) === 0 && (item.summary?.reviewRequired || 0) === 0;

    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto pb-20"
    >
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Inspection Archive &amp; Audit Records
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical packaging compliance audits, spatial evidence logs, and official certificates.
          </p>
        </div>

        <button
          onClick={() => navigate('/inspections/new')}
          className="btn-shimmer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-bustd hover:opacity-95 text-white text-xs font-semibold self-start sm:self-auto shadow-sm transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Inspection</span>
        </button>
      </div>

      {/* Filter & Search Bar with Double Layer */}
      <DoubleLayerCard innerClassName="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, Product, or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'issues', label: 'Issues Flagged' },
              { id: 'review', label: 'Review Required' },
              { id: 'clean', label: 'Clean' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterOutcome(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  filterOutcome === f.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}

            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/5 shrink-0"
              title={`Sorting ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </DoubleLayerCard>

      {/* Inspections List */}
      <DoubleLayerCard innerClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <div className="w-6 h-6 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
            <p>Loading inspection records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-500">No inspection records match your query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map(item => {
              const issues = item.summary?.potentialIssues || 0;
              const reviews = item.summary?.reviewRequired || 0;
              const passed = item.summary?.passedChecks || 0;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/inspections/${item.id}`)}
                  className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] cursor-pointer transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {item.inspectionNumber}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-white">
                        {item.productSnapshot?.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                        {item.productSnapshot?.sku}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3 font-mono">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.assets?.length || 0} artwork proof(s)</span>
                      <span>•</span>
                      <span>Inspector: {item.inspector?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Status Pill */}
                    <div className="flex items-center gap-1.5">
                      {issues > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {issues} {issues === 1 ? 'issue' : 'issues'}
                        </span>
                      ) : reviews > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {reviews} review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Passed ({passed})
                        </span>
                      )}
                    </div>

                    {/* PDF Download Button */}
                    <button
                      onClick={e => handleDownloadPdf(e, item)}
                      disabled={downloadingId === item.id}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Download PDF Certificate"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DoubleLayerCard>
    </motion.div>
  );
}
