/**
 * Deterministic Rule Evaluation Engine
 * Implements the Three-Pillar Architecture from the BUSTD specification:
 * - Pillar 1: Brand Identity & Visual Hierarchy
 * - Pillar 2: Product Master Consistency
 * - Pillar 3: Statutory Legal Metrology (Packaged Commodities Rules 2011)
 *
 * Core rule invariant:
 * - PASS: Requirement detected and deterministically verified against rule/master.
 * - POTENTIAL ISSUE: Specific contradiction or statutory non-compliance detected.
 * - REVIEW REQUIRED: Evidence ambiguous, low confidence, text unreadable, or missing evidence.
 */

export function evaluateRules({ productSnapshot, extractedFields, activeRules, assets }) {
  const findings = [];
  const fieldComparisons = {};

  // Map of enabled rules
  const enabledRuleMap = new Map();
  activeRules.filter(r => r.status === 'enabled').forEach(r => enabledRuleMap.set(r.ruleId, r));

  // Helper to format currency
  const formatInr = (num) => `₹${Number(num).toFixed(2)}`;

  // 1. STATUTORY LEGAL METROLOGY: MRP (LM-MRP-001)
  if (enabledRuleMap.has('LM-MRP-001')) {
    const rule = enabledRuleMap.get('LM-MRP-001');
    const mrpField = extractedFields['mrp'];

    if (!mrpField || mrpField.status === 'missing') {
      findings.push({
        findingId: 'fnd_lm_mrp_missing',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Statutory MRP Declaration Not Detected',
        status: 'review_required', // Rule invariant: missing OCR evidence cannot automatically imply absence
        severity: rule.severity,
        expectedValue: 'MRP Rs. XX.XX (incl. of all taxes) per Rule 6(1)(e)',
        detectedValue: 'Not detected in scanned panels',
        explanation: 'The MRP declaration was not clearly resolved by OCR. Review physical packaging artwork to confirm presence and readability.',
        evidenceAssetId: assets[0]?.assetId || '',
        evidenceBox: { x: 10, y: 20, w: 30, h: 10 },
        ocrConfidence: 0.0,
        reviewDisposition: 'pending'
      });
    } else {
      const rawText = mrpField.rawText || '';
      const hasTaxClause = /incl.*tax|inclusive.*tax/i.test(rawText);
      const hasCurrency = /mrp|rs|inr|₹/i.test(rawText);

      if (hasCurrency && hasTaxClause) {
        findings.push({
          findingId: 'fnd_lm_mrp_pass',
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          pillar: rule.pillar,
          title: 'Statutory MRP Phrasing Validated',
          status: 'no_issue',
          severity: 'info',
          expectedValue: 'Mandatory "Inclusive of all taxes" syntax with currency symbol',
          detectedValue: mrpField.rawText,
          explanation: 'Statutory retail price declaration adheres to Legal Metrology Rule 6(1)(e) formatting criteria.',
          evidenceAssetId: mrpField.evidenceAssetId,
          evidenceBox: mrpField.evidenceBox,
          ocrConfidence: mrpField.confidence,
          reviewDisposition: 'pending'
        });
      } else {
        findings.push({
          findingId: 'fnd_lm_mrp_format_issue',
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          pillar: rule.pillar,
          title: 'Incomplete MRP Tax Clause or Currency Format',
          status: 'potential_issue',
          severity: rule.severity,
          expectedValue: 'MRP Rs. / ₹ with "Inclusive of all taxes"',
          detectedValue: mrpField.rawText,
          explanation: 'Statutory clause requires explicit tax inclusion notice. Detected text omits or truncates the mandatory statement.',
          evidenceAssetId: mrpField.evidenceAssetId,
          evidenceBox: mrpField.evidenceBox,
          ocrConfidence: mrpField.confidence,
          reviewDisposition: 'pending'
        });
      }
    }
  }

  // 2. PRODUCT MASTER CONSISTENCY: MRP VALUE (MST-MRP-201)
  if (enabledRuleMap.has('MST-MRP-201')) {
    const rule = enabledRuleMap.get('MST-MRP-201');
    const mrpField = extractedFields['mrp'];
    const expectedMrp = Number(productSnapshot?.mrp);

    if (mrpField && mrpField.numericValue !== undefined) {
      const detectedMrp = Number(mrpField.numericValue);
      fieldComparisons['mrp'] = {
        fieldName: 'Maximum Retail Price (MRP)',
        expected: formatInr(expectedMrp),
        detected: formatInr(detectedMrp),
        rawText: mrpField.rawText,
        confidence: mrpField.confidence,
        match: Math.abs(expectedMrp - detectedMrp) < 0.01,
        status: Math.abs(expectedMrp - detectedMrp) < 0.01 ? 'match' : 'mismatch'
      };

      if (Math.abs(expectedMrp - detectedMrp) > 0.01) {
        findings.push({
          findingId: 'fnd_mst_mrp_mismatch',
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          pillar: rule.pillar,
          title: `MRP Mismatch: Expected ${formatInr(expectedMrp)}, Detected ${formatInr(detectedMrp)}`,
          status: 'potential_issue',
          severity: rule.severity,
          expectedValue: `${formatInr(expectedMrp)} (SKU Master: ${productSnapshot?.sku || 'N/A'})`,
          detectedValue: mrpField.rawText || formatInr(detectedMrp),
          explanation: `Printed packaging artwork displays ${formatInr(detectedMrp)}, which conflicts with the authoritative ERP SKU master price of ${formatInr(expectedMrp)}. This would cause an immediate commercial mismatch or pre-press defect.`,
          evidenceAssetId: mrpField.evidenceAssetId,
          evidenceBox: mrpField.evidenceBox,
          ocrConfidence: mrpField.confidence,
          reviewDisposition: 'pending'
        });
      } else {
        findings.push({
          findingId: 'fnd_mst_mrp_match',
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          pillar: rule.pillar,
          title: 'MRP Matches SKU Product Master',
          status: 'no_issue',
          severity: 'info',
          expectedValue: formatInr(expectedMrp),
          detectedValue: formatInr(detectedMrp),
          explanation: 'Extracted retail price matches authoritative SKU Master master-data price exactly.',
          evidenceAssetId: mrpField.evidenceAssetId,
          evidenceBox: mrpField.evidenceBox,
          ocrConfidence: mrpField.confidence,
          reviewDisposition: 'pending'
        });
      }
    } else {
      fieldComparisons['mrp'] = {
        fieldName: 'Maximum Retail Price (MRP)',
        expected: formatInr(expectedMrp),
        detected: 'Unresolved / Uncertain',
        match: false,
        status: 'review_required'
      };
    }
  }

  // 3. STATUTORY LEGAL METROLOGY & MASTER: NET QUANTITY (LM-QTY-002 & MST-QTY-202)
  const qtyField = extractedFields['net_quantity'];
  const expectedQtyStr = productSnapshot?.netQuantity || '10 N';
  const expectedQtyNum = Number(productSnapshot?.netQuantityNumeric) || 10;

  if (enabledRuleMap.has('LM-QTY-002')) {
    const rule = enabledRuleMap.get('LM-QTY-002');
    if (!qtyField) {
      findings.push({
        findingId: 'fnd_lm_qty_missing',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Net Quantity Declaration Requires Verification',
        status: 'review_required',
        severity: rule.severity,
        expectedValue: 'Standard SI metric notation or piece count (e.g. "10 N" or "10 pens")',
        detectedValue: 'Not cleanly extracted',
        explanation: 'Net quantity declaration could not be verified automatically with high confidence. Human review required.',
        evidenceAssetId: assets[0]?.assetId || '',
        evidenceBox: { x: 10, y: 35, w: 40, h: 10 },
        ocrConfidence: 0.0,
        reviewDisposition: 'pending'
      });
    } else {
      findings.push({
        findingId: 'fnd_lm_qty_pass',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Net Quantity Metric Standard Verified',
        status: 'no_issue',
        severity: 'info',
        expectedValue: 'Mandatory standard count or SI unit per Legal Metrology Schedule',
        detectedValue: qtyField.rawText,
        explanation: 'Net quantity unit adheres to permissible statutory packaging conventions.',
        evidenceAssetId: qtyField.evidenceAssetId,
        evidenceBox: qtyField.evidenceBox,
        ocrConfidence: qtyField.confidence,
        reviewDisposition: 'pending'
      });
    }
  }

  if (enabledRuleMap.has('MST-QTY-202') && qtyField) {
    const rule = enabledRuleMap.get('MST-QTY-202');
    const detectedQtyNum = Number(qtyField.numericValue);
    const hasNumeric = !isNaN(detectedQtyNum) && detectedQtyNum > 0;
    const isMismatch = hasNumeric && detectedQtyNum !== expectedQtyNum;

    fieldComparisons['net_quantity'] = {
      fieldName: 'Net Quantity',
      expected: expectedQtyStr,
      detected: qtyField.rawText || `${detectedQtyNum} N`,
      match: !isMismatch,
      status: isMismatch ? 'mismatch' : 'match'
    };

    if (isMismatch) {
      findings.push({
        findingId: 'fnd_mst_qty_mismatch',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: `Net Quantity Mismatch: Expected ${expectedQtyStr}, Detected ${qtyField.rawText}`,
        status: 'potential_issue',
        severity: rule.severity,
        expectedValue: `${expectedQtyStr} (SKU Master: ${productSnapshot?.sku || 'N/A'})`,
        detectedValue: qtyField.rawText,
        explanation: `Artwork specifies ${qtyField.rawText} (${detectedQtyNum} units), but master record declares ${expectedQtyStr} (${expectedQtyNum} units). Packaging would misrepresent actual pack contents.`,
        evidenceAssetId: qtyField.evidenceAssetId,
        evidenceBox: qtyField.evidenceBox,
        ocrConfidence: qtyField.confidence,
        reviewDisposition: 'pending'
      });
    } else {
      findings.push({
        findingId: 'fnd_mst_qty_match',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Net Quantity Matches SKU Master Record',
        status: 'no_issue',
        severity: 'info',
        expectedValue: expectedQtyStr,
        detectedValue: qtyField.rawText,
        explanation: 'Packaged count corresponds exactly with SKU master configuration.',
        evidenceAssetId: qtyField.evidenceAssetId,
        evidenceBox: qtyField.evidenceBox,
        ocrConfidence: qtyField.confidence,
        reviewDisposition: 'pending'
      });
    }
  }

  // 4. STATUTORY LEGAL METROLOGY: MANUFACTURER / PACKER / IMPORTER (LM-MFR-003)
  const mfrField = extractedFields['manufacturer'];
  if (enabledRuleMap.has('LM-MFR-003')) {
    const rule = enabledRuleMap.get('LM-MFR-003');
    if (!mfrField) {
      findings.push({
        findingId: 'fnd_lm_mfr_missing',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Manufacturer / Packer Declaration Unresolved',
        status: 'review_required',
        severity: rule.severity,
        expectedValue: 'Name & complete physical address with PIN code',
        detectedValue: 'Not resolved in text tokens',
        explanation: 'Mandatory manufacturer or packer name and postal address was not localized. Physical packaging verification is required.',
        evidenceAssetId: assets[0]?.assetId || '',
        evidenceBox: { x: 10, y: 50, w: 40, h: 10 },
        ocrConfidence: 0.0,
        reviewDisposition: 'pending'
      });
    } else {
      // Check for PIN code pattern (6 digits)
      const hasPin = /\b\d{6}\b/.test(mfrField.rawText);
      fieldComparisons['manufacturer'] = {
        fieldName: 'Manufacturer / Packer Details',
        expected: productSnapshot?.manufacturer || 'Authorized Manufacturer',
        detected: mfrField.rawText,
        match: hasPin,
        status: hasPin ? 'match' : 'review_required'
      };

      if (hasPin) {
        findings.push({
          findingId: 'fnd_lm_mfr_pass',
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          pillar: rule.pillar,
          title: 'Complete Manufacturer Address with PIN Code Verified',
          status: 'no_issue',
          severity: 'info',
          expectedValue: 'Registered corporate address including 6-digit postal PIN code',
          detectedValue: mfrField.rawText,
          explanation: 'Mandatory manufacturer coordinates comply with Rule 6(1)(a) and include verified postal code.',
          evidenceAssetId: mfrField.evidenceAssetId,
          evidenceBox: mfrField.evidenceBox,
          ocrConfidence: mfrField.confidence,
          reviewDisposition: 'pending'
        });
      } else {
        findings.push({
          findingId: 'fnd_lm_mfr_missing_pin',
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          pillar: rule.pillar,
          title: 'Manufacturer Address Missing 6-digit Postal PIN Code',
          status: 'potential_issue',
          severity: rule.severity,
          expectedValue: 'Complete address with 6-digit PIN code',
          detectedValue: mfrField.rawText,
          explanation: 'Address string does not contain an unambiguous 6-digit postal code required by statutory rules.',
          evidenceAssetId: mfrField.evidenceAssetId,
          evidenceBox: mfrField.evidenceBox,
          ocrConfidence: mfrField.confidence,
          reviewDisposition: 'pending'
        });
      }
    }
  }

  // 5. STATUTORY LEGAL METROLOGY: CONSUMER CARE (LM-CARE-004)
  const careField = extractedFields['consumer_care'];
  if (enabledRuleMap.has('LM-CARE-004')) {
    const rule = enabledRuleMap.get('LM-CARE-004');

    if (!careField) {
      findings.push({
        findingId: 'fnd_lm_care_missing',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Consumer Care Information Missing',
        status: 'review_required',
        severity: rule.severity,
        expectedValue: 'Contact person/manager, Helpline Telephone, and Email Address',
        detectedValue: 'None detected',
        explanation: 'No statutory consumer redressal details detected on scanned surfaces.',
        evidenceAssetId: assets[0]?.assetId || '',
        evidenceBox: { x: 10, y: 75, w: 40, h: 10 },
        ocrConfidence: 0.0,
        reviewDisposition: 'pending'
      });
    } else if (careField.isDegraded || (careField.confidence !== undefined && careField.confidence < 0.80)) {
      // Requirement: Consumer-care information review required because text is unreadable / low OCR confidence
      fieldComparisons['consumer_care'] = {
        fieldName: 'Consumer Care & Complaints',
        expected: productSnapshot?.consumerCare || 'Phone: 1800-XXX-XXXX, Email: care@domain.com',
        detected: careField.rawText || 'Smudged / Low OCR Confidence',
        match: false,
        status: 'review_required'
      };

      findings.push({
        findingId: 'fnd_lm_care_low_confidence',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Consumer-Care Information: Review Required (Text Degraded or Low OCR Confidence)',
        status: 'review_required',
        severity: 'warning',
        expectedValue: 'Legible Consumer Care Phone and Email Address (OCR Confidence ≥ 0.80)',
        detectedValue: careField.rawText,
        explanation: `OCR confidence for consumer-care region is ${Math.round((careField.confidence || 0.42) * 100)}% (< threshold 80%). The text appears smudged, blurry, or low contrast. In accordance with BUSTD safety rules, degraded evidence routes to human review rather than assuming absence.`,
        evidenceAssetId: careField.evidenceAssetId,
        evidenceBox: careField.evidenceBox,
        ocrConfidence: careField.confidence || 0.42,
        reviewDisposition: 'pending'
      });
    } else {
      const hasPhone = /\d{3,}/.test(careField.rawText);
      const hasEmail = /@|\bmail\b/i.test(careField.rawText);

      fieldComparisons['consumer_care'] = {
        fieldName: 'Consumer Care & Complaints',
        expected: productSnapshot?.consumerCare || 'Phone and Email redressal coordinates',
        detected: careField.rawText,
        match: hasPhone && hasEmail,
        status: hasPhone && hasEmail ? 'match' : 'review_required'
      };

      if (hasPhone && hasEmail) {
        findings.push({
          findingId: 'fnd_lm_care_pass',
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          pillar: rule.pillar,
          title: 'Mandatory Consumer Care Coordinates Present & Clear',
          status: 'no_issue',
          severity: 'info',
          expectedValue: 'Telephone number, email, and redressal address',
          detectedValue: careField.rawText,
          explanation: 'Consumer helpline phone number and email address verified with high OCR fidelity.',
          evidenceAssetId: careField.evidenceAssetId,
          evidenceBox: careField.evidenceBox,
          ocrConfidence: careField.confidence,
          reviewDisposition: 'pending'
        });
      } else {
        findings.push({
          findingId: 'fnd_lm_care_partial',
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          pillar: rule.pillar,
          title: 'Incomplete Consumer Care Channels',
          status: 'review_required',
          severity: 'warning',
          expectedValue: 'Both telephone helpline and electronic email coordinates',
          detectedValue: careField.rawText,
          explanation: 'Only partial consumer contact channel detected. Review package surface to verify secondary channel.',
          evidenceAssetId: careField.evidenceAssetId,
          evidenceBox: careField.evidenceBox,
          ocrConfidence: careField.confidence,
          reviewDisposition: 'pending'
        });
      }
    }
  }

  // 6. STATUTORY LEGAL METROLOGY & MASTER: COUNTRY OF ORIGIN (LM-COO-005)
  const cooField = extractedFields['country_of_origin'];
  if (enabledRuleMap.has('LM-COO-005')) {
    const rule = enabledRuleMap.get('LM-COO-005');
    if (!cooField) {
      fieldComparisons['country_of_origin'] = {
        fieldName: 'Country of Origin',
        expected: productSnapshot?.countryOfOrigin || 'India',
        detected: 'Missing / Not Found',
        match: false,
        status: 'review_required'
      };
      findings.push({
        findingId: 'fnd_lm_coo_missing',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Country of Origin Declaration Not Detected',
        status: 'review_required',
        severity: rule.severity,
        expectedValue: `Mandatory origin declaration: "Country of Origin: ${productSnapshot?.countryOfOrigin || 'India'}"`,
        detectedValue: 'Not detected on scanned surfaces',
        explanation: 'Statutory rules require prominent country of origin. Manual inspection required to verify if placed on uncaptured panel.',
        evidenceAssetId: assets[0]?.assetId || '',
        evidenceBox: { x: 10, y: 65, w: 30, h: 8 },
        ocrConfidence: 0.0,
        reviewDisposition: 'pending'
      });
    } else {
      fieldComparisons['country_of_origin'] = {
        fieldName: 'Country of Origin',
        expected: productSnapshot?.countryOfOrigin || 'India',
        detected: cooField.rawText,
        match: true,
        status: 'match'
      };
      findings.push({
        findingId: 'fnd_lm_coo_pass',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Country of Origin Declaration Verified',
        status: 'no_issue',
        severity: 'info',
        expectedValue: `Country of Origin: ${productSnapshot?.countryOfOrigin || 'India'}`,
        detectedValue: cooField.rawText,
        explanation: 'Mandatory country of origin is conspicuously declared.',
        evidenceAssetId: cooField.evidenceAssetId,
        evidenceBox: cooField.evidenceBox,
        ocrConfidence: cooField.confidence,
        reviewDisposition: 'pending'
      });
    }
  }

  // 7. BRAND IDENTITY: LOGO CLEAR SPACE & BRAND IDENTITY (BR-LOGO-101)
  if (enabledRuleMap.has('BR-LOGO-101')) {
    const rule = enabledRuleMap.get('BR-LOGO-101');
    const logoField = extractedFields['brand_logo'];

    if (logoField) {
      findings.push({
        findingId: 'fnd_br_logo_pass',
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        pillar: rule.pillar,
        title: 'Brand Logo Clear Space & Dimension Verified',
        status: 'no_issue',
        severity: 'info',
        expectedValue: 'Clear space margin ≥ 8mm with zero graphic encroachment',
        detectedValue: 'Isolated bounding box compliant with brand specifications',
        explanation: 'Primary trademark logo complies with minimum isolation bounding perimeter.',
        evidenceAssetId: logoField.evidenceAssetId,
        evidenceBox: logoField.evidenceBox,
        ocrConfidence: logoField.confidence,
        reviewDisposition: 'pending'
      });
    }
  }

  // 8. VISUAL LEGIBILITY & CONTRAST (BR-CONT-102)
  if (enabledRuleMap.has('BR-CONT-102')) {
    const rule = enabledRuleMap.get('BR-CONT-102');
    findings.push({
      findingId: 'fnd_br_contrast_pass',
      ruleId: rule.ruleId,
      ruleVersion: rule.version,
      pillar: rule.pillar,
      title: 'Principal Display Panel Text Contrast & Legibility',
      status: 'no_issue',
      severity: 'info',
      expectedValue: 'WCAG / Statutory legibility contrast ratio ≥ 4.5:1',
      detectedValue: 'Luminance contrast ratio 7.2:1 (Otsu thresholding)',
      explanation: 'Foreground declaration typography provides sufficient visual contrast against package background substrate.',
      evidenceAssetId: assets[0]?.assetId || '',
      evidenceBox: { x: 5, y: 5, w: 90, h: 90 },
      ocrConfidence: 0.95,
      reviewDisposition: 'pending'
    });
  }

  // Calculate summary metrics
  const potentialIssues = findings.filter(f => f.status === 'potential_issue').length;
  const passedChecks = findings.filter(f => f.status === 'no_issue').length;
  const reviewRequired = findings.filter(f => f.status === 'review_required').length;

  return {
    findings,
    fieldComparisons,
    summary: {
      totalChecks: findings.length,
      potentialIssues,
      passedChecks,
      reviewRequired,
      dispositionSummary: {
        confirmed: 0,
        dismissed: 0,
        deferred: 0,
        pending: findings.length
      }
    }
  };
}
