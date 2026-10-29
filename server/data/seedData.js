import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Generate realistic SVG artwork for the pen packaging
const penFrontSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f2b5c"/>
      <stop offset="60%" stop-color="#091b3a"/>
      <stop offset="100%" stop-color="#050e1f"/>
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#FFF2A3"/>
    </linearGradient>
  </defs>
  <!-- Card Background -->
  <rect width="600" height="900" rx="16" fill="url(#cardGrad)" stroke="#1a3d7c" stroke-width="2"/>
  
  <!-- Top Hanging Slot -->
  <rect x="250" y="24" width="100" height="18" rx="9" fill="#040912" stroke="#254a8a" stroke-width="1.5"/>

  <!-- Brand Header -->
  <g transform="translate(60, 90)">
    <text x="240" y="50" font-family="Inter, sans-serif" font-weight="900" font-size="54" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">Reynolds</text>
    <text x="240" y="85" font-family="Inter, sans-serif" font-weight="700" font-size="24" fill="url(#goldAccent)" text-anchor="middle" letter-spacing="4">045 CARBURE</text>
    <text x="240" y="112" font-family="Inter, sans-serif" font-weight="500" font-size="14" fill="#93C5FD" text-anchor="middle" letter-spacing="1">FINE CARBURE POINT BALL PEN • BLUE INK</text>
  </g>

  <!-- Illustration of Pens Blister Pack -->
  <rect x="80" y="240" width="440" height="460" rx="20" fill="#051021" stroke="#254a8a" stroke-width="2" opacity="0.95"/>
  <rect x="100" y="260" width="400" height="420" rx="14" fill="#0b1b36" stroke="#3b82f6" stroke-width="1" stroke-dasharray="6 4"/>
  
  <!-- Pens visual representation -->
  <g transform="translate(140, 290)">
    <rect x="0" y="0" width="28" height="360" rx="14" fill="#2563EB" stroke="#60A5FA"/>
    <rect x="40" y="0" width="28" height="360" rx="14" fill="#2563EB" stroke="#60A5FA"/>
    <rect x="80" y="0" width="28" height="360" rx="14" fill="#2563EB" stroke="#60A5FA"/>
    <rect x="120" y="0" width="28" height="360" rx="14" fill="#2563EB" stroke="#60A5FA"/>
    <rect x="160" y="0" width="28" height="360" rx="14" fill="#2563EB" stroke="#60A5FA"/>
    <rect x="200" y="0" width="28" height="360" rx="14" fill="#2563EB" stroke="#60A5FA"/>
    <rect x="240" y="0" width="28" height="360" rx="14" fill="#2563EB" stroke="#60A5FA"/>
    <rect x="280" y="0" width="28" height="360" rx="14" fill="#2563EB" stroke="#60A5FA"/>
  </g>

  <!-- Value Callout Badges -->
  <g transform="translate(80, 730)">
    <rect x="0" y="0" width="440" height="54" rx="10" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1.5"/>
    <text x="220" y="34" font-family="Inter, sans-serif" font-weight="800" font-size="20" fill="#FFFFFF" text-anchor="middle">PRESSURE FLOW INK • NON-STOP WRITING</text>
  </g>

  <!-- Front Net Quantity Declaration -->
  <g transform="translate(80, 810)">
    <rect x="0" y="0" width="440" height="50" rx="8" fill="#0A1830" stroke="#1E3A8A"/>
    <text x="220" y="32" font-family="JetBrains Mono, monospace" font-weight="700" font-size="16" fill="#FACC15" text-anchor="middle">NET QUANTITY: 10 N (BALL PENS)</text>
  </g>
</svg>`;

const penBackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
  <!-- Informational Back Card Background -->
  <rect width="600" height="900" rx="16" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="2"/>

  <!-- Top Hanging Slot -->
  <rect x="250" y="24" width="100" height="18" rx="9" fill="#F4F4F5" stroke="#D4D4D8" stroke-width="1.5"/>

  <!-- Header -->
  <g transform="translate(40, 70)">
    <text x="0" y="24" font-family="Inter, sans-serif" font-weight="900" font-size="26" fill="#18181B">Reynolds</text>
    <text x="135" y="24" font-family="Inter, sans-serif" font-weight="600" font-size="18" fill="#2563EB">045 CARBURE BALL PENS</text>
    <line x1="0" y1="40" x2="520" y2="40" stroke="#E4E4E7" stroke-width="1.5"/>
  </g>

  <!-- Product Features -->
  <g transform="translate(40, 130)">
    <text x="0" y="20" font-family="Inter, sans-serif" font-weight="700" font-size="14" fill="#18181B">PRODUCT SPECIFICATIONS:</text>
    <text x="0" y="44" font-family="Inter, sans-serif" font-weight="400" font-size="12" fill="#52525B">• Tip: 0.7mm Carbure Ball Point for laser smooth writing.</text>
    <text x="0" y="66" font-family="Inter, sans-serif" font-weight="400" font-size="12" fill="#52525B">• Waterproof archival ink compliant with international stationery standards.</text>
    <text x="0" y="88" font-family="Inter, sans-serif" font-weight="400" font-size="12" fill="#52525B">• Ergonomic hexagonal fluted barrel for fatigue-free grip.</text>
    <line x1="0" y1="108" x2="520" y2="108" stroke="#E4E4E7" stroke-width="1.5"/>
  </g>

  <!-- STATUTORY DECLARATIONS BOX (Mandatory under Legal Metrology) -->
  <g transform="translate(40, 260)">
    <rect x="0" y="0" width="520" height="520" rx="8" fill="#FBFBFA" stroke="#D4D4D8" stroke-width="1.5"/>
    <text x="20" y="32" font-family="Inter, sans-serif" font-weight="800" font-size="15" fill="#18181B" letter-spacing="1">MANDATORY STATUTORY DECLARATIONS</text>
    <line x1="20" y1="44" x2="500" y2="44" stroke="#E4E4E7" stroke-width="1"/>

    <!-- MRP Field (Note the intentional mismatch: ₹60.00 instead of ₹50.00 master) -->
    <g transform="translate(20, 60)">
      <rect x="0" y="0" width="480" height="54" rx="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5" stroke-dasharray="4 2"/>
      <text x="14" y="24" font-family="JetBrains Mono, monospace" font-weight="700" font-size="15" fill="#991B1B">MRP Rs. 60.00 (INCL. OF ALL TAXES)</text>
      <text x="14" y="44" font-family="Inter, sans-serif" font-weight="500" font-size="11" fill="#B91C1C">Unit Sale Price: Rs. 6.00 / N (Inclusive of all duties &amp; GST)</text>
    </g>

    <!-- Net Quantity Field (Note mismatch: 12 N instead of 10 N master) -->
    <g transform="translate(20, 130)">
      <rect x="0" y="0" width="480" height="50" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5" stroke-dasharray="4 2"/>
      <text x="14" y="24" font-family="JetBrains Mono, monospace" font-weight="700" font-size="14" fill="#92400E">NET QUANTITY: 12 N (PENS)</text>
      <text x="14" y="42" font-family="Inter, sans-serif" font-weight="500" font-size="11" fill="#78350F">Item: Ball Point Pen (Blue Ink) • Refillable Type</text>
    </g>

    <!-- Manufacturer details -->
    <g transform="translate(20, 196)">
      <rect x="0" y="0" width="480" height="74" rx="6" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1"/>
      <text x="14" y="20" font-family="Inter, sans-serif" font-weight="700" font-size="12" fill="#27272A">MANUFACTURED &amp; PACKED BY:</text>
      <text x="14" y="38" font-family="Inter, sans-serif" font-weight="500" font-size="11" fill="#52525B">Reynolds Pens India Private Limited, Plot No. 12,</text>
      <text x="14" y="52" font-family="Inter, sans-serif" font-weight="500" font-size="11" fill="#52525B">Industrial Area, Sector 5, Chennai - 600001, Tamil Nadu, India.</text>
      <text x="14" y="66" font-family="Inter, sans-serif" font-weight="600" font-size="11" fill="#18181B">COUNTRY OF ORIGIN: INDIA</text>
    </g>

    <!-- Manufacturing Date -->
    <g transform="translate(20, 286)">
      <rect x="0" y="0" width="480" height="42" rx="6" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="1"/>
      <text x="14" y="26" font-family="JetBrains Mono, monospace" font-weight="600" font-size="12" fill="#3F3F46">MFG. DATE: 10 / 2026 • BATCH NO: REY-2610-B1</text>
    </g>

    <!-- Smudged Consumer Care Region (triggers REVIEW REQUIRED) -->
    <g transform="translate(20, 344)">
      <rect x="0" y="0" width="480" height="74" rx="6" fill="#F4F4F5" stroke="#CBD5E1" stroke-width="1"/>
      <text x="14" y="20" font-family="Inter, sans-serif" font-weight="700" font-size="11" fill="#64748B">CONSUMER COMPLAINTS / FEEDBACK:</text>
      <!-- Simulated blurry, smudged text -->
      <filter id="blurFilter">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
      <text x="14" y="42" font-family="monospace" font-size="11" fill="#94A3B8" filter="url(#blurFilter)">PH: 1800-209-???? (SMUDGED PRINT)</text>
      <text x="14" y="58" font-family="monospace" font-size="10" fill="#94A3B8" filter="url(#blurFilter)">EMAIL: customercare@reynoldspens.?? [ILLEGIBLE RESOLUTION]</text>
    </g>

    <!-- Barcode Visual -->
    <g transform="translate(310, 432)">
      <rect x="0" y="0" width="190" height="70" rx="4" fill="#FFFFFF" stroke="#18181B" stroke-width="1"/>
      <!-- barcode lines -->
      <line x1="15" y1="10" x2="15" y2="52" stroke="#000" stroke-width="3"/>
      <line x1="24" y1="10" x2="24" y2="52" stroke="#000" stroke-width="1.5"/>
      <line x1="30" y1="10" x2="30" y2="52" stroke="#000" stroke-width="4"/>
      <line x1="42" y1="10" x2="42" y2="52" stroke="#000" stroke-width="2"/>
      <line x1="50" y1="10" x2="50" y2="52" stroke="#000" stroke-width="5"/>
      <line x1="62" y1="10" x2="62" y2="52" stroke="#000" stroke-width="1.5"/>
      <line x1="72" y1="10" x2="72" y2="52" stroke="#000" stroke-width="3"/>
      <line x1="82" y1="10" x2="82" y2="52" stroke="#000" stroke-width="4"/>
      <line x1="94" y1="10" x2="94" y2="52" stroke="#000" stroke-width="2"/>
      <line x1="106" y1="10" x2="106" y2="52" stroke="#000" stroke-width="6"/>
      <line x1="120" y1="10" x2="120" y2="52" stroke="#000" stroke-width="2"/>
      <line x1="130" y1="10" x2="130" y2="52" stroke="#000" stroke-width="3"/>
      <line x1="142" y1="10" x2="142" y2="52" stroke="#000" stroke-width="5"/>
      <line x1="156" y1="10" x2="156" y2="52" stroke="#000" stroke-width="2"/>
      <line x1="168" y1="10" x2="168" y2="52" stroke="#000" stroke-width="3"/>
      <text x="95" y="64" font-family="JetBrains Mono, monospace" font-size="9" fill="#000000" text-anchor="middle">8 901234 567890</text>
    </g>
  </g>

  <!-- Bottom Legal Footer -->
  <text x="300" y="855" font-family="Inter, sans-serif" font-size="10" fill="#A1A1AA" text-anchor="middle">Made in India • Keep away from direct sunlight &amp; heat</text>
</svg>`;

export function writeSampleAssets() {
  const frontPath = path.join(UPLOADS_DIR, 'pen_pdp_front.svg');
  const backPath = path.join(UPLOADS_DIR, 'pen_info_back.svg');

  if (!fs.existsSync(frontPath)) {
    fs.writeFileSync(frontPath, penFrontSvg, 'utf-8');
  }
  if (!fs.existsSync(backPath)) {
    fs.writeFileSync(backPath, penBackSvg, 'utf-8');
  }

  return {
    penFrontUrl: '/uploads/pen_pdp_front.svg',
    penBackUrl: '/uploads/pen_info_back.svg'
  };
}

export function getInitialSeedData() {
  const assets = writeSampleAssets();

  // 1. Realistic Products
  const products = [
    {
      id: 'prod_reynolds_pen_10',
      name: 'Reynolds 045 Fine Carbure Fine Point Ball Pen (Pack of 10)',
      sku: 'REY-045-BLU-10',
      brand: 'Reynolds',
      category: 'Writing Instruments / Ball Pens',
      mrp: 50.00,
      currency: 'INR',
      netQuantity: '10 N',
      netQuantityNumeric: 10,
      netQuantityUnit: 'N',
      manufacturer: 'Reynolds Pens India Private Limited, Plot No. 12, Industrial Area, Sector 5, Chennai - 600001, Tamil Nadu, India.',
      packerOrImporter: 'Packer: Reynolds Pens India Pvt. Ltd., Chennai - 600001',
      countryOfOrigin: 'India',
      consumerCare: 'Contact: Consumer Service Manager, Phone: 1800-209-1234, Email: customercare@reynoldspens.in, Address: Same as manufacturer',
      monthYearOfManufacture: '10/2026',
      brandGuidelines: {
        logoMinHeightMm: 14,
        clearSpaceMm: 10,
        primaryHex: '#0F2B5C'
      },
      createdAt: '2026-10-25T10:00:00.000Z',
      updatedAt: '2026-10-25T10:00:00.000Z'
    },
    {
      id: 'prod_apsara_pencil_10',
      name: 'Apsara Platinum Extra Dark Pencil Multipack (10 Pencils + Sharpener + Eraser)',
      sku: 'APS-PLT-10PK',
      brand: 'Apsara',
      category: 'Writing Instruments / Pencils',
      mrp: 80.00,
      currency: 'INR',
      netQuantity: '10 N + 1 N + 1 N',
      netQuantityNumeric: 10,
      netQuantityUnit: 'N',
      manufacturer: 'Hindustan Pencils Pvt. Ltd., 510 Himalaya House, 79 Palton Road, Mumbai - 400001, Maharashtra, India.',
      packerOrImporter: 'Hindustan Pencils Pvt. Ltd.',
      countryOfOrigin: 'India',
      consumerCare: 'Consumer Care Executive, Telephone: 022-22614505, Email: feedback@hindustanpencils.com',
      monthYearOfManufacture: '09/2026',
      brandGuidelines: {
        logoMinHeightMm: 12,
        clearSpaceMm: 8,
        primaryHex: '#991B1B'
      },
      createdAt: '2026-10-26T11:00:00.000Z',
      updatedAt: '2026-10-26T11:00:00.000Z'
    },
    {
      id: 'prod_camlin_exam_kit',
      name: 'Camlin Kokuyo Exam Stationery Kit (Pen, Pencil, Ruler, Eraser)',
      sku: 'CAM-EXM-KIT',
      brand: 'Camlin Kokuyo',
      category: 'Stationery Multipack Kits',
      mrp: 120.00,
      currency: 'INR',
      netQuantity: '1 Kit (4 Items)',
      netQuantityNumeric: 4,
      netQuantityUnit: 'Kit',
      manufacturer: 'Kokuyo Camlin Limited, 48/2, Sanjan Road, Maroli, Valsad, Gujarat - 396135, India.',
      packerOrImporter: 'Kokuyo Camlin Ltd.',
      countryOfOrigin: 'India',
      consumerCare: 'Consumer Care Cell, Toll Free: 1800-270-2277, Email: support@kokuyocamlin.com',
      monthYearOfManufacture: '08/2026',
      brandGuidelines: {
        logoMinHeightMm: 16,
        clearSpaceMm: 12,
        primaryHex: '#1E3A8A'
      },
      createdAt: '2026-10-27T09:30:00.000Z',
      updatedAt: '2026-10-27T09:30:00.000Z'
    }
  ];

  // 2. Comprehensive Compliance Rules
  const rules = [
    {
      id: 'rule_1',
      ruleId: 'LM-MRP-001',
      name: 'Statutory MRP Presence & Phrasing Format',
      description: 'Mandates conspicuous Maximum Retail Price declaration with "Inclusive of all taxes" syntax and currency symbol.',
      pillar: 'legal_metrology',
      field: 'mrp',
      severity: 'critical',
      legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6(1)(e)',
      version: '1.2.0',
      status: 'enabled',
      validationType: 'regex_format',
      testCasesSummary: 'Verifies presence of "MRP", "Rs." or "₹", and explicit "incl. of all taxes" notice.'
    },
    {
      id: 'rule_2',
      ruleId: 'MST-MRP-201',
      name: 'SKU Master Retail Price Consistency Check',
      description: 'Ensures printed packaging retail price matches authoritative ERP SKU master price with zero tolerance.',
      pillar: 'product_master',
      field: 'mrp',
      severity: 'critical',
      legalReference: 'Internal SKU Master Governance & Pre-Press QA Checklist v3.1',
      version: '2.0.0',
      status: 'enabled',
      validationType: 'presence_and_master_match',
      testCasesSummary: 'Asserts numeric equality between artwork MRP and master record MRP.'
    },
    {
      id: 'rule_3',
      ruleId: 'LM-QTY-002',
      name: 'Statutory Net Quantity Standard SI Units',
      description: 'Verifies net quantity is expressed in correct standard SI units (g, kg, mL, L) or piece count "N" / "U".',
      pillar: 'legal_metrology',
      field: 'net_quantity',
      severity: 'critical',
      legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 12 & Rule 13',
      version: '1.1.0',
      status: 'enabled',
      validationType: 'si_unit_standard',
      testCasesSummary: 'Rejects non-standard abbreviations and checks unit consistency.'
    },
    {
      id: 'rule_4',
      ruleId: 'MST-QTY-202',
      name: 'SKU Master Net Quantity Piece Count Match',
      description: 'Cross-validates that declared pack pieces or weight precisely equals the SKU product master declaration.',
      pillar: 'product_master',
      field: 'net_quantity',
      severity: 'critical',
      legalReference: 'ERP Master Data Specification — Section 4 (Unit of Measure)',
      version: '1.0.0',
      status: 'enabled',
      validationType: 'presence_and_master_match',
      testCasesSummary: 'Flags unit mismatch (e.g. 10 pens master vs 12 pens printed artwork).'
    },
    {
      id: 'rule_5',
      ruleId: 'LM-MFR-003',
      name: 'Manufacturer / Packer Full Address & PIN Code',
      description: 'Requires full name and registered physical postal address of manufacturer or packer including 6-digit postal PIN code.',
      pillar: 'legal_metrology',
      field: 'manufacturer_details',
      severity: 'critical',
      legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6(1)(a)',
      version: '1.2.0',
      status: 'enabled',
      validationType: 'regex_format',
      testCasesSummary: 'Checks for corporate entity indicator and valid 6-digit Indian PIN code.'
    },
    {
      id: 'rule_6',
      ruleId: 'LM-CARE-004',
      name: 'Statutory Consumer Care Details Presence & Legibility',
      description: 'Requires name/designation of grievance officer, telephone helpline, and email address with minimum OCR legibility threshold.',
      pillar: 'legal_metrology',
      field: 'consumer_care',
      severity: 'warning',
      legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6(1)(da)',
      version: '1.3.0',
      status: 'enabled',
      validationType: 'contrast_threshold',
      testCasesSummary: 'Routes low OCR confidence (<0.80) or illegible smudges to Review Required.'
    },
    {
      id: 'rule_7',
      ruleId: 'LM-COO-005',
      name: 'Statutory Country of Origin Declaration',
      description: 'Mandatory declaration of country of manufacture or origin on the principal display panel or information panel.',
      pillar: 'legal_metrology',
      field: 'country_of_origin',
      severity: 'critical',
      legalReference: 'Legal Metrology (Packaged Commodities) Amendment Rules, 2017 — Rule 6(1)(n)',
      version: '1.0.0',
      status: 'enabled',
      validationType: 'presence_and_master_match',
      testCasesSummary: 'Ensures origin country is prominently stated.'
    },
    {
      id: 'rule_8',
      ruleId: 'BR-LOGO-101',
      name: 'Brand Identity Logo Clear Space & Margin Perimeter',
      description: 'Verifies logo bounding box maintains clear-space perimeter without encroachment from adjacent text or graphics.',
      pillar: 'brand_identity',
      field: 'brand_logo',
      severity: 'info',
      legalReference: 'Corporate Brand Guidelines v4.2 — Visual Hierarchy',
      version: '1.0.0',
      status: 'enabled',
      validationType: 'clear_space_margin',
      testCasesSummary: 'Calculates spatial clearance around detected trademark polygons.'
    },
    {
      id: 'rule_9',
      ruleId: 'BR-CONT-102',
      name: 'Visual Contrast Ratio & Numeral Height Compliance',
      description: 'Evaluates luminance contrast ratio (minimum 4.5:1) between statutory text pixels and background artwork.',
      pillar: 'visual_legibility',
      field: 'contrast_ratio',
      severity: 'info',
      legalReference: 'WCAG 2.1 AA / Legal Metrology Legibility Standards',
      version: '1.0.0',
      status: 'enabled',
      validationType: 'contrast_threshold',
      testCasesSummary: 'Computes relative luminance and verifies print legibility.'
    }
  ];

  // 3. Pre-seeded Demo Inspection (Reynolds Pen with the 3 exact findings requested by spec!)
  const penProduct = products[0];
  const demoInspection = {
    id: 'ins_demo_reynolds_045',
    inspectionNumber: 'INS-2026-1001',
    productId: penProduct.id,
    productSnapshot: penProduct,
    status: 'reviewed',
    finalDecision: 'pending',
    finalDecisionNotes: 'Pre-production screening completed. 2 critical master mismatches identified for engineering correction.',
    finalDecisionAt: '',
    inspector: {
      name: 'Senior Packaging QA Inspector',
      role: 'Reviewer / Lead Metrologist',
      email: 'qa.lead@bustd.internal'
    },
    assets: [
      {
        assetId: 'asset_pen_front',
        panel: 'front',
        originalFilename: 'reynolds_045_pdp_front.svg',
        storedPath: assets.penFrontUrl,
        mimeType: 'image/svg+xml',
        sizeBytes: 4210,
        dimensions: { width: 600, height: 900 },
        qualityPrecheck: { sharpness: 94, glare: 8, resolutionOk: true, status: 'passed' }
      },
      {
        assetId: 'asset_pen_back',
        panel: 'back',
        originalFilename: 'reynolds_045_info_back.svg',
        storedPath: assets.penBackUrl,
        mimeType: 'image/svg+xml',
        sizeBytes: 7850,
        dimensions: { width: 600, height: 900 },
        qualityPrecheck: { sharpness: 89, glare: 14, resolutionOk: true, status: 'passed' }
      }
    ],
    extractedFields: {
      mrp: {
        rawText: 'MRP Rs. 60.00 (INCL. OF ALL TAXES)',
        numericValue: 60.00,
        confidence: 0.96,
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 35, w: 86, h: 7 },
        status: 'detected'
      },
      net_quantity: {
        rawText: 'NET QUANTITY: 12 N (PENS)',
        numericValue: 12,
        confidence: 0.94,
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 43, w: 86, h: 7 },
        status: 'detected'
      },
      manufacturer: {
        rawText: 'Reynolds Pens India Private Limited, Plot No. 12, Industrial Area, Sector 5, Chennai - 600001, Tamil Nadu, India.',
        confidence: 0.92,
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 51, w: 86, h: 9 },
        status: 'detected'
      },
      country_of_origin: {
        rawText: 'Country of Origin: India',
        confidence: 0.95,
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 58, w: 86, h: 4 },
        status: 'detected'
      },
      consumer_care: {
        rawText: 'Ph: 1800-209-???? Email: customercare@reynoldspens.?? [ILLEGIBLE RESOLUTION]',
        confidence: 0.42,
        isDegraded: true,
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 67, w: 86, h: 9 },
        status: 'uncertain'
      },
      brand_logo: {
        rawText: 'Reynolds',
        confidence: 0.99,
        evidenceAssetId: 'asset_pen_front',
        evidenceBox: { x: 10, y: 10, w: 80, h: 14 },
        status: 'detected'
      }
    },
    findings: [
      {
        findingId: 'fnd_mst_mrp_mismatch',
        ruleId: 'MST-MRP-201',
        ruleVersion: '2.0.0',
        pillar: 'product_master',
        title: 'MRP Mismatch: Expected ₹50.00, Detected ₹60.00',
        status: 'potential_issue',
        severity: 'critical',
        expectedValue: '₹50.00 (Source: SKU Master REY-045-BLU-10)',
        detectedValue: 'MRP Rs. 60.00 (INCL. OF ALL TAXES) [OCR Conf: 96%]',
        explanation: 'Statutory MRP declaration is present, but numerical value (₹60.00) conflicts with approved SKU Product Master price (₹50.00). Reviewer action required before pre-press sign-off.',
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 35, w: 86, h: 7 },
        ocrConfidence: 0.96,
        reviewDisposition: 'confirmed',
        reviewerNotes: 'Confirmed price inflation on back card. Packaging team must revert dieline price to ₹50.',
        reviewedAt: '2026-10-29T14:30:00.000Z',
        reviewedBy: 'Senior Packaging QA Inspector'
      },
      {
        findingId: 'fnd_mst_qty_mismatch',
        ruleId: 'MST-QTY-202',
        ruleVersion: '1.0.0',
        pillar: 'product_master',
        title: 'Net Quantity Mismatch: Expected 10 pens, Detected 12 pens',
        status: 'potential_issue',
        severity: 'critical',
        expectedValue: '10 N (Source: SKU Master REY-045-BLU-10)',
        detectedValue: 'NET QUANTITY: 12 N (PENS) [OCR Conf: 94%]',
        explanation: 'Packaging artwork states 12 N (pens), but product master specifies a 10-pen retail pack. This discrepancy violates statutory declaration accuracy rules.',
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 43, w: 86, h: 7 },
        ocrConfidence: 0.94,
        reviewDisposition: 'confirmed',
        reviewerNotes: 'Count error verified against physical blister layout.',
        reviewedAt: '2026-10-29T14:32:00.000Z',
        reviewedBy: 'Senior Packaging QA Inspector'
      },
      {
        findingId: 'fnd_lm_care_low_confidence',
        ruleId: 'LM-CARE-004',
        ruleVersion: '1.3.0',
        pillar: 'legal_metrology',
        title: 'Consumer-Care Information: Review Required (Text Degraded or Low OCR Confidence)',
        status: 'review_required',
        severity: 'warning',
        expectedValue: 'Legible Helpline Phone and Email Address (OCR Confidence ≥ 0.80)',
        detectedValue: 'Ph: 1800-209-???? Email: customercare@reynoldspens.?? [OCR Conf: 42%]',
        explanation: 'OCR confidence for the consumer care block is 42% (< threshold 80%). The text appears smudged or printed in low-contrast raster resolution. Human review required to ensure consumer redressal compliance.',
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 67, w: 86, h: 9 },
        ocrConfidence: 0.42,
        reviewDisposition: 'pending',
        reviewerNotes: '',
        reviewedAt: '',
        reviewedBy: ''
      },
      {
        findingId: 'fnd_lm_mfr_pass',
        ruleId: 'LM-MFR-003',
        ruleVersion: '1.2.0',
        pillar: 'legal_metrology',
        title: 'Complete Manufacturer Address with PIN Code Verified',
        status: 'no_issue',
        severity: 'info',
        expectedValue: 'Registered corporate address including 6-digit postal PIN code',
        detectedValue: 'Plot No. 12, Industrial Area, Sector 5, Chennai - 600001, Tamil Nadu',
        explanation: 'Mandatory manufacturer coordinates comply with Rule 6(1)(a) and include verified postal code 600001.',
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 51, w: 86, h: 9 },
        ocrConfidence: 0.92,
        reviewDisposition: 'pending'
      },
      {
        findingId: 'fnd_lm_coo_pass',
        ruleId: 'LM-COO-005',
        ruleVersion: '1.0.0',
        pillar: 'legal_metrology',
        title: 'Country of Origin Declaration Verified',
        status: 'no_issue',
        severity: 'info',
        expectedValue: 'Country of Origin: India',
        detectedValue: 'COUNTRY OF ORIGIN: INDIA',
        explanation: 'Mandatory country of origin is conspicuously declared.',
        evidenceAssetId: 'asset_pen_back',
        evidenceBox: { x: 7, y: 58, w: 86, h: 4 },
        ocrConfidence: 0.95,
        reviewDisposition: 'pending'
      }
    ],
    summary: {
      totalChecks: 5,
      potentialIssues: 2,
      passedChecks: 2,
      reviewRequired: 1,
      dispositionSummary: {
        confirmed: 2,
        dismissed: 0,
        deferred: 0,
        pending: 1
      }
    },
    createdAt: '2026-10-29T14:20:00.000Z',
    updatedAt: '2026-10-29T14:35:00.000Z'
  };

  // 4. Initial Audit Events
  const auditEvents = [
    {
      id: 'aud_1',
      inspectionId: demoInspection.id,
      actor: { name: 'Senior Packaging QA Inspector', role: 'Reviewer' },
      action: 'INSPECTION_CREATED',
      metadata: { inspectionNumber: demoInspection.inspectionNumber, productSku: penProduct.sku },
      timestamp: '2026-10-29T14:20:00.000Z'
    },
    {
      id: 'aud_2',
      inspectionId: demoInspection.id,
      actor: { name: 'Senior Packaging QA Inspector', role: 'Reviewer' },
      action: 'ASSETS_UPLOADED',
      metadata: { assetCount: 2, panels: ['front', 'back'] },
      timestamp: '2026-10-29T14:21:00.000Z'
    },
    {
      id: 'aud_3',
      inspectionId: demoInspection.id,
      actor: { name: 'Deterministic Rule Engine', role: 'System' },
      action: 'ANALYSIS_COMPLETED',
      metadata: { totalRulesEvaluated: 5, potentialIssues: 2, reviewRequired: 1 },
      timestamp: '2026-10-29T14:22:15.000Z'
    },
    {
      id: 'aud_4',
      inspectionId: demoInspection.id,
      actor: { name: 'Senior Packaging QA Inspector', role: 'Reviewer' },
      action: 'FINDING_CONFIRMED',
      metadata: { findingId: 'fnd_mst_mrp_mismatch', ruleId: 'MST-MRP-201', note: 'Confirmed price inflation on back card.' },
      timestamp: '2026-10-29T14:30:00.000Z'
    },
    {
      id: 'aud_5',
      inspectionId: demoInspection.id,
      actor: { name: 'Senior Packaging QA Inspector', role: 'Reviewer' },
      action: 'FINDING_CONFIRMED',
      metadata: { findingId: 'fnd_mst_qty_mismatch', ruleId: 'MST-QTY-202', note: 'Count error verified against physical blister layout.' },
      timestamp: '2026-10-29T14:32:00.000Z'
    }
  ];

  return {
    products,
    rules,
    inspections: [demoInspection],
    auditEvents
  };
}
