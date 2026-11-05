import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  UploadCloud, 
  Scan, 
  CheckCircle, 
  ChevronRight, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { BRAND } from '../theme/brand';

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
      title: 'Artwork Panel Ingestion',
      role: 'Physical Evidence',
      icon: UploadCloud,
      desc: 'Ingests packaging dielines across Principal Display (PDP), Back Informational, and Side Gussets.',
      detail: 'Actual artwork images are rendered directly on the inspection canvas with millimeter-accurate spatial bounding polygons.'
    },
    {
      num: '03',
      title: 'Metrology Intelligence',
      role: 'Deterministic Engine',
      icon: Scan,
      desc: 'Evaluates statutory Legal Metrology rules, checks font legibility, and flags mismatches as Red Flags.',
      detail: 'Missing text due to glare is flagged as "Review Required" — absence is never assumed from missing evidence.'
    },
    {
      num: '04',
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
        {/* Header with Radiant Sparkle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-bustd flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-palette-dark dark:text-palette-sand">
                The BUSTD Inspection Story
              </h3>
              <p className="text-xs text-olive-500 dark:text-olive-400">
                How AI and packaging auditors collaborate in 4 transparent stages
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
                    ? 'bg-palette-dark text-palette-sand dark:bg-palette-sand dark:text-palette-dark font-bold shadow-sm'
                    : 'text-olive-500 hover:text-palette-dark dark:hover:text-palette-sand hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {s.num}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Step Visual Flow Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <motion.div
                key={s.num}
                onClick={() => setActiveStep(idx)}
                whileHover={{ y: -1 }}
                className={`p-3.5 rounded-xl cursor-pointer transition-all relative text-left ${
                  isSelected
                    ? 'bg-palette-dark text-palette-sand dark:bg-[#2A2922] dark:text-palette-sand shadow-sm ring-1 ring-black/10 dark:ring-white/10'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                }`}
              >
                {/* Step badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${isSelected ? 'text-pink-300' : 'text-olive-500 dark:text-olive-400'}`}>
                    STAGE {s.num}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-300' : 'text-olive-400'}`} />
                </div>

                <div className={`text-xs font-semibold leading-snug ${isSelected ? 'text-white' : 'text-palette-dark dark:text-palette-sand'}`}>
                  {s.title}
                </div>

                <div className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-palette-sand/70' : 'text-olive-500 dark:text-olive-400'}`}>
                  {s.role}
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="storyActiveIndicator"
                    className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-bustd rounded-full"
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
            className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <span className="font-semibold text-palette-dark dark:text-palette-sand">
                {steps[activeStep].title}:
              </span>{' '}
              <span className="text-olive-600 dark:text-olive-300">
                {steps[activeStep].desc}
              </span>
              <p className="text-[11px] text-olive-500 dark:text-olive-400 italic">
                {steps[activeStep].detail}
              </p>
            </div>

            {onStartScan && (
              <button
                type="button"
                onClick={onStartScan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-bustd shrink-0 shadow-sm hover:opacity-95 transition-opacity"
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
