# BUSTD • Spot the Red Flags
> **AI-Assisted Packaging Compliance Inspection & Pre-Production Brand Audit Platform**  
> *Developed for Final Year College Capstone Project (SIH26034 / Legal Metrology Baseline)*

---

## 1. Product Overview

**BUSTD** is an evidence-first, decision-support compliance scanner designed to catch packaging declaration errors *before* commercial printing. It cross-validates packaging dielines and camera proofs simultaneously across three authoritative sources of truth:

1. **Statutory Legal Metrology (Packaged Commodities Rules 2011)**: MRP phrasing (`"incl. of all taxes"`), standard SI units, manufacturer postal address with 6-digit PIN code, consumer care helpline/email, and country of origin.
2. **SKU Product Master Consistency**: Zero-tolerance numeric cross-checking against enterprise ERP master data (e.g., catching price inflation where packaging displays ₹60 while master specifies ₹50, or pack count mismatches).
3. **Brand Identity & Legibility Audit**: Minimum clear-space perimeter around brand logos, and Otsu/WCAG luminance contrast thresholds for legal legibility.

### Core Architecture Principles
- **Decision-Support, Not Legal Authority**: Every finding is traceable to visible bounding-box artwork evidence or explicitly flagged as *Review Required*.
- **Absence is Never Assumed from OCR Failure**: Degraded print, glare, or low OCR confidence (<0.80) routes to human inspection rather than falsely claiming absence.
- **Human-in-the-Loop Sign-Off**: Automated machine findings are preserved immutably; reviewer actions (Confirm, Dismiss with required justification, Defer) and corrections are tracked in an append-only audit trail.

---

## 2. Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Tailwind CSS, Lucide React, JetBrains Mono & Instrument Serif typography
- **Backend**: Node.js, Express, Multer (multi-panel artwork upload up to 25MB)
- **Database**: MongoDB with Mongoose + **Zero-Configuration Local File Store Fallback** (`server/data/store.json`)
- **OCR Engine**: Replaceable Provider Adapter (`DeterministicMockAdapter` with real spatial bounding polygons + pluggable `GoogleCloudVisionAdapter`)
- **Report Generation**: PDFKit vector engine generating formal preliminary screening reports

---

## 3. Quick Start & Startup Commands

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
From the project root:
```bash
# Install server dependencies
npm --prefix server install

# Install client dependencies
npm --prefix client install
```

### Running the Application

#### Option A: Unified Full-Stack Server (Recommended for Quick Demo)
Build the frontend once and start the unified server:
```bash
npm run build:client
npm start
```
The entire application will be live at:
**[http://localhost:5000](http://localhost:5000)**

#### Option B: Hot-Reloading Development Mode
In terminal 1 (Backend API):
```bash
npm run dev:server
# Running on http://localhost:5000
```
In terminal 2 (Vite Frontend with HMR):
```bash
npm run dev:client
# Running on http://localhost:5173 (proxies /api to port 5000)
```

---

## 4. Environment Variables Configuration

Create a `.env` file in `server/.env` (or project root):

```env
# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# MongoDB Connection String (Optional)
# If omitted or unreachable, BUSTD seamlessly switches to the Local File Store.
# MONGODB_URI=mongodb://localhost:27017/bustd

# Hosted OCR Provider (Optional)
# If omitted, BUSTD uses the Spatial Deterministic OCR Adapter with grounded polygons.
# GOOGLE_VISION_API_KEY=your_google_cloud_vision_key_here
```

### Database Persistence Behavior
- **With MongoDB**: Connects via Mongoose to your cluster.
- **Without MongoDB (Default Local Demo)**: Automatically persists to `server/data/store.json` and `server/uploads/`. All changes (new products, custom scans, reviewer dismissals, and audit events) survive server restarts. The top bar and sidebar prominently disclose the active storage mode.

---

## 5. Demonstration Walkthrough (Capstone Acceptance Test)

You can demonstrate the complete end-to-end journey in under 3 minutes:

1. **Overview Page**: View summary metrics, outcome principles, and the pre-seeded **Reynolds 045 Fine Carbure Ball Pen** inspection (`INS-2026-1001`).
2. **Start New Inspection**: Click *"Start New Inspection"* or navigate to `/inspections/new`.
3. **Step 1 (Select Product)**: Choose the packaged pen product or create a custom SKU master record.
4. **Step 2 (Upload Packaging Artwork)**: Click *"Load Seeded Pen Dielines"* (or upload custom PNG/JPG/PDF packaging files). The pre-check evaluates image sharpness and resolution.
5. **Step 3 (Configure Scan)**: Review the active Legal Metrology and Product Master rules.
6. **Step 4 (Run Analysis)**: Click *"Run Inspection Now"*. Watch the real 5-stage progress indicator:
   - *1. Validating files*
   - *2. Extracting text polygon tokens*
   - *3. Mapping declarations*
   - *4. Evaluating rules*
   - *5. Preparing evidence links*
7. **Inspection Detail & Evidence Canvas (Centerpiece)**:
   - On the left canvas: Inspect the high-resolution packaging artwork with colored bounding boxes (Red for MRP and Net Qty mismatches, Amber for smudged consumer care, Green for verified postal address and origin).
   - Use Zoom In / Zoom Out controls to verify fine print.
   - Click any bounding box on the image to select and scroll to the finding on the right.
8. **Human Reviewer Actions**:
   - Click **Confirm Issue** on the MRP mismatch (Expected ₹50 vs Detected ₹60).
   - Click **Dismiss** on a finding: Note that the system strictly requires a mandatory justification reason before confirming dismissal.
   - Switch to the **Master Check** tab to view the side-by-side expected vs detected comparison.
   - Switch to **Extracted Fields** and correct the degraded consumer-care phone number.
9. **Finalize Screening Decision**:
   - Click **Finalize Decision**, select *"Returned for Revision"*, enter reviewer remarks, and submit.
10. **Download Official Report**:
    - Click **Download Report** to receive a structured PDF report containing SKU metadata, evidence findings, reviewer dispositions, and statutory screening disclaimers.

---

## 6. Running Automated Tests

BUSTD includes an end-to-end integration test suite verifying all API contracts, validation invariants, rule evaluation, and PDF streaming:

```bash
npm test
```

Expected output:
```text
✓ System Status: BUSTD | Storage: local_file_store
✓ Products Count: 3
✓ Rules Count: 9
✓ Seeded Demo Inspection: INS-2026-1001
✓ Created New Inspection: INS-2026-1002 with 2 assets
✓ Analysis Complete: 9 findings generated
✓ Finding fnd_mst_mrp_mismatch Confirmed
✓ Validation Invariant: Dismissal rejected when reason is missing (HTTP 400)
✓ Finding Dismissed with reason
✓ Field Correction Applied
✓ Inspection Finalized: Decision = returned_for_revision
✓ Downloaded PDF Report: 10,200 bytes generated with PDFKit
✓ Audit Events Count for Inspection: 7 events recorded
ALL E2E ACCEPTANCE TESTS PASSED SUCCESSFULLY!
```

---

## 7. Known Limitations & Progressive Roadmap

1. **Category Scope**: Initial demo rules are tailored to retail-packaged stationery (pens, pencils, multipacks) under Indian Legal Metrology (Packaged Commodities) Rules 2011. Food safety (FSSAI) and pharmaceutical schedules are scheduled for v0.4.
2. **Color Verification**: Perceptual color distance ($\Delta E$) on sRGB digital uploads approximates print fidelity and cannot fully replace spectrophotometer measurements for Pantone spot inks on metallic foils.
3. **OCR Stylized Fonts**: Heavily stylized script typography on novelty packaging is routed to *Review Required* rather than producing false negatives.
4. **Legal Adjudication Disclaimer**: BUSTD is an AI-assisted preliminary screening tool for pre-production quality assurance, not a substitute for official enforcement inspection by legal metrology controllers.
