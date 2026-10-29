import PDFDocument from 'pdfkit';

export function generateInspectionPdf(inspection, stream) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: `BUSTD Inspection Report - ${inspection.inspectionNumber}`,
      Author: 'BUSTD Packaging Compliance Platform',
      Subject: 'Statutory Screening Audit Report'
    }
  });

  doc.pipe(stream);

  const colors = {
    charcoal: '#18181B',
    muted: '#71717A',
    lightBg: '#F4F4F5',
    border: '#E4E4E7',
    red: '#DC2626',
    green: '#16A34A',
    amber: '#D97706',
    blue: '#2563EB'
  };

  // --- HEADER ---
  doc.rect(40, 40, 515, 60).fill('#FAFAF8');
  doc.rect(40, 40, 515, 60).stroke(colors.border);

  // Logo & Wordmark
  doc.fontSize(20).font('Helvetica-Bold').fillColor(colors.charcoal).text('BUSTD', 55, 52);
  doc.fontSize(9).font('Helvetica').fillColor(colors.red).text('• SPOT THE RED FLAGS', 135, 58);
  doc.fontSize(8).font('Helvetica').fillColor(colors.muted).text('AI-Assisted Packaging Compliance & Brand Audit System', 55, 78);

  // Inspection Metadata (Right aligned)
  doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.charcoal).text(`REPORT REF: ${inspection.inspectionNumber}`, 340, 52, { align: 'right', width: 200 });
  doc.fontSize(8).font('Helvetica').fillColor(colors.muted).text(`Generated: ${new Date().toLocaleString('en-IN')}`, 340, 66, { align: 'right', width: 200 });
  doc.fontSize(8).font('Helvetica').fillColor(colors.muted).text(`Inspector: ${inspection.inspector?.name || 'QA Lead'} (${inspection.inspector?.role || 'Reviewer'})`, 340, 80, { align: 'right', width: 200 });

  doc.y = 115;

  // --- EXECUTIVE SCREENING STATUS BADGE ---
  let statusBg = colors.amber;
  let statusText = 'ACTION REQUIRED / REVIEW PENDING';
  if (inspection.finalDecision === 'approved') {
    statusBg = colors.green;
    statusText = 'APPROVED - ALL FINDINGS RESOLVED';
  } else if (inspection.finalDecision === 'returned_for_revision') {
    statusBg = colors.red;
    statusText = 'RETURNED FOR REVISION - CRITICAL RED FLAGS';
  } else if (inspection.summary?.potentialIssues > 0) {
    statusBg = colors.red;
    statusText = `POTENTIAL ISSUES DETECTED (${inspection.summary.potentialIssues} RED FLAGS)`;
  }

  doc.rect(40, doc.y, 515, 30).fill(statusBg);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF').text(`OVERALL SCREENING OUTCOME: ${statusText}`, 50, doc.y + 10);
  doc.y += 40;

  // --- SECTION: PRODUCT MASTER METADATA ---
  doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.charcoal).text('1. Product Master Baseline', 40, doc.y);
  doc.y += 6;
  doc.rect(40, doc.y, 515, 1).fill(colors.border);
  doc.y += 10;

  const prod = inspection.productSnapshot || {};
  const metaStartX = 45;
  const colW = 250;
  let metaY = doc.y;

  const renderMetaItem = (label, value, x, y) => {
    doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.muted).text(label.toUpperCase(), x, y);
    doc.fontSize(9).font('Helvetica').fillColor(colors.charcoal).text(String(value || 'N/A'), x, y + 10, { width: colW - 10 });
  };

  renderMetaItem('Product Name', prod.name, metaStartX, metaY);
  renderMetaItem('Stock Keeping Unit (SKU)', prod.sku, metaStartX + colW, metaY);
  metaY += 30;

  renderMetaItem('Brand / Category', `${prod.brand || 'N/A'} • ${prod.category || 'N/A'}`, metaStartX, metaY);
  renderMetaItem('Authoritative MRP', `₹${Number(prod.mrp || 0).toFixed(2)}`, metaStartX + colW, metaY);
  metaY += 30;

  renderMetaItem('Declared Net Quantity', prod.netQuantity, metaStartX, metaY);
  renderMetaItem('Country of Origin', prod.countryOfOrigin, metaStartX + colW, metaY);
  metaY += 30;

  renderMetaItem('Manufacturer Address', prod.manufacturer, metaStartX, metaY);
  renderMetaItem('Packer / Importer', prod.packerOrImporter || 'Same as manufacturer', metaStartX + colW, metaY);
  metaY += 36;

  doc.y = metaY;

  // --- SECTION: SCREENING METRICS SUMMARY ---
  doc.y += 5;
  doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.charcoal).text('2. Compliance Assessment Summary', 40, doc.y);
  doc.y += 6;
  doc.rect(40, doc.y, 515, 1).fill(colors.border);
  doc.y += 10;

  const sum = inspection.summary || {};
  const cardW = 120;
  const cardH = 46;
  const startX = 40;
  const spacing = 12;

  const renderSummaryCard = (label, val, color, x) => {
    doc.rect(x, doc.y, cardW, cardH).fill(colors.lightBg);
    doc.rect(x, doc.y, cardW, cardH).stroke(colors.border);
    doc.fontSize(16).font('Helvetica-Bold').fillColor(color).text(String(val), x + 12, doc.y + 8);
    doc.fontSize(8).font('Helvetica').fillColor(colors.muted).text(label, x + 12, doc.y + 28);
  };

  const cardY = doc.y;
  renderSummaryCard('Total Rules Evaluated', sum.totalChecks || 0, colors.charcoal, startX);
  renderSummaryCard('Potential Red Flags', sum.potentialIssues || 0, colors.red, startX + (cardW + spacing));
  renderSummaryCard('Reviews Required', sum.reviewRequired || 0, colors.amber, startX + (cardW + spacing) * 2);
  renderSummaryCard('Checks Passed', sum.passedChecks || 0, colors.green, startX + (cardW + spacing) * 3);

  doc.y = cardY + cardH + 16;

  // --- SECTION: EVIDENCE-LINKED FINDINGS TABLE ---
  doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.charcoal).text('3. Detailed Evidence-Linked Findings & Reviewer Disposition', 40, doc.y);
  doc.y += 6;
  doc.rect(40, doc.y, 515, 1).fill(colors.border);
  doc.y += 10;

  const findings = inspection.findings || [];

  if (findings.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(colors.muted).text('No automated findings generated.', 45, doc.y);
    doc.y += 20;
  } else {
    for (let i = 0; i < findings.length; i++) {
      const f = findings[i];

      // Add page break if near bottom
      if (doc.y > 680) {
        doc.addPage();
        doc.y = 40;
      }

      let badgeColor = colors.green;
      let badgeLabel = 'NO ISSUE';
      if (f.status === 'potential_issue') {
        badgeColor = colors.red;
        badgeLabel = 'POTENTIAL ISSUE';
      } else if (f.status === 'review_required') {
        badgeColor = colors.amber;
        badgeLabel = 'REVIEW REQUIRED';
      }

      // Finding Header
      doc.rect(40, doc.y, 515, 20).fill('#F8F8F6');
      doc.rect(40, doc.y, 515, 20).stroke(colors.border);
      
      doc.fontSize(8).font('Helvetica-Bold').fillColor(badgeColor).text(`[ ${badgeLabel} ]`, 48, doc.y + 5);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.charcoal).text(`${f.title} (${f.ruleId} v${f.ruleVersion})`, 160, doc.y + 5, { width: 380, ellipsis: true });
      doc.y += 24;

      // Values comparison box
      const boxStartY = doc.y;
      doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.muted).text('EXPECTED VALUE / STANDARD:', 48, doc.y);
      doc.fontSize(8).font('Helvetica').fillColor(colors.charcoal).text(f.expectedValue || 'N/A', 48, doc.y + 10, { width: 495 });
      doc.y += 22;

      doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.muted).text('DETECTED ARTWORK VALUE:', 48, doc.y);
      doc.fontSize(8).font('Helvetica').fillColor(f.status === 'potential_issue' ? colors.red : colors.charcoal).text(f.detectedValue || 'Not detected', 48, doc.y + 10, { width: 495 });
      doc.y += 22;

      doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.muted).text('EXPLANATION & EVIDENCE:', 48, doc.y);
      doc.fontSize(8).font('Helvetica').fillColor(colors.charcoal).text(f.explanation, 48, doc.y + 10, { width: 495 });
      doc.y += 26;

      // Reviewer Human-in-the-loop Disposition
      const disp = (f.reviewDisposition || 'pending').toUpperCase();
      let dispColor = colors.muted;
      if (disp === 'CONFIRMED') dispColor = colors.red;
      if (disp === 'DISMISSED') dispColor = colors.green;
      if (disp === 'DEFERRED') dispColor = colors.amber;

      doc.rect(45, doc.y, 505, 20).fill('#FFFFFF');
      doc.rect(45, doc.y, 505, 20).stroke('#E4E4E7');
      doc.fontSize(8).font('Helvetica-Bold').fillColor(dispColor).text(`HUMAN DISPOSITION: ${disp}`, 52, doc.y + 5);
      if (f.dismissReason) {
        doc.fontSize(8).font('Helvetica').fillColor(colors.charcoal).text(`Reason: "${f.dismissReason}"`, 220, doc.y + 5, { width: 320, ellipsis: true });
      } else if (f.reviewerNotes) {
        doc.fontSize(8).font('Helvetica').fillColor(colors.charcoal).text(`Notes: "${f.reviewerNotes}"`, 220, doc.y + 5, { width: 320, ellipsis: true });
      }
      doc.y += 28;
    }
  }

  // --- FINAL DECISION & SIGN-OFF ---
  if (doc.y > 660) {
    doc.addPage();
    doc.y = 40;
  }

  doc.y += 10;
  doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.charcoal).text('4. Reviewer Final Sign-Off & Audit Trail', 40, doc.y);
  doc.y += 6;
  doc.rect(40, doc.y, 515, 1).fill(colors.border);
  doc.y += 10;

  doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.charcoal).text(`Final Review Decision: ${(inspection.finalDecision || 'PENDING').toUpperCase()}`, 45, doc.y);
  doc.fontSize(8).font('Helvetica').fillColor(colors.muted).text(`Decision Recorded: ${inspection.finalDecisionAt || 'Not finalized yet'}`, 45, doc.y + 12);
  if (inspection.finalDecisionNotes) {
    doc.fontSize(8).font('Helvetica-Oblique').fillColor(colors.charcoal).text(`Reviewer Remarks: "${inspection.finalDecisionNotes}"`, 45, doc.y + 26, { width: 500 });
    doc.y += 40;
  } else {
    doc.y += 28;
  }

  // --- STATUTORY DISCLAIMER (Required by v0.3 spec) ---
  if (doc.y > 700) {
    doc.addPage();
    doc.y = 40;
  }
  doc.y += 15;
  doc.rect(40, doc.y, 515, 45).fill('#F4F4F5');
  doc.fontSize(7).font('Helvetica-Bold').fillColor(colors.muted).text('LEGAL & DEMO SCREENING NOTICE:', 48, doc.y + 6);
  doc.fontSize(7).font('Helvetica').fillColor(colors.muted).text(
    'This document is an AI-assisted preliminary screening inspection report produced by BUSTD for pre-production packaging QA evaluation. It is NOT an official legal certificate, statutory clearance, or government enforcement decision. Adjudication of Legal Metrology compliance is subject to official inspection and physical verification by authorized regulatory officers.',
    48,
    doc.y + 16,
    { width: 495, lineGap: 1.5 }
  );

  doc.end();
}
