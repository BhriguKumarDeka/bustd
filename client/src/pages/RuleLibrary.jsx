import React, { useState, useEffect } from 'react';
import { 
  BookOpenCheck, 
  ToggleLeft, 
  ToggleRight, 
  Info, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import Modal from '../components/Modal';

export default function RuleLibrary() {
  const { addToast } = useSystem();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRuleDetail, setSelectedRuleDetail] = useState(null);

  const loadRules = async () => {
    try {
      const res = await api.getRules();
      setRules(res.data || []);
    } catch (err) {
      addToast(`Failed to load rules: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggleStatus = async (rule) => {
    const nextStatus = rule.status === 'enabled' ? 'disabled' : 'enabled';
    try {
      await api.toggleRuleStatus(rule.ruleId, nextStatus);
      addToast(`Rule ${rule.ruleId} set to ${nextStatus.toUpperCase()}`, 'success');
      loadRules();
    } catch (err) {
      addToast(`Failed to update rule: ${err.message}`, 'error');
    }
  };

  const filtered = rules.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      r.ruleId?.toLowerCase().includes(q) ||
      r.name?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.legalReference?.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedPillar !== 'all' && r.pillar !== selectedPillar) return false;
    return true;
  });

  const pillars = [
    { id: 'all', label: 'All Pillars' },
    { id: 'legal_metrology', label: 'Statutory Legal Metrology' },
    { id: 'product_master', label: 'Product Master Consistency' },
    { id: 'brand_identity', label: 'Brand Identity & Geometry' },
    { id: 'visual_legibility', label: 'Visual Legibility & Contrast' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-palette-dark dark:text-palette-sand tracking-tight">
            Deterministic Rule Library
          </h2>
          <p className="text-xs text-olive-500 dark:text-olive-400 mt-1">
            Machine-checkable statutory declarations and SKU master constraints. Only enabled rules evaluate during an inspection run.
          </p>
        </div>

        {/* Legal Disclaimer Pill */}
        <div className="p-2.5 rounded-panel bg-palette-cream/20 dark:bg-[#25241E] border border-palette-cream/30 text-palette-dark dark:text-palette-cream text-xs flex items-center gap-2 max-w-md">
          <Info className="w-4 h-4 shrink-0 text-palette-olive dark:text-palette-cream" />
          <span className="text-[11px] leading-tight">
            Illustrative demo rules for capstone evaluation. Not certified legal advice or official government enforcement regulations.
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-soft-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-olive-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search rules by ID, legal citation, or field..."
            className="w-full pl-9 pr-3 py-1.5 rounded-input bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-palette-dark dark:text-palette-sand placeholder-olive-400 text-xs focus:outline-none"
          />
        </div>

        {/* Pillar filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {pillars.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPillar(p.id)}
              className={`px-3 py-1.5 rounded-control text-xs font-medium transition-surface shrink-0 ${
                selectedPillar === p.id
                  ? 'bg-palette-dark text-palette-sand dark:bg-palette-sand dark:text-palette-dark font-semibold shadow-soft-sm'
                  : 'text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Table / Cards */}
      <div className="divide-y divide-black/5 dark:divide-white/5 rounded-panel bg-white dark:bg-[#1E1D18] border border-black/5 dark:border-white/5 overflow-hidden shadow-soft-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-olive-400">Loading rule registry...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-olive-400 space-y-2">
            <BookOpenCheck className="w-8 h-8 mx-auto text-olive-300 dark:text-olive-600" />
            <p>No matching rules found in active catalog.</p>
          </div>
        ) : (
          filtered.map(rule => {
            const isEnabled = rule.status === 'enabled';

            return (
              <div
                key={rule.ruleId}
                onClick={() => setSelectedRuleDetail(rule)}
                className="p-4 sm:p-5 hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-palette-dark dark:text-palette-sand">
                      {rule.ruleId}
                    </span>
                    <span className="text-olive-300 dark:text-olive-600">•</span>
                    <span className="font-semibold text-xs text-palette-dark dark:text-palette-sand">
                      {rule.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-black/5 dark:bg-white/5 text-olive-400">
                      v{rule.version}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                      rule.severity === 'critical' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-black/5 dark:bg-white/5 text-olive-400'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>

                  <p className="text-xs text-olive-600 dark:text-olive-300 leading-relaxed font-sans">
                    {rule.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-olive-400 pt-0.5">
                    <span>Pillar: {rule.pillar.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span>Citation: {rule.legalReference}</span>
                  </div>
                </div>

                {/* Status Toggle & Details Trigger */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleStatus(rule)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-mono font-medium transition-surface ${
                      isEnabled
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-black/5 dark:bg-white/5 text-olive-400 border border-black/5 dark:border-white/5'
                    }`}
                  >
                    {isEnabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-olive-400" />}
                    <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rule Detail Modal */}
      <Modal
        isOpen={!!selectedRuleDetail}
        onClose={() => setSelectedRuleDetail(null)}
        title={selectedRuleDetail ? `${selectedRuleDetail.ruleId} — ${selectedRuleDetail.name}` : ''}
        subtitle={selectedRuleDetail?.legalReference}
        maxWidth="max-w-xl"
      >
        {selectedRuleDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-control bg-raised-light dark:bg-[#282721] border border-black/5 dark:border-white/5 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-olive-400">Rule Pillar:</span>
                <span className="text-palette-dark dark:text-palette-sand capitalize">
                  {selectedRuleDetail.pillar.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-olive-400">Validation Algorithm:</span>
                <span className="text-palette-dark dark:text-palette-sand">
                  {selectedRuleDetail.validationType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-olive-400">Severity Level:</span>
                <span className={`uppercase font-bold ${
                  selectedRuleDetail.severity === 'critical' ? 'text-red-500' : 'text-olive-400'
                }`}>
                  {selectedRuleDetail.severity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-olive-400">Version:</span>
                <span className="text-palette-dark dark:text-palette-sand">
                  v{selectedRuleDetail.version}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-palette-dark dark:text-palette-sand block">
                Rule Definition &amp; Logic
              </span>
              <p className="text-olive-600 dark:text-olive-300 leading-relaxed font-sans">
                {selectedRuleDetail.description}
              </p>
            </div>

            {selectedRuleDetail.testCasesSummary && (
              <div className="space-y-1">
                <span className="font-semibold text-palette-dark dark:text-palette-sand block">
                  Ground-Truth Boundary Test Cases
                </span>
                <div className="p-2.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[11px] text-palette-dark dark:text-palette-sand">
                  {selectedRuleDetail.testCasesSummary}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
              <span className="text-[11px] text-olive-400">
                Current Execution Status: <strong className="uppercase text-palette-dark dark:text-palette-sand">{selectedRuleDetail.status}</strong>
              </span>
              <button
                onClick={() => {
                  handleToggleStatus(selectedRuleDetail);
                  setSelectedRuleDetail(null);
                }}
                className="px-4 py-2 rounded-input bg-palette-dark dark:bg-palette-sand text-palette-sand dark:text-palette-dark font-medium"
              >
                {selectedRuleDetail.status === 'enabled' ? 'Disable Rule' : 'Enable Rule'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
