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
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
          <h2 className="text-lg sm:text-xl font-semibold text-primary tracking-tight">
            Deterministic Compliance Rule Library
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Machine-checkable statutory declarations and SKU master constraints.
          </p>
        </div>

        {/* Legal Disclaimer Pill */}
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-subtle text-secondary text-xs flex items-center gap-2 max-w-md">
          <Info className="w-4 h-4 shrink-0 text-muted" />
          <span className="text-[11px] leading-tight">
            Illustrative demo rules for capstone evaluation. Only enabled rules evaluate during an inspection run.
          </span>
        </div>
      </div>

      {/* Filter & Search Bar with Double Layer */}
      <DoubleLayerCard innerClassName="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="w-full md:w-80">
            <Input
              icon={Search}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search rules by ID, citation, or description..."
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {pillars.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(p.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  selectedPillar === p.id
                    ? 'tactile-active-nav font-semibold shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-surface-interactive'
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
          <div className="p-12 text-center text-xs text-muted space-y-2">
            <div className="w-6 h-6 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
            <p>Loading deterministic rule library...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">
            No rules match your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-subtle">
            {filtered.map(rule => {
              const isEnabled = rule.status === 'enabled';
              return (
                <div
                  key={rule.ruleId}
                  className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-surface-subtle transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-primary">
                        {rule.ruleId}
                      </span>
                      <span className="text-muted">•</span>
                      <span className="font-semibold text-primary">
                        {rule.name}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {rule.pillar.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-muted font-mono text-[10px]">
                        v{rule.version}
                      </span>
                    </div>

                    <p className="text-secondary text-[11px] leading-relaxed max-w-3xl">
                      {rule.description}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-mono text-muted">
                      <span>Legal Citation: {rule.legalReference}</span>
                      <span>•</span>
                      <span className="capitalize">Target: {rule.applicability}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-start md:self-auto">
                    <button
                      onClick={() => setSelectedRuleDetail(rule)}
                      className="text-xs text-secondary hover:text-primary underline font-mono"
                    >
                      Inspect Logic
                    </button>

                    <button
                      onClick={() => handleToggleStatus(rule)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-subtle hover:bg-surface-interactive transition-colors"
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
                          <ToggleLeft className="w-5 h-5 text-muted" />
                          <span className="font-mono text-[10px] uppercase text-muted">
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
            <div className="p-3 rounded-xl bg-surface-subtle space-y-2">
              <span className="text-[10px] font-mono uppercase text-muted block">Description &amp; Intent</span>
              <p className="text-primary leading-relaxed">
                {selectedRuleDetail.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-subtle">
                <span className="text-[10px] font-mono uppercase text-muted block">Pillar Category</span>
                <span className="font-semibold text-primary capitalize">
                  {selectedRuleDetail.pillar.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle">
                <span className="text-[10px] font-mono uppercase text-muted block">Validation Engine Type</span>
                <span className="font-mono text-primary">
                  {selectedRuleDetail.validationType}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted block">Statutory Reference</span>
              <p className="font-mono text-[11px] text-primary">
                {selectedRuleDetail.legalReference}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={() => setSelectedRuleDetail(null)}
              >
                Close Rule Specs
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
