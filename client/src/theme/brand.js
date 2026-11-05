// BUSTD Brand Identity & Visual Design Tokens
// Modern editorial design, pure neutral gray/black palette, and radiant multi-hue noise gradient.

export const BRAND = {
  name: 'BUSTD',
  tagline: 'Spot the red flags.',
  version: 'v1.2.0',
  
  // Vibrant multi-hue gradient transition from reference snapshot (Image 3)
  // Sky Blue -> Radiant Indigo -> Magenta/Pink -> Tangerine Orange
  gradient: {
    css: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 28%, #C084FC 52%, #EC4899 74%, #F97316 100%)',
    horizontal: 'linear-gradient(90deg, #38BDF8 0%, #818CF8 30%, #EC4899 70%, #F97316 100%)',
    subtle: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(129, 140, 248, 0.12) 28%, rgba(236, 72, 153, 0.12) 74%, rgba(249, 115, 22, 0.12) 100%)',
    stops: ['#38BDF8', '#818CF8', '#C084FC', '#EC4899', '#F97316'],
    glow: '0 0 24px -2px rgba(236, 72, 153, 0.45), 0 0 10px -1px rgba(56, 189, 248, 0.35)',
  },

  // Pure neutral color tokens (zero chromatic blue/olive cast)
  palette: {
    dark: '#171717',         // Neutral 900
    neutralMuted: '#737373', // Neutral 500
    neutralLight: '#F5F5F5', // Neutral 100
    canvasLight: '#FAFAFA',  // Neutral 50
    canvasDark: '#0A0A0C',   // Neutral 950 deep canvas
    pureWhite: '#FFFFFF',
    darkSurface: '#141416',
    darkRaised: '#1E1E22',
  },

  // Tri-State evaluation tokens
  status: {
    potential_issue: {
      label: 'Potential Issue',
      shortLabel: 'Issue',
      color: '#EF4444',
      bgLight: 'bg-red-500/10',
      textLight: 'text-red-600 dark:text-red-400',
      borderLight: 'border-red-500/25',
      dot: 'bg-red-500',
    },
    review_required: {
      label: 'Review Required',
      shortLabel: 'Review',
      color: '#F59E0B',
      bgLight: 'bg-amber-500/10',
      textLight: 'text-amber-700 dark:text-amber-400',
      borderLight: 'border-amber-500/25',
      dot: 'bg-amber-500',
    },
    no_issue_detected: {
      label: 'No Issue Detected',
      shortLabel: 'Passed',
      color: '#10B981',
      bgLight: 'bg-emerald-500/10',
      textLight: 'text-emerald-600 dark:text-emerald-400',
      borderLight: 'border-emerald-500/25',
      dot: 'bg-emerald-500',
    }
  },

  // Inspection Journey Stages
  stages: [
    {
      step: '01',
      title: 'Master Baseline',
      subtitle: 'Authoritative SKU data',
      desc: 'Connects the official ERP master specifications: declared MRP, net quantity, legal manufacturer, and country of origin.',
    },
    {
      step: '02',
      title: 'Pack Format Template',
      subtitle: 'Dieline geometry & panels',
      desc: 'Selects the exact packaging structure (e.g. Tuck-End Carton, Pillow Pouch, Bottle Wrap) so AI knows label directions and panel mapping.',
    },
    {
      step: '03',
      title: 'Artwork Ingestion',
      subtitle: 'Multi-panel packaging proofs',
      desc: 'Ingests high-resolution dielines across PDP front, back, and side panels in PNG, JPG, or PDF.',
    },
    {
      step: '04',
      title: 'Spatial Metrology AI',
      subtitle: 'Text extraction & OCR confidence',
      desc: 'Normalizes character bounding polygons and scores OCR readability. Low confidence is flagged as Review Required, never assumed absent.',
    },
    {
      step: '05',
      title: 'Human Sign-Off',
      subtitle: 'Traceable compliance audit',
      desc: 'Senior packaging auditors review spatial evidence, confirm or dismiss red flags with reasons, and generate signed PDF certificates.',
    }
  ]
};
