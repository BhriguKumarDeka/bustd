import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Layers, 
  Sparkles, 
  Check, 
  Search, 
  ChevronRight,
  PackageCheck
} from 'lucide-react';

export const PACK_FORMATS = [
  // RIGID & SEMI-RIGID
  {
    id: 'tuck-end-carton',
    name: 'Tuck-End Carton',
    category: 'Rigid & Semi-Rigid',
    subtitle: 'Carton with tuck-in top and bottom flaps',
    panels: ['Front (PDP)', 'Back (Declarations)', 'Left Side', 'Right Side', 'Top Flap'],
    dielineType: '6-panel folding dieline',
    iconType: 'carton-tuck',
    popular: true,
  },
  {
    id: 'folding-carton-box',
    name: 'Carton Box (Folding)',
    category: 'Rigid & Semi-Rigid',
    subtitle: 'Folding paperboard outer carton',
    panels: ['Front', 'Back', 'Sides', 'Bottom'],
    dielineType: 'Standard folding dieline',
    iconType: 'carton-box',
    popular: true,
  },
  {
    id: 'sleeve-wraparound',
    name: 'Sleeve / Wraparound',
    category: 'Rigid & Semi-Rigid',
    subtitle: 'Sleeve over a tray, bottle, or inner pack',
    panels: ['Top Face', 'Bottom Face', 'Sides'],
    dielineType: 'Continuous wraparound',
    iconType: 'sleeve',
  },
  {
    id: 'tin-box-container',
    name: 'Tin Box / Metal Container',
    category: 'Rigid & Semi-Rigid',
    subtitle: 'Printed tin container with fitted lid',
    panels: ['Lid Top', 'Body Circumference', 'Base'],
    dielineType: 'Metal print dieline',
    iconType: 'tin-box',
  },
  {
    id: 'metal-can',
    name: 'Metal Can',
    category: 'Rigid & Semi-Rigid',
    subtitle: 'Cylindrical metal can with 360° print',
    panels: ['Cylinder Body 360°', 'End Lid'],
    dielineType: 'Cylindrical wrap',
    iconType: 'can',
  },
  {
    id: 'tray-lidding-film',
    name: 'Tray with Lidding Film',
    category: 'Rigid & Semi-Rigid',
    subtitle: 'Thermoformed tray with peelable film',
    panels: ['Top Film', 'Tray Base Label'],
    dielineType: '2-piece seal',
    iconType: 'tray',
  },
  {
    id: 'clamshell',
    name: 'Clamshell',
    category: 'Rigid & Semi-Rigid',
    subtitle: 'Hinged thermoformed blister container',
    panels: ['Face Insert Card', 'Back Card'],
    dielineType: 'Blister insert card',
    iconType: 'clamshell',
  },

  // FLEXIBLE PACKAGING
  {
    id: 'stand-up-pouch',
    name: 'Stand-Up Pouch (Doypack)',
    category: 'Flexible Packaging',
    subtitle: 'Self-standing pouch with bottom gusset',
    panels: ['Front Panel (PDP)', 'Back (Mandatory Info)', 'Bottom Gusset'],
    dielineType: '3-panel flexible web',
    iconType: 'pouch-stand',
    popular: true,
  },
  {
    id: 'pillow-pouch',
    name: 'Pillow Pouch',
    category: 'Flexible Packaging',
    subtitle: 'Fin-sealed flexible pouch with central back seal',
    panels: ['Front PDP', 'Back Left Half', 'Back Right Half'],
    dielineType: 'Fin-seal web',
    iconType: 'pouch-pillow',
  },
  {
    id: 'gusset-pouch',
    name: 'Gusset Pouch',
    category: 'Flexible Packaging',
    subtitle: 'Side-gusset flat-bottom bag',
    panels: ['Front', 'Back', 'Left Gusset', 'Right Gusset', 'Bottom'],
    dielineType: 'Quad-seal bag',
    iconType: 'pouch-gusset',
  },
  {
    id: 'sachet-single-serve',
    name: 'Sachet / Single Serve',
    category: 'Flexible Packaging',
    subtitle: 'Small flat-sealed multi-layer packet',
    panels: ['Front Face', 'Back Face'],
    dielineType: '4-side seal flat',
    iconType: 'sachet',
  },
  {
    id: 'flow-wrap',
    name: 'Flow Wrap',
    category: 'Flexible Packaging',
    subtitle: 'Continuous horizontal film wrap',
    panels: ['Top Face', 'Bottom Fin', 'Side Folds'],
    dielineType: 'HFFS continuous roll',
    iconType: 'flow-wrap',
  },
  {
    id: 'stick-pack',
    name: 'Stick Pack',
    category: 'Flexible Packaging',
    subtitle: 'Long, narrow tubular flexible pack',
    panels: ['Front Strip', 'Back Seam Strip'],
    dielineType: 'VFFS stick tube',
    iconType: 'stick-pack',
  },

  // BOTTLE & JAR LABELS
  {
    id: 'bottle-continuous-wrap',
    name: 'Bottle Label — Continuous Wrap',
    category: 'Bottle & Jar Labels',
    subtitle: 'Single continuous label wrapped around body',
    panels: ['Continuous Label 360°'],
    dielineType: 'Single flat adhesive roll',
    iconType: 'bottle-wrap',
    popular: true,
  },
  {
    id: 'bottle-front-back',
    name: 'Bottle Label — Front & Back',
    category: 'Bottle & Jar Labels',
    subtitle: 'Two separate front and back label stickers',
    panels: ['Front Label (PDP)', 'Back Label (Declarations)'],
    dielineType: '2-part cut label',
    iconType: 'bottle-fb',
  },
  {
    id: 'jar-label-wrap',
    name: 'Jar Label — Wrap & Lid',
    category: 'Bottle & Jar Labels',
    subtitle: 'Full wrap label on glass/PET jar with lid sticker',
    panels: ['Body Wrap', 'Lid Top Seal'],
    dielineType: 'Jar label set',
    iconType: 'jar-wrap',
  },
  {
    id: 'tube-crimped',
    name: 'Tube (Crimped End)',
    category: 'Bottle & Jar Labels',
    subtitle: 'Laminate or plastic tube with crimped bottom',
    panels: ['Front Body', 'Back Body', 'Crimp Margin'],
    dielineType: 'Tubular print dieline',
    iconType: 'tube',
  },

  // MULTIPACK & SECONDARY
  {
    id: 'display-tray-shipper',
    name: 'Display Tray / Shipper',
    category: 'Multipack & Secondary',
    subtitle: 'Printed corrugated board display tray',
    panels: ['Front Header', 'Side Walls', 'Back Display'],
    dielineType: 'Shelf-ready packaging (SRP)',
    iconType: 'tray-shipper',
  },
  {
    id: 'shrink-wrap-bundle',
    name: 'Shrink Wrap Bundle',
    category: 'Multipack & Secondary',
    subtitle: 'Poly film shrink wrapped around multipack unit',
    panels: ['Top Face', 'Bulls-eye Sides'],
    dielineType: 'Shrink sleeve',
    iconType: 'bundle',
  }
];

// Technical SVG Wireframe Icon for each pack format
function PackFormatWireframe({ type, isSelected }) {
  const stroke = isSelected ? '#EC4899' : 'currentColor';

  switch (type) {
    case 'carton-tuck':
    case 'carton-box':
      return (
        <svg viewBox="0 0 48 48" className="w-9 h-9 shrink-0 stroke-[1.6] fill-none" stroke={stroke}>
          <polygon points="14,12 34,12 40,18 20,18" />
          <polygon points="14,12 20,18 20,38 14,32" />
          <polygon points="20,18 40,18 40,38 20,38" />
          <line x1="20" y1="18" x2="20" y2="38" strokeDasharray="2 2" />
          <line x1="14" y1="12" x2="20" y2="18" />
          <line x1="34" y1="12" x2="40" y2="18" />
        </svg>
      );
    case 'pouch-stand':
      return (
        <svg viewBox="0 0 48 48" className="w-9 h-9 shrink-0 stroke-[1.6] fill-none" stroke={stroke}>
          <path d="M18,10 L30,10 L36,36 C36,39 28,41 24,41 C20,41 12,39 12,36 Z" />
          <line x1="17" y1="14" x2="31" y2="14" />
          <path d="M14,35 C18,37 30,37 34,35" strokeDasharray="2 2" />
        </svg>
      );
    case 'pouch-pillow':
      return (
        <svg viewBox="0 0 48 48" className="w-9 h-9 shrink-0 stroke-[1.6] fill-none" stroke={stroke}>
          <rect x="15" y="10" width="18" height="28" rx="2" />
          <line x1="15" y1="14" x2="33" y2="14" />
          <line x1="15" y1="34" x2="33" y2="34" />
          <line x1="24" y1="14" x2="24" y2="34" strokeDasharray="2 2" />
        </svg>
      );
    case 'bottle-wrap':
    case 'bottle-fb':
      return (
        <svg viewBox="0 0 48 48" className="w-9 h-9 shrink-0 stroke-[1.6] fill-none" stroke={stroke}>
          <path d="M21,10 L27,10 L27,14 L31,18 L31,38 L17,38 L17,18 L21,14 Z" />
          <rect x="17" y="22" width="14" height="12" rx="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'can':
    case 'tin-box':
      return (
        <svg viewBox="0 0 48 48" className="w-9 h-9 shrink-0 stroke-[1.6] fill-none" stroke={stroke}>
          <ellipse cx="24" cy="14" rx="10" ry="4" />
          <ellipse cx="24" cy="36" rx="10" ry="4" />
          <line x1="14" y1="14" x2="14" y2="36" />
          <line x1="34" y1="14" x2="34" y2="36" />
        </svg>
      );
    case 'tube':
      return (
        <svg viewBox="0 0 48 48" className="w-9 h-9 shrink-0 stroke-[1.6] fill-none" stroke={stroke}>
          <path d="M18,12 L30,12 L32,32 L16,32 Z" />
          <rect x="20" y="32" width="8" height="6" rx="1" />
          <line x1="16" y1="12" x2="32" y2="12" strokeWidth="2.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className="w-9 h-9 shrink-0 stroke-[1.6] fill-none" stroke={stroke}>
          <rect x="14" y="14" width="20" height="20" rx="3" />
          <line x1="14" y1="24" x2="34" y2="24" strokeDasharray="2 2" />
        </svg>
      );
  }
}

export default function PackFormatSelector({ selectedFormatId, onSelectFormat }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Rigid & Semi-Rigid',
    'Flexible Packaging',
    'Bottle & Jar Labels',
    'Multipack & Secondary'
  ];

  const filtered = PACK_FORMATS.filter(format => {
    const matchesCat = activeCategory === 'All' || format.category === activeCategory;
    const matchesQuery = 
      format.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      format.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const selectedFormat = PACK_FORMATS.find(f => f.id === selectedFormatId) || PACK_FORMATS[0];

  return (
    <div className="space-y-6">
      {/* Category Pills & Search with Butter Sliding Tab */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Sliding Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`relative px-3.5 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryMorph"
                    className="absolute inset-0 bg-surface rounded-xl shadow-soft-sm border border-subtle"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search pack templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-subtle border border-subtle text-xs text-primary placeholder:text-muted focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Grid of Pack Format Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
        {filtered.map((format) => {
          const isSelected = selectedFormatId === format.id;
          return (
            <motion.div
              key={format.id}
              onClick={() => onSelectFormat(format)}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-2xl cursor-pointer transition-all relative flex flex-col justify-between border ${
                isSelected
                  ? 'bg-surface border-pink-500/50 shadow-soft-md ring-2 ring-pink-500/30'
                  : 'bg-surface border-subtle hover:border-border-muted'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Wireframe & Popular Badge */}
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-pink-500/10 text-pink-500' : 'bg-surface-subtle text-secondary'
                  }`}>
                    <PackFormatWireframe type={format.iconType} isSelected={isSelected} />
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-bustd text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  ) : format.popular ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-surface-subtle text-muted">
                      Standard
                    </span>
                  ) : null}
                </div>

                {/* Title & Description */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted mb-0.5">
                    {format.category}
                  </div>
                  <h4 className="text-xs font-semibold text-primary leading-snug">
                    {format.name}
                  </h4>
                  <p className="text-[11px] text-secondary mt-1 leading-snug line-clamp-2">
                    {format.subtitle}
                  </p>
                </div>
              </div>

              {/* Panel Expectations Breakdown */}
              <div className="pt-3 mt-3 border-t border-subtle space-y-1 text-[10px] font-mono">
                <span className="text-muted block uppercase">Expected Panels:</span>
                <div className="flex flex-wrap gap-1">
                  {format.panels.slice(0, 3).map((p) => (
                    <span key={p} className="px-1.5 py-0.2 rounded bg-surface-subtle text-secondary truncate max-w-[120px]">
                      {p}
                    </span>
                  ))}
                  {format.panels.length > 3 && (
                    <span className="px-1.5 py-0.2 rounded bg-surface-subtle text-muted">
                      +{format.panels.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Format Summary Bar */}
      {selectedFormat && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-surface border border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-primary">
                Selected Template: {selectedFormat.name}
              </div>
              <p className="text-[11px] text-muted font-mono">
                Dieline: {selectedFormat.dielineType} • Ingests {selectedFormat.panels.join(', ')}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            3D Direction Fixed
          </span>
        </motion.div>
      )}
    </div>
  );
}
