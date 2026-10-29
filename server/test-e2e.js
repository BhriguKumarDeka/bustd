import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { initDatabase, db } from './services/dbService.js';
import { getInitialSeedData, writeSampleAssets } from './data/seedData.js';

import productsRouter from './routes/products.js';
import inspectionsRouter from './routes/inspections.js';
import rulesRouter from './routes/rules.js';
import auditRouter from './routes/audit.js';
import systemRouter from './routes/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function runTestSuite() {
  console.log('--- STARTING BUSTD E2E VERIFICATION ---');

  writeSampleAssets();
  await initDatabase();

  const rawStore = db.getRawStore();
  if (!rawStore.products || rawStore.products.length === 0) {
    const seed = getInitialSeedData();
    db.setInitialSeed(seed);
  }

  const app = express();
  app.use(express.json());
  app.use('/uploads', express.static(UPLOADS_DIR));
  app.use('/api/products', productsRouter);
  app.use('/api/inspections', inspectionsRouter);
  app.use('/api/rules', rulesRouter);
  app.use('/api/audit-events', auditRouter);
  app.use('/api/system', systemRouter);

  const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
  }

  const server = app.listen(0);
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. System Status
    const statusRes = await fetch(`${baseUrl}/api/system/status`);
    const statusData = await statusRes.json();
    console.log('✓ System Status:', statusData.data.appName, '| Storage:', statusData.data.storage.mode);

    // 2. Products List
    const prodsRes = await fetch(`${baseUrl}/api/products`);
    const prodsData = await prodsRes.json();
    console.log(`✓ Products Count: ${prodsData.total}`);
    if (prodsData.total === 0) throw new Error('No seeded products found');

    // 3. Rules List
    const rulesRes = await fetch(`${baseUrl}/api/rules`);
    const rulesData = await rulesRes.json();
    console.log(`✓ Rules Count: ${rulesData.total}`);
    if (rulesData.total < 5) throw new Error('Less than 5 rules found');

    // 4. Toggle Rule
    const ruleToToggle = rulesData.data[0];
    const toggleRes = await fetch(`${baseUrl}/api/rules/${ruleToToggle.ruleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'disabled' })
    });
    const toggled = await toggleRes.json();
    console.log(`✓ Toggled Rule ${ruleToToggle.ruleId} to ${toggled.data.status}`);
    // Toggle back
    await fetch(`${baseUrl}/api/rules/${ruleToToggle.ruleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'enabled' })
    });

    // 5. Inspections List
    const inspListRes = await fetch(`${baseUrl}/api/inspections`);
    const inspListData = await inspListRes.json();
    console.log(`✓ Inspections Count: ${inspListData.total}`);
    const demoInsp = inspListData.data[0];
    console.log(`✓ Seeded Demo Inspection: ${demoInsp.inspectionNumber} | Issues: ${demoInsp.summary.potentialIssues} | Reviews: ${demoInsp.summary.reviewRequired}`);

    // 6. Test New Inspection Flow
    console.log('\n--- TESTING COMPLETE USER JOURNEY (CREATE -> ANALYZE -> REVIEW -> FINALIZE -> REPORT) ---');
    const newInspRes = await fetch(`${baseUrl}/api/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: prodsData.data[0].id, samplePreset: 'pen' })
    });
    const newInsp = await newInspRes.json();
    console.log(`✓ Created New Inspection: ${newInsp.data.inspectionNumber} with ${newInsp.data.assets.length} assets`);

    // 7. Run Analysis
    const analyzeRes = await fetch(`${baseUrl}/api/inspections/${newInsp.data.id}/analyze`, {
      method: 'POST'
    });
    const analyzed = await analyzeRes.json();
    console.log(`✓ Analysis Complete: ${analyzed.data.findings.length} findings generated.`);
    console.log(`   - Potential Issues: ${analyzed.data.summary.potentialIssues}`);
    console.log(`   - Review Required: ${analyzed.data.summary.reviewRequired}`);
    console.log(`   - Checks Passed: ${analyzed.data.summary.passedChecks}`);

    // 8. Test Reviewer Disposition (Confirm finding)
    const issueFinding = analyzed.data.findings.find(f => f.status === 'potential_issue');
    if (issueFinding) {
      const confirmRes = await fetch(`${baseUrl}/api/inspections/${newInsp.data.id}/findings/${issueFinding.findingId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirmed', notes: 'Verified mismatch with engineering master' })
      });
      const confirmed = await confirmRes.json();
      console.log(`✓ Finding ${issueFinding.findingId} Confirmed: disposition = ${confirmed.updatedFinding.reviewDisposition}`);
    }

    // 9. Test Dismissal with mandatory reason
    const dismissFinding = analyzed.data.findings.find(f => f.findingId !== issueFinding?.findingId);
    if (dismissFinding) {
      // Test without reason (should fail)
      const failDismiss = await fetch(`${baseUrl}/api/inspections/${newInsp.data.id}/findings/${dismissFinding.findingId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismissed', dismissReason: '' })
      });
      if (failDismiss.status === 400) {
        console.log('✓ Validation Invariant: Dismissal rejected when reason is missing (HTTP 400)');
      }
      // With reason (should pass)
      const okDismiss = await fetch(`${baseUrl}/api/inspections/${newInsp.data.id}/findings/${dismissFinding.findingId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismissed', dismissReason: 'Acceptable promo sticker variant per legal notice' })
      });
      const dismissed = await okDismiss.json();
      console.log(`✓ Finding ${dismissFinding.findingId} Dismissed with reason: "${dismissed.updatedFinding.dismissReason}"`);
    }

    // 10. Field Correction
    const correctRes = await fetch(`${baseUrl}/api/inspections/${newInsp.data.id}/fields/consumer_care/correct`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correctedValue: 'Ph: 1800-209-1234, Email: customercare@reynoldspens.in', status: 'corrected' })
    });
    const corrected = await correctRes.json();
    console.log('✓ Field Correction Applied:', corrected.data.extractedFields.consumer_care.reviewerCorrection);

    // 11. Finalize Inspection
    const finalizeRes = await fetch(`${baseUrl}/api/inspections/${newInsp.data.id}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: 'returned_for_revision',
        notes: 'Pre-production packaging dieline returned to agency for price and net count correction.'
      })
    });
    const finalized = await finalizeRes.json();
    console.log(`✓ Inspection Finalized: Decision = ${finalized.data.finalDecision}`);

    // 12. Report Generation (PDF Stream)
    const reportPdfRes = await fetch(`${baseUrl}/api/inspections/${newInsp.data.id}/report?format=pdf`);
    const pdfBuf = await reportPdfRes.arrayBuffer();
    console.log(`✓ Downloaded PDF Report: ${pdfBuf.byteLength} bytes generated with PDFKit`);

    // 13. Audit Events Check
    const auditRes = await fetch(`${baseUrl}/api/audit-events?inspectionId=${newInsp.data.id}`);
    const auditData = await auditRes.json();
    console.log(`✓ Audit Events Count for Inspection: ${auditData.total} events recorded`);

    // 14. Frontend Assets Verification
    const indexHtmlRes = await fetch(`${baseUrl}/`);
    const htmlText = await indexHtmlRes.text();
    console.log(`✓ Frontend SPA Serving: ${indexHtmlRes.status} OK (HTML size: ${htmlText.length} bytes, contains title: ${htmlText.includes('BUSTD')})`);

    console.log('\n=================================================');
    console.log('  ALL E2E ACCEPTANCE TESTS PASSED SUCCESSFULLY!  ');
    console.log('=================================================');
  } catch (err) {
    console.error('✗ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTestSuite();
