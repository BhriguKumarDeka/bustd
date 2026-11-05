import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import DoubleLayerCard from '../components/DoubleLayerCard';

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
    { id: 'legal_metrology', label: 'Statutory Metrology' },
    { id: 'product_master', label: 'Master Consistency' },
    { id: 'brand_identity', label: 'Brand Identity' },
    { id: 'visual_legibility', label: 'Visual Legibility' }
  ];

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
            Deterministic Compliance Rule Library
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Machine-checkable statutory declarations and SKU master constraints.
          </p>
        </div>

        {/* Legal Disclaimer Pill */}
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2 max-w-md">
          <Info className="w-4 h-4 shrink-0 text-slate-500" />
          <span className="text-[11px] leading-tight">
            Illustrative demo rules for capstone evaluation. Only enabled rules evaluate during an inspection run.
          </span>
        </div>
      </div>

      {/* Filter & Search Bar with Double Layer */}
      <DoubleLayerCard innerClassName="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search rules by ID, citation, or description..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {pillars.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(p.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  selectedPillar === p.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </DoubleLayerCard>

      {/* Rules Table / Cards */}
      <DoubleLayerCard innerClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <div className="w-6 h-6 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
            <p>Loading deterministic rule library...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No rules match your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map(rule => {
              const isEnabled = rule.status === 'enabled';
              return (
                <div
                  key={rule.ruleId}
                  className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {rule.ruleId}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {rule.name}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                        {rule.pillar.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        v{rule.version}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed max-w-3xl">
                      {rule.description}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                      <span>Legal Citation: {rule.legalReference}</span>
                      <span>•</span>
                      <span className="capitalize">Target: {rule.applicability}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-start md:self-auto">
                    <button
                      onClick={() => setSelectedRuleDetail(rule)}
                      className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline font-mono"
                    >
                      Inspect Logic
                    </button>

                    <button
                      onClick={() => handleToggleStatus(rule)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                      {isEnabled ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                            ENABLED
                          </span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                          <span className="font-mono text-[10px] uppercase text-slate-400">
                            DISABLED
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DoubleLayerCard>

      {/* RULE DETAILS MODAL */}
      <Modal
        isOpen={!!selectedRuleDetail}
        onClose={() => setSelectedRuleDetail(null)}
        title={selectedRuleDetail ? `${selectedRuleDetail.ruleId}: ${selectedRuleDetail.name}` : ''}
        subtitle="Specification and validation mechanics"
      >
        {selectedRuleDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Description &amp; Intent</span>
              <p className="text-slate-900 dark:text-white leading-relaxed">
                {selectedRuleDetail.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04]">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Pillar Category</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {selectedRuleDetail.pillar.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04]">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Validation Engine Type</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {selectedRuleDetail.validationType}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Statutory Reference</span>
              <p className="font-mono text-[11px] text-slate-900 dark:text-white">
                {selectedRuleDetail.legalReference}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRuleDetail(null)}
                className="btn-shimmer px-4 py-2 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold"
              >
                Close Rule Specs
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
