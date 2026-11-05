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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-bustd flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                The BUSTD Inspection Story
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
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
                    ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm border-slate-900 dark:border-white/20'
                    : 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                }`}
              >
                {/* Step badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${isSelected ? 'text-pink-400' : 'text-slate-400'}`}>
                    STAGE {s.num}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-300' : 'text-slate-400'}`} />
                </div>

                <div className={`text-xs font-semibold leading-snug line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {s.title}
                </div>

                <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
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
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <span className="font-semibold text-slate-900 dark:text-white">
                {steps[activeStep].title}:
              </span>{' '}
              <span className="text-slate-600 dark:text-slate-300">
                {steps[activeStep].desc}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {steps[activeStep].detail}
              </p>
            </div>

            {onStartScan && (
              <button
                type="button"
                onClick={onStartScan}
                className="btn-shimmer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-bustd shrink-0 shadow-sm hover:opacity-95 transition-opacity"
              >
                <span>Try Demo Scan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
