import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';

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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900 dark:text-zinc-100 tracking-tight">
            Inspection History &amp; Audit Logs
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Browse previous screening assessments, inspect original visual evidence, and export official reports.
          </p>
        </div>

        <button
          onClick={() => navigate('/inspections/new')}
          className="px-4 py-2 rounded-input bg-charcoal-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-medium self-start sm:self-auto shadow-soft-sm transition-surface"
        >
          New Inspection
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-soft-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Inspection #, SKU, or Product..."
            className="w-full pl-9 pr-3 py-1.5 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-charcoal-900 dark:text-white placeholder-zinc-400 text-xs focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'issues', label: 'With Red Flags' },
            { id: 'review', label: 'Review Required' },
            { id: 'clean', label: 'Clean Passes' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterOutcome(f.id)}
              className={`px-3 py-1.5 rounded-control text-xs font-medium transition-surface shrink-0 ${
                filterOutcome === f.id
                  ? 'bg-charcoal-900 dark:bg-white text-white dark:text-black font-semibold shadow-soft-sm'
                  : 'text-zinc-500 hover:text-charcoal-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Sort toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 rounded-control border border-black/5 dark:border-white/5 text-zinc-500 hover:text-charcoal-900 dark:hover:text-white ml-2 transition-colors"
            title={`Sort order: ${sortOrder.toUpperCase()}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-panel bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 overflow-hidden shadow-soft-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400">Loading audit records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-xs text-zinc-400">
            <FileText className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
            <p>No matching inspection records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3 px-4">Inspection Ref</th>
                  <th className="py-3 px-4">Target Product Master</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Findings Breakdown</th>
                  <th className="py-3 px-4">Screening Outcome</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filtered.map(insp => {
                  const issues = insp.summary?.potentialIssues || 0;
                  const reviews = insp.summary?.reviewRequired || 0;
                  const passed = insp.summary?.passedChecks || 0;

                  return (
                    <tr
                      key={insp.id}
                      onClick={() => navigate(`/inspections/${insp.id}`)}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-charcoal-900 dark:text-zinc-100">
                        {insp.inspectionNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-charcoal-800 dark:text-zinc-200">
                          {insp.productSnapshot?.name}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400">
                          SKU: {insp.productSnapshot?.sku} • {insp.productSnapshot?.brand}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(insp.createdAt).toLocaleDateString()} {new Date(insp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {issues > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold">
                              {issues} {issues === 1 ? 'Issue' : 'Issues'}
                            </span>
                          )}
                          {reviews > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                              {reviews} Review
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-zinc-500">
                            {passed} Passed
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {insp.finalDecision && insp.finalDecision !== 'pending' ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            insp.finalDecision === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          }`}>
                            {insp.finalDecision.replace(/_/g, ' ')}
                          </span>
                        ) : issues > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-500/10 text-red-600 dark:text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Red Flags Active
                          </span>
                        ) : reviews > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Review Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Clean Pass
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleDownloadPdf(e, insp)}
                            disabled={downloadingId === insp.id}
                            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-zinc-400 hover:text-charcoal-900 dark:hover:text-white transition-colors"
                            title="Download PDF Screening Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
