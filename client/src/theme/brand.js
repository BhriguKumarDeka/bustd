// BUSTD Brand Identity & Visual Design Tokens
// Inspired by modern editorial design, double-layer interfaces, and the radiant multi-hue noise gradient.

export const BRAND = {
  name: 'BUSTD',
  tagline: 'Spot the red flags.',
  version: 'v1.2.0',
  standard: 'Legal Metrology (Packaged Commodities) Rules 2011 & SKU Master Integrity',
  
  // Vibrant multi-hue gradient transition from reference snapshot (Image 3)
  // Sky Blue -> Radiant Indigo -> Magenta/Pink -> Tangerine Orange
  gradient: {
    css: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 28%, #C084FC 52%, #EC4899 74%, #F97316 100%)',
    horizontal: 'linear-gradient(90deg, #38BDF8 0%, #818CF8 30%, #EC4899 70%, #F97316 100%)',
    subtle: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(129, 140, 248, 0.12) 28%, rgba(236, 72, 153, 0.12) 74%, rgba(249, 115, 22, 0.12) 100%)',
    stops: ['#38BDF8', '#818CF8', '#C084FC', '#EC4899', '#F97316'],
    glow: '0 0 24px -2px rgba(236, 72, 153, 0.45), 0 0 10px -1px rgba(56, 189, 248, 0.35)',
  },

  // Color tokens from the specification
  palette: {
    dark: '#3A382F',     // Deep warm olive-charcoal
    olive: '#615E50',    // Muted warm olive/sage
    cream: '#E0DDBD',    // Warm alabaster cream
    sand: '#F7F5EC',     // Warm canvas light
    pureWhite: '#FFFFFF',
    darkSurface: '#1C1B17',
    darkRaised: '#24231E',
  },

  // Tri-State evaluation tokens
  status: {
    potential_issue: {
      label: 'Potential Issue',
      shortLabel: 'Issue',
      color: '#DC2626',
      bgLight: 'bg-red-500/10',
      textLight: 'text-red-700 dark:text-red-400',
      borderLight: 'border-red-500/25',
      dot: 'bg-red-500',
    },
    review_required: {
      label: 'Review Required',
      shortLabel: 'Review',
      color: '#D97706',
      bgLight: 'bg-amber-500/10',
      textLight: 'text-amber-800 dark:text-amber-400',
      borderLight: 'border-amber-500/25',
      dot: 'bg-amber-500',
    },
    no_issue_detected: {
      label: 'No Issue Detected',
      shortLabel: 'Passed',
      color: '#16A34A',
      bgLight: 'bg-emerald-500/10',
      textLight: 'text-emerald-700 dark:text-emerald-400',
      borderLight: 'border-emerald-500/25',
      dot: 'bg-emerald-500',
    }
  },

  // Inspection Journey Stages for Storytelling
  stages: [
    {
      step: '01',
      title: 'Master Baseline',
      subtitle: 'Authoritative SKU data',
      desc: 'Connects the official ERP master specifications: declared MRP, net quantity, legal manufacturer, and country of origin.',
    },
    {
      step: '02',
      title: 'Artwork Ingestion',
      subtitle: 'Multi-panel packaging proofs',
      desc: 'Ingests high-resolution dielines across PDP front, back, and side panels in PNG, JPG, or PDF.',
    },
    {
      step: '03',
      title: 'Spatial Metrology AI',
      subtitle: 'Text extraction & OCR confidence',
      desc: 'Normalizes character bounding polygons and scores OCR readability. Low confidence is flagged as Review Required, never assumed absent.',
    },
    {
      step: '04',
      title: 'Human Sign-Off',
      subtitle: 'Traceable compliance audit',
      desc: 'Senior packaging auditors review spatial evidence, confirm or dismiss red flags with reasons, and generate signed PDF certificates.',
    }
  ]
};
