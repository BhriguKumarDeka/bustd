import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Box, 
  UploadCloud, 
  Scan, 
  CheckCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Button from './ui/Button';

export default function StoryGuide({ onStartScan }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'ERP Master Baseline',
      role: 'Source of Truth',
      icon: Database,
      desc: 'Connects expected product declarations: statutory MRP, Net Quantity, Legal Packer, and Country of Origin.',
      detail: 'Eliminates guesswork: packaging is verified against what was legally registered, not subjective interpretation.'
    },
    {
      num: '02',
      title: 'Pack Format Template',
      role: '3D Pack Geometry',
      icon: Box,
      desc: 'Pre-selects structural format (Tuck-End Carton, Pillow Pouch, Bottle Wrap) so AI knows label directions and panel mapping.',
      detail: 'Prevents spatial confusion by defining PDP front display, back informational panels, and flap boundaries before OCR.'
    },
    {
      num: '03',
      title: 'Artwork Panel Ingestion',
      role: 'Physical Evidence',
      icon: UploadCloud,
      desc: 'Ingests packaging dielines across Principal Display (PDP), Back Informational, and Side Gussets.',
      detail: 'Actual artwork images are rendered directly on the inspection canvas with millimeter-accurate spatial bounding polygons.'
    },
    {
      num: '04',
      title: 'Metrology Intelligence',
      role: 'Deterministic Engine',
      icon: Scan,
      desc: 'Evaluates compliance rules, checks font legibility, and flags mismatches as Red Flags.',
      detail: 'Missing text due to glare is flagged as "Review Required" — absence is never assumed from missing evidence.'
    },
    {
      num: '05',
      title: 'Auditor Decision Support',
      role: 'Traceable Sign-Off',
      icon: CheckCircle,
      desc: 'Senior packaging auditors confirm or dismiss red flags with mandatory reasons and issue signed certificates.',
      detail: 'Machine proposes, human disposes. Full audit log of all human actions is stored alongside original findings.'
    }
  ];

  return (
    <div className="double-layer-outer">
      <div className="double-layer-inner p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-bustd flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-primary">
                The BUSTD Inspection Story
              </h3>
              <p className="text-xs text-muted">
                How AI and packaging auditors collaborate in 5 transparent stages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {steps.map((s, idx) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all ${
                  activeStep === idx
                    ? 'bg-surface-raised text-primary font-bold shadow-sm border border-subtle'
                    : 'text-muted hover:text-primary hover:bg-surface-subtle'
                }`}
              >
                {s.num}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Step Visual Flow Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <motion.div
                key={s.num}
                onClick={() => setActiveStep(idx)}
                whileHover={{ y: -1 }}
                className={`p-3 rounded-xl cursor-pointer transition-all relative text-left border ${
                  isSelected
                    ? 'bg-surface-raised text-primary shadow-sm border-muted'
                    : 'bg-surface-subtle border-subtle hover:border-muted'
                }`}
              >
                {/* Step badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${isSelected ? 'text-pink-500' : 'text-muted'}`}>
                    STAGE {s.num}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-500' : 'text-muted'}`} />
                </div>

                <div className={`text-xs font-semibold leading-snug line-clamp-1 text-primary`}>
                  {s.title}
                </div>

                <div className={`text-[10px] mt-0.5 truncate text-muted`}>
                  {s.role}
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="storyActiveIndicator"
                    className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-bustd rounded-full"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Active Stage Expanded Narrative */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="p-3.5 rounded-xl bg-surface-subtle border border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <span className="font-semibold text-primary">
                {steps[activeStep].title}:
              </span>{' '}
              <span className="text-secondary">
                {steps[activeStep].desc}
              </span>
              <p className="text-[11px] text-muted italic">
                {steps[activeStep].detail}
              </p>
            </div>

            {onStartScan && (
              <Button
                variant="gradient"
                size="sm"
                onClick={onStartScan}
                icon={ArrowRight}
                className="shrink-0"
              >
                Try Demo Scan
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}