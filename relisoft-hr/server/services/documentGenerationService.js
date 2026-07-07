const RELISOFT_BRANDING = {
  companyName: 'ReliSoft Technologies',
  shortName: 'ReliSoft',
  tagline: 'Empowering Enterprises, Enabling Excellence',
  address: 'Platina Tower, 5th Floor, Plot No. C-59, Bandra Kurla Complex, Mumbai – 400051, India',
  phone: '+91 22 6834 1200',
  email: 'hr@relisofttechnologies.com',
  website: 'https://www.relisofttechnologies.com',
  cin: 'U72200MH2010PLC209876',
  gst: '27AABCU1234D1Z5',
  pan: 'AABCU1234D',
  logo: '/api/branding/logo.png',
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  accentColor: '#f59e0b',
};

const RELISOFT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1f2937; line-height: 1.6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .relisoft-doc { max-width: 210mm; margin: 0 auto; padding: 40px 50px; background: #ffffff; position: relative; min-height: 297mm; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 120px; font-weight: 900; color: rgba(30, 64, 175, 0.04); pointer-events: none; z-index: 0; white-space: nowrap; letter-spacing: 20px; text-transform: uppercase; }
  .doc-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid ${RELISOFT_BRANDING.primaryColor}; position: relative; z-index: 1; }
  .logo-area { flex-shrink: 0; width: 80px; height: 80px; background: linear-gradient(135deg, ${RELISOFT_BRANDING.primaryColor}, ${RELISOFT_BRANDING.secondaryColor}); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
  .header-text { flex: 1; }
  .header-text h1 { font-size: 22px; font-weight: 800; color: ${RELISOFT_BRANDING.primaryColor}; letter-spacing: -0.5px; }
  .header-text .tagline { font-size: 11px; color: #6b7280; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .header-text .address { font-size: 10px; color: #9ca3af; margin-top: 4px; line-height: 1.4; }
  .header-right { text-align: right; font-size: 10px; color: #9ca3af; }
  .doc-title { text-align: center; margin: 30px 0; position: relative; z-index: 1; }
  .doc-title h2 { font-size: 24px; font-weight: 800; color: ${RELISOFT_BRANDING.primaryColor}; letter-spacing: -0.5px; text-transform: uppercase; }
  .doc-title .divider { width: 80px; height: 4px; background: linear-gradient(to right, ${RELISOFT_BRANDING.primaryColor}, ${RELISOFT_BRANDING.accentColor}); margin: 10px auto; border-radius: 2px; }
  .doc-body { position: relative; z-index: 1; padding: 20px 0; }
  .doc-body p { margin-bottom: 12px; text-align: justify; font-size: 13px; color: #374151; }
  .doc-body .field-label { font-weight: 600; color: ${RELISOFT_BRANDING.primaryColor}; }
  .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
  .info-table td { padding: 8px 12px; border: 1px solid #e5e7eb; }
  .info-table td:first-child { font-weight: 600; background: #f8fafc; width: 200px; color: #374151; }
  .info-table td:last-child { color: #1f2937; }
  .certificate-border { position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 3px double ${RELISOFT_BRANDING.primaryColor}; border-radius: 16px; pointer-events: none; z-index: 0; }
  .certificate-border-inner { position: absolute; top: 28px; left: 28px; right: 28px; bottom: 28px; border: 1px solid ${RELISOFT_BRANDING.secondaryColor}; border-radius: 12px; pointer-events: none; z-index: 0; }
  .signature-section { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; position: relative; z-index: 1; }
  .signature-block { text-align: center; width: 220px; }
  .signature-line { width: 200px; border-top: 1px solid #374151; margin: 0 auto 8px; }
  .signature-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
  .signature-name { font-size: 13px; font-weight: 600; color: #1f2937; margin-top: 4px; }
  .official-link { margin-top: 30px; padding: 16px; background: #f0f5ff; border: 1px solid #bfdbfe; border-radius: 8px; text-align: center; position: relative; z-index: 1; }
  .official-link a { color: ${RELISOFT_BRANDING.primaryColor}; font-weight: 600; text-decoration: none; font-size: 13px; }
  .official-link a:hover { text-decoration: underline; }
  .doc-footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af; position: relative; z-index: 1; }
  .doc-footer .footer-links { display: flex; justify-content: center; gap: 20px; margin-bottom: 8px; }
  .doc-footer .footer-links a { color: ${RELISOFT_BRANDING.secondaryColor}; text-decoration: none; font-size: 10px; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
  .badge-blue { background: #dbeafe; color: ${RELISOFT_BRANDING.primaryColor}; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-amber { background: #fef3c7; color: #92400e; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .watermark { opacity: 0.04; } }
`;

function fillTemplateVariables(html, employee, extraVars = {}) {
  let result = html;
  const vars = {
    ...extraVars,
    empName: employee?.firstName + ' ' + employee?.lastName || '{{empName}}',
    empFirstName: employee?.firstName || '{{empFirstName}}',
    empLastName: employee?.lastName || '{{empLastName}}',
    empEmail: employee?.email || '{{empEmail}}',
    empPhone: employee?.phone || '{{empPhone}}',
    empDesignation: employee?.designation || employee?.position || employee?.role || '{{empDesignation}}',
    empDepartment: employee?.department || '{{empDepartment}}',
    empId: employee?.employeeId || employee?.empId || '{{empId}}',
    empGrade: employee?.grade || employee?.level || '{{empGrade}}',
    empJoinDate: employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN') : '{{empJoinDate}}',
    empPan: employee?.pan || employee?.panNumber || '{{empPan}}',
    empAadhaar: employee?.aadhaar || employee?.aadhaarNumber || '{{empAadhaar}}',
    empUan: employee?.uan || employee?.epfUan || '{{empUan}}',
    empBankName: employee?.bankName || '{{empBankName}}',
    empBankAccount: employee?.bankAccount || employee?.accountNumber || '{{empBankAccount}}',
    empIfsc: employee?.ifsc || employee?.ifscCode || '{{empIfsc}}',
    empAddress: employee?.address || employee?.permanentAddress || '{{empAddress}}',
    currentDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
    currentYear: new Date().getFullYear().toString(),
    financialYear: getFinancialYear(),
    companyName: RELISOFT_BRANDING.companyName,
    companyShortName: RELISOFT_BRANDING.shortName,
    companyAddress: RELISOFT_BRANDING.address,
    companyPhone: RELISOFT_BRANDING.phone,
    companyEmail: RELISOFT_BRANDING.email,
    companyWebsite: RELISOFT_BRANDING.website,
    companyCin: RELISOFT_BRANDING.cin,
    companyGst: RELISOFT_BRANDING.gst,
    companyPan: RELISOFT_BRANDING.pan,
    companyLogo: RELISOFT_BRANDING.logo,
  };

  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value ?? '');
  }

  result = result.replaceAll(/\{\{(\w+)\}\}/g, (match) => match);
  return result;
}

function getFinancialYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month < 3) return `${year - 1}-${year}`;
  return `${year}-${year + 1}`;
}

function watermarkSvg(text) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
      <pattern id="watermark" patternUnits="userSpaceOnUse" width="400" height="400" patternTransform="rotate(-25)">
        <text x="50" y="200" font-family="Inter, sans-serif" font-size="28" font-weight="800" fill="rgba(30,64,175,0.04)" transform="translate(0,0)">${text}</text>
        <text x="50" y="350" font-family="Inter, sans-serif" font-size="28" font-weight="800" fill="rgba(30,64,175,0.04)" transform="translate(0,0)">${text}</text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#watermark)" />
  </svg>`;
}

const DOCUMENT_TEMPLATES = {
  'award-certificate': {
    name: 'Award & Recognition Certificate',
    category: 'certificate',
    watermarkText: 'RELISOFT TECHNOLOGIES ★ EXCELLENCE',
    officialLink: 'https://www.relisofttechnologies.com/hr/awards-policy',
    officialLinkText: 'View Awards & Recognition Policy',
    bodyHtml: `
      <div class="certificate-border"></div>
      <div class="certificate-border-inner"></div>
      <div class="doc-title" style="margin-top: 60px;">
        <h2>Award of Excellence</h2>
        <div class="divider"></div>
      </div>
      <div class="doc-body" style="text-align: center; padding: 30px 40px;">
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">Presented to</p>
        <h3 style="font-size: 32px; font-weight: 800; color: ${RELISOFT_BRANDING.primaryColor}; margin-bottom: 8px; letter-spacing: 1px;">{{empName}}</h3>
        <p style="font-size: 14px; color: #4b5563; margin-bottom: 20px;">{{empDesignation}} · {{empDepartment}}</p>
        <div style="width: 120px; height: 3px; background: linear-gradient(to right, ${RELISOFT_BRANDING.accentColor}, ${RELISOFT_BRANDING.primaryColor}); margin: 20px auto; border-radius: 2px;"></div>
        <p style="font-size: 14px; line-height: 1.8; color: #374151; padding: 0 30px;">In recognition of outstanding contribution and exemplary performance in <strong>{{awardCategory}}</strong>. Your dedication, innovation, and commitment to excellence embody the values of {{companyName}}.</p>
        <div style="margin-top: 30px;">
          <span class="badge badge-blue">{{awardType}}</span>
          <span class="badge badge-green">{{awardDate}}</span>
        </div>
      </div>
    `,
    variables: [
      { name: 'awardCategory', label: 'Award Category', type: 'select', required: true, options: ['Innovation', 'Leadership', 'Customer Excellence', 'Team Collaboration', 'Performance', 'Long Service', 'Safety', 'Community Impact'] },
      { name: 'awardType', label: 'Award Type', type: 'select', required: true, options: ['Star Performer', 'Innovation Champion', 'Leadership Excellence', 'Customer Hero', 'Team Player', 'Long Service Award', 'Rising Star', 'Special Recognition'] },
      { name: 'awardDate', label: 'Award Date', type: 'date', required: true, defaultValue: '{{currentDate}}' },
    ],
  },

  'pf-nomination': {
    name: 'PF Nomination Form (Form 2)',
    category: 'statutory',
    watermarkText: 'RELISOFT TECHNOLOGIES · EPF',
    officialLink: 'https://www.epfindia.gov.in',
    officialLinkText: 'Visit EPFO Official Website',
    bodyHtml: `
      <div class="doc-title"><h2>EPF Nomination & Declaration Form (Form 2)</h2><div class="divider"></div></div>
      <div class="doc-body">
        <p style="font-weight: 600; font-size: 14px;">Under the Employees' Provident Funds Scheme, 1952</p>
        <table class="info-table">
          <tr><td>Employee Name</td><td>{{empName}}</td></tr>
          <tr><td>Employee ID</td><td>{{empId}}</td></tr>
          <tr><td>Date of Joining</td><td>{{empJoinDate}}</td></tr>
          <tr><td>Designation</td><td>{{empDesignation}}</td></tr>
          <tr><td>Department</td><td>{{empDepartment}}</td></tr>
          <tr><td>UAN Number</td><td>{{empUan}}</td></tr>
          <tr><td>PAN Number</td><td>{{empPan}}</td></tr>
          <tr><td>Aadhaar Number</td><td>{{empAadhaar}}</td></tr>
          <tr><td>Date of Birth</td><td>{{empDob}}</td></tr>
        </table>
        <p>I, <strong>{{empName}}</strong>, son/daughter of <strong>{{fatherName}}</strong>, hereby nominate the person(s) mentioned below to receive the amount standing to my credit in the Provident Fund in the event of my death:</p>
        <table class="info-table" style="margin-top: 20px;">
          <tr><td>Nominee Name</td><td>{{nomineeName}}</td></tr>
          <tr><td>Relationship</td><td>{{nomineeRelation}}</td></tr>
          <tr><td>Date of Birth</td><td>{{nomineeDob}}</td></tr>
          <tr><td>Share Percentage</td><td>{{nomineeShare}}%</td></tr>
          <tr><td>Address</td><td>{{nomineeAddress}}</td></tr>
        </table>
      </div>
    `,
    variables: [
      { name: 'fatherName', label: "Father's/Spouse Name", type: 'text', required: true },
      { name: 'empDob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'nomineeName', label: 'Nominee Name', type: 'text', required: true },
      { name: 'nomineeRelation', label: 'Relationship with Nominee', type: 'select', required: true, options: ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister'] },
      { name: 'nomineeDob', label: 'Nominee Date of Birth', type: 'date', required: true },
      { name: 'nomineeShare', label: 'Share Percentage', type: 'number', required: true, defaultValue: '100' },
      { name: 'nomineeAddress', label: 'Nominee Address', type: 'text', required: true },
    ],
  },

  'tds-certificate': {
    name: 'TDS Certificate (Form 16 / 16A)',
    category: 'statutory',
    watermarkText: 'RELISOFT TECHNOLOGIES · TDS',
    officialLink: 'https://www.incometax.gov.in',
    officialLinkText: 'Visit Income Tax Portal',
    bodyHtml: `
      <div class="doc-title"><h2>Certificate of Tax Deducted at Source</h2><p style="font-size: 13px; color: #6b7280; margin-top: 4px;">Form 16 / Form 16A under Section 203 of the Income Tax Act, 1961</p><div class="divider"></div></div>
      <div class="doc-body">
        <table class="info-table">
          <tr><td>Name of Employer</td><td>{{companyName}}</td></tr>
          <tr><td>PAN of Employer</td><td>{{companyPan}}</td></tr>
          <tr><td>TAN of Employer</td><td>{{companyTan}}</td></tr>
          <tr><td>Financial Year</td><td>{{financialYear}}</td></tr>
          <tr><td colspan="2" style="font-weight: 600; background: #f0f5ff;">Employee Details</td></tr>
          <tr><td>Name of Employee</td><td>{{empName}}</td></tr>
          <tr><td>Employee PAN</td><td>{{empPan}}</td></tr>
          <tr><td>Employee ID</td><td>{{empId}}</td></tr>
          <tr><td>Designation</td><td>{{empDesignation}}</td></tr>
          <tr><td>Date of Joining</td><td>{{empJoinDate}}</td></tr>
          <tr><td colspan="2" style="font-weight: 600; background: #f0f5ff;">Income & Tax Details</td></tr>
          <tr><td>Gross Salary</td><td>₹ {{grossSalary}}</td></tr>
          <tr><td>Less: Standard Deduction u/s 16(ia)</td><td>₹ 50,000</td></tr>
          <tr><td>Less: Deductions under Chapter VI-A</td><td>₹ {{chapter6ADeductions}}</td></tr>
          <tr><td>Taxable Income</td><td>₹ {{taxableIncome}}</td></tr>
          <tr><td>Tax on Total Income</td><td>₹ {{taxOnIncome}}</td></tr>
          <tr><td>Less: Rebate u/s 87A</td><td>₹ {{rebate87a}}</td></tr>
          <tr><td>Health & Education Cess @ 4%</td><td>₹ {{cessAmount}}</td></tr>
          <tr><td><strong>Total Tax Deducted</strong></td><td><strong>₹ {{totalTds}}</strong></td></tr>
        </table>
        <p>Certified that the above details are true and correct as per the records of {{companyName}}. This certificate is issued under the provisions of the Income Tax Act, 1961.</p>
      </div>
    `,
    variables: [
      { name: 'companyTan', label: 'Employer TAN', type: 'text', required: true, defaultValue: 'TAN12345A' },
      { name: 'grossSalary', label: 'Gross Salary (₹)', type: 'number', required: true },
      { name: 'chapter6ADeductions', label: 'Chapter VI-A Deductions (₹)', type: 'number', required: true, defaultValue: '150000' },
      { name: 'taxableIncome', label: 'Taxable Income (₹)', type: 'number', required: true },
      { name: 'taxOnIncome', label: 'Tax on Income (₹)', type: 'number', required: true },
      { name: 'rebate87a', label: 'Rebate u/s 87A (₹)', type: 'number', required: true, defaultValue: '0' },
      { name: 'cessAmount', label: 'Cess Amount (₹)', type: 'number', required: true, defaultValue: '0' },
      { name: 'totalTds', label: 'Total TDS Deducted (₹)', type: 'number', required: true },
    ],
  },

  'form16': {
    name: 'Form 16 (Full)',
    category: 'statutory',
    watermarkText: 'RELISOFT TECHNOLOGIES · FORM 16',
    officialLink: 'https://www.incometax.gov.in/iec/foportal',
    officialLinkText: 'File Income Tax Return',
    bodyHtml: `
      <div class="doc-title"><h2>Form 16</h2><p style="font-size: 13px; color: #6b7280; margin-top: 4px;">Under Rule 12(1) of the Income Tax Rules, 1962</p><div class="divider"></div></div>
      <div class="doc-body" style="page-break-after: always;">
        <h3 style="font-size: 16px; font-weight: 700; color: ${RELISOFT_BRANDING.primaryColor}; margin-bottom: 16px;">Part A — Details of Tax Deducted at Source</h3>
        <table class="info-table">
          <tr><td colspan="2" style="font-weight: 700; background: ${RELISOFT_BRANDING.primaryColor}; color: white; text-align: center;">Employer Details</td></tr>
          <tr><td>Name</td><td>{{companyName}}</td></tr>
          <tr><td>PAN</td><td>{{companyPan}}</td></tr>
          <tr><td>TAN</td><td>{{companyTan}}</td></tr>
          <tr><td>Address</td><td>{{companyAddress}}</td></tr>
          <tr><td colspan="2" style="font-weight: 700; background: ${RELISOFT_BRANDING.primaryColor}; color: white; text-align: center;">Employee Details</td></tr>
          <tr><td>Name</td><td>{{empName}}</td></tr>
          <tr><td>PAN</td><td>{{empPan}}</td></tr>
          <tr><td>Period</td><td>{{form16Period}}</td></tr>
          <tr><td colspan="2" style="font-weight: 700; background: ${RELISOFT_BRANDING.primaryColor}; color: white; text-align: center;">Quarter-wise TDS Details</td></tr>
          <tr><td>Q1 (Apr-Jun)</td><td>₹ {{tdsQ1}}</td></tr>
          <tr><td>Q2 (Jul-Sep)</td><td>₹ {{tdsQ2}}</td></tr>
          <tr><td>Q3 (Oct-Dec)</td><td>₹ {{tdsQ3}}</td></tr>
          <tr><td>Q4 (Jan-Mar)</td><td>₹ {{tdsQ4}}</td></tr>
          <tr><td><strong>Total TDS</strong></td><td><strong>₹ {{totalTdsForm16}}</strong></td></tr>
        </table>
        <div style="page-break-before: always; margin-top: 40px;">
          <h3 style="font-size: 16px; font-weight: 700; color: ${RELISOFT_BRANDING.primaryColor}; margin-bottom: 16px;">Part B — Salary & Tax Computation</h3>
          <table class="info-table">
            <tr><td>1. Gross Salary</td><td>₹ {{form16GrossSalary}}</td></tr>
            <tr><td>2. Less: Allowances exempt u/s 10</td><td>₹ {{exemptAllowances}}</td></tr>
            <tr><td>3. Balance (1-2)</td><td>₹ {{salaryBalance}}</td></tr>
            <tr><td>4. Less: Standard Deduction u/s 16(ia)</td><td>₹ 50,000</td></tr>
            <tr><td>5. Income from Salary (3-4)</td><td>₹ {{incomeFromSalary}}</td></tr>
            <tr><td>6. Add: Other Income</td><td>₹ {{otherIncome}}</td></tr>
            <tr><td>7. Gross Total Income (5+6)</td><td>₹ {{grossTotalIncome}}</td></tr>
            <tr><td>8. Less: Deductions u/s 80C to 80U</td><td>₹ {{totalSectionDeductions}}</td></tr>
            <tr><td>9. Total Income (7-8)</td><td>₹ {{totalIncomeForm16}}</td></tr>
            <tr><td>10. Tax on Total Income</td><td>₹ {{taxOnTotalIncome}}</td></tr>
            <tr><td>11. Less: Rebate u/s 87A</td><td>₹ {{rebate}}</td></tr>
            <tr><td>12. Tax after Rebate</td><td>₹ {{taxAfterRebate}}</td></tr>
            <tr><td>13. Add: Health & Education Cess @ 4%</td><td>₹ {{cess}}</td></tr>
            <tr><td><strong>14. Total Tax Payable</strong></td><td><strong>₹ {{totalTaxPayable}}</strong></td></tr>
            <tr><td>15. Less: TDS Deducted (from Part A)</td><td>₹ {{tdsDeductedForm16}}</td></tr>
            <tr><td><strong>16. Tax Payable / (Refund)</strong></td><td><strong>₹ {{taxPayableOrRefund}}</strong></td></tr>
          </table>
        </div>
      </div>
    `,
    variables: [
      { name: 'companyTan', label: 'Employer TAN', type: 'text', required: true, defaultValue: 'TAN12345A' },
      { name: 'form16Period', label: 'Period (e.g., Apr 2026 - Mar 2027)', type: 'text', required: true, defaultValue: 'Apr 2026 - Mar 2027' },
      { name: 'tdsQ1', label: 'Q1 TDS (₹)', type: 'number', required: true },
      { name: 'tdsQ2', label: 'Q2 TDS (₹)', type: 'number', required: true },
      { name: 'tdsQ3', label: 'Q3 TDS (₹)', type: 'number', required: true },
      { name: 'tdsQ4', label: 'Q4 TDS (₹)', type: 'number', required: true },
      { name: 'totalTdsForm16', label: 'Total TDS (₹)', type: 'number', required: true },
      { name: 'form16GrossSalary', label: 'Gross Salary (₹)', type: 'number', required: true },
      { name: 'exemptAllowances', label: 'Exempt Allowances u/s 10 (₹)', type: 'number', required: true, defaultValue: '0' },
      { name: 'salaryBalance', label: 'Salary Balance (₹)', type: 'number', required: true },
      { name: 'incomeFromSalary', label: 'Income from Salary (₹)', type: 'number', required: true },
      { name: 'otherIncome', label: 'Other Income (₹)', type: 'number', required: true, defaultValue: '0' },
      { name: 'grossTotalIncome', label: 'Gross Total Income (₹)', type: 'number', required: true },
      { name: 'totalSectionDeductions', label: 'Total Deductions 80C-80U (₹)', type: 'number', required: true, defaultValue: '150000' },
      { name: 'totalIncomeForm16', label: 'Total Income (₹)', type: 'number', required: true },
      { name: 'taxOnTotalIncome', label: 'Tax on Income (₹)', type: 'number', required: true },
      { name: 'rebate', label: 'Rebate u/s 87A (₹)', type: 'number', required: true, defaultValue: '0' },
      { name: 'taxAfterRebate', label: 'Tax after Rebate (₹)', type: 'number', required: true },
      { name: 'cess', label: 'Cess @ 4% (₹)', type: 'number', required: true, defaultValue: '0' },
      { name: 'totalTaxPayable', label: 'Total Tax Payable (₹)', type: 'number', required: true },
      { name: 'tdsDeductedForm16', label: 'TDS Already Deducted (₹)', type: 'number', required: true },
      { name: 'taxPayableOrRefund', label: 'Tax Payable / Refund (₹)', type: 'number', required: true },
    ],
  },

  'bonafide': {
    name: 'Bonafide Certificate',
    category: 'hr-letter',
    watermarkText: 'RELISOFT TECHNOLOGIES · BONAFIDE',
    officialLink: 'https://www.relisofttechnologies.com/hr/policies',
    officialLinkText: 'View HR Policies',
    bodyHtml: `
      <div class="doc-title"><h2>Bonafide Certificate</h2><div class="divider"></div></div>
      <div class="doc-body">
        <p style="text-align: center; font-size: 14px; margin-bottom: 20px;">TO WHOMSOEVER IT MAY CONCERN</p>
        <p>This is to certify that <strong>{{empName}}</strong> (Employee ID: <strong>{{empId}}</strong>) is a bonafide employee of <strong>{{companyName}}</strong> and has been working with us since <strong>{{empJoinDate}}</strong>.</p>
        <p>{{empName}} is currently employed as <strong>{{empDesignation}}</strong> in the <strong>{{empDepartment}}</strong> department.</p>
        <p>The annual compensation of the employee as per our records is <strong>₹ {{annualCtc}}</strong>.</p>
        <p>This certificate is issued on the request of the employee for the purpose of <strong>{{certificatePurpose}}</strong>.</p>
        <div class="official-link"><a href="{{companyWebsite}}" target="_blank">Verify at {{companyWebsite}}</a></div>
      </div>
    `,
    variables: [
      { name: 'annualCtc', label: 'Annual CTC (₹)', type: 'number', required: true },
      { name: 'certificatePurpose', label: 'Purpose of Certificate', type: 'select', required: true, options: ['Visa Application', 'Education Admission', 'Loan Application', 'Passport Application', 'Bank Account Opening', 'Property Rental', 'Other'] },
    ],
  },

  'loan-clearance': {
    name: 'Loan Clearance Certificate',
    category: 'financial',
    watermarkText: 'RELISOFT TECHNOLOGIES · LOAN CLEARED',
    officialLink: 'https://www.relisofttechnologies.com/hr/loan-policy',
    officialLinkText: 'View Loan Policy',
    bodyHtml: `
      <div class="doc-title"><h2>Loan Clearance Certificate</h2><div class="divider"></div></div>
      <div class="doc-body">
        <p style="text-align: center; font-size: 14px; margin-bottom: 20px;">TO WHOMSOEVER IT MAY CONCERN</p>
        <p>This is to certify that <strong>{{empName}}</strong> (Employee ID: <strong>{{empId}}</strong>) has fully repaid and cleared all dues pertaining to the loan(s) availed from {{companyName}}.</p>
        <table class="info-table">
          <tr><td>Loan Type</td><td>{{loanType}}</td></tr>
          <tr><td>Loan Sanction Date</td><td>{{loanSanctionDate}}</td></tr>
          <tr><td>Original Loan Amount</td><td>₹ {{loanAmount}}</td></tr>
          <tr><td>Date of Full Settlement</td><td>{{settlementDate}}</td></tr>
          <tr><td>Total Amount Repaid</td><td>₹ {{amountRepaid}}</td></tr>
          <tr><td>Outstanding Balance</td><td><strong>₹ 0 (NIL)</strong></td></tr>
        </table>
        <p>There are no outstanding liabilities against the employee towards the company as on date.</p>
      </div>
    `,
    variables: [
      { name: 'loanType', label: 'Loan Type', type: 'select', required: true, options: ['Home Loan', 'Education Loan', 'Personal Loan', 'Vehicle Loan', 'Advance Salary', 'Computer Loan', 'Emergency Loan'] },
      { name: 'loanSanctionDate', label: 'Loan Sanction Date', type: 'date', required: true },
      { name: 'loanAmount', label: 'Original Loan Amount (₹)', type: 'number', required: true },
      { name: 'settlementDate', label: 'Full Settlement Date', type: 'date', required: true, defaultValue: '{{currentDate}}' },
      { name: 'amountRepaid', label: 'Total Amount Repaid (₹)', type: 'number', required: true },
    ],
  },

  'noc': {
    name: 'No Objection Certificate (NOC)',
    category: 'noc',
    watermarkText: 'RELISOFT TECHNOLOGIES · NOC',
    officialLink: 'https://www.relisofttechnologies.com/hr/policies',
    officialLinkText: 'View HR Policies',
    bodyHtml: `
      <div class="doc-title"><h2>No Objection Certificate</h2><div class="divider"></div></div>
      <div class="doc-body">
        <p style="text-align: center; font-size: 14px; margin-bottom: 20px;">TO WHOMSOEVER IT MAY CONCERN</p>
        <p>This is to certify that {{companyName}} has <strong>no objection</strong> to <strong>{{empName}}</strong> (Employee ID: <strong>{{empId}}</strong>) for the following:</p>
        <table class="info-table">
          <tr><td>Purpose of NOC</td><td>{{nocPurpose}}</td></tr>
          <tr><td>Employee Designation</td><td>{{empDesignation}}</td></tr>
          <tr><td>Department</td><td>{{empDepartment}}</td></tr>
          <tr><td>Date of Joining</td><td>{{empJoinDate}}</td></tr>
        </table>
        <p>{{nocDetails}}</p>
        <p>This NOC is issued without any prejudice to the terms of employment and does not constitute any commitment or obligation on the part of the company.</p>
      </div>
    `,
    variables: [
      { name: 'nocPurpose', label: 'Purpose of NOC', type: 'select', required: true, options: ['Passport Application', 'Visa Application', 'Bank Loan', 'Higher Education', 'Part-time Employment', 'Business Registration', 'Other'] },
      { name: 'nocDetails', label: 'Additional Details', type: 'text', required: true, defaultValue: 'The company has no objection to the above-mentioned purpose.' },
    ],
  },

  'experience-letter': {
    name: 'Experience & Relieving Letter',
    category: 'hr-letter',
    watermarkText: 'RELISOFT TECHNOLOGIES · EXPERIENCE',
    officialLink: 'https://www.relisofttechnologies.com/careers',
    officialLinkText: 'View Career Opportunities',
    bodyHtml: `
      <div class="doc-title"><h2>Experience & Relieving Letter</h2><div class="divider"></div></div>
      <div class="doc-body">
        <p style="text-align: center; font-size: 14px; margin-bottom: 20px;">TO WHOMSOEVER IT MAY CONCERN</p>
        <p>This is to certify that <strong>{{empName}}</strong> (Employee ID: <strong>{{empId}}</strong>) was employed with <strong>{{companyName}}</strong> from <strong>{{empJoinDate}}</strong> to <strong>{{relievingDate}}</strong>.</p>
        <p>During their tenure, {{empName}} served as <strong>{{empDesignation}}</strong> in the <strong>{{empDepartment}}</strong> department and demonstrated exceptional professionalism, dedication, and competence.</p>
        <p><strong>Key Responsibilities:</strong></p>
        <p>{{responsibilities}}</p>
        <p><strong>Skills & Competencies:</strong><br>{{skills}}</p>
        <p>{{empName}} is relieved from the services of the company with effect from <strong>{{relievingDate}}</strong>. We wish them all the best in their future endeavors.</p>
      </div>
    `,
    variables: [
      { name: 'relievingDate', label: 'Date of Relieving', type: 'date', required: true },
      { name: 'responsibilities', label: 'Key Responsibilities', type: 'text', required: true, defaultValue: 'Managed key projects and led team initiatives.' },
      { name: 'skills', label: 'Skills & Competencies', type: 'text', required: true, defaultValue: 'Team leadership, project management, client relationship management.' },
    ],
  },

  'salary-certificate': {
    name: 'Salary Certificate',
    category: 'financial',
    watermarkText: 'RELISOFT TECHNOLOGIES · SALARY',
    officialLink: 'https://www.relisofttechnologies.com/hr/payroll-policy',
    officialLinkText: 'View Payroll Policy',
    bodyHtml: `
      <div class="doc-title"><h2>Salary Certificate</h2><div class="divider"></div></div>
      <div class="doc-body">
        <p style="text-align: center; font-size: 14px; margin-bottom: 20px;">TO WHOMSOEVER IT MAY CONCERN</p>
        <p>This is to certify that <strong>{{empName}}</strong> (Employee ID: <strong>{{empId}}</strong>) is employed with {{companyName}} and draws the following compensation:</p>
        <table class="info-table">
          <tr><td>Designation</td><td>{{empDesignation}}</td></tr>
          <tr><td>Department</td><td>{{empDepartment}}</td></tr>
          <tr><td colspan="2" style="font-weight: 600; background: #f0f5ff;">Annual Compensation Breakdown</td></tr>
          <tr><td>Basic Salary</td><td>₹ {{annualBasic}}</td></tr>
          <tr><td>House Rent Allowance (HRA)</td><td>₹ {{annualHra}}</td></tr>
          <tr><td>Special Allowance</td><td>₹ {{annualSpecial}}</td></tr>
          <tr><td>Other Allowances</td><td>₹ {{annualOther}}</td></tr>
          <tr><td>Employer PF Contribution</td><td>₹ {{annualPf}}</td></tr>
          <tr><td>Bonus / Performance Pay</td><td>₹ {{annualBonus}}</td></tr>
          <tr><td><strong>Total Cost to Company (CTC)</strong></td><td><strong>₹ {{totalCtc}}</strong></td></tr>
        </table>
        <p>This certificate is issued on request and is valid for the purpose of <strong>{{salaryCertPurpose}}</strong>.</p>
      </div>
    `,
    variables: [
      { name: 'annualBasic', label: 'Annual Basic (₹)', type: 'number', required: true },
      { name: 'annualHra', label: 'Annual HRA (₹)', type: 'number', required: true },
      { name: 'annualSpecial', label: 'Annual Special Allowance (₹)', type: 'number', required: true },
      { name: 'annualOther', label: 'Other Allowances (₹)', type: 'number', required: true, defaultValue: '0' },
      { name: 'annualPf', label: 'Annual PF (Employer) (₹)', type: 'number', required: true },
      { name: 'annualBonus', label: 'Annual Bonus (₹)', type: 'number', required: true, defaultValue: '0' },
      { name: 'totalCtc', label: 'Total CTC (₹)', type: 'number', required: true },
      { name: 'salaryCertPurpose', label: 'Certificate Purpose', type: 'select', required: true, options: ['Loan Application', 'Visa Processing', 'Rental Agreement', 'Credit Card Application', 'Insurance', 'Other'] },
    ],
  },

  'appreciation-letter': {
    name: 'Appreciation / Commendation Letter',
    category: 'hr-letter',
    watermarkText: 'RELISOFT TECHNOLOGIES · APPRECIATION',
    officialLink: 'https://www.relisofttechnologies.com/hr/recognition',
    officialLinkText: 'View Recognition Programs',
    bodyHtml: `
      <div class="doc-title"><h2>Letter of Appreciation</h2><div class="divider"></div></div>
      <div class="doc-body">
        <p style="font-size: 14px; color: #6b7280;">Date: {{currentDate}}</p>
        <p style="margin-top: 20px;"><strong>Dear {{empName}},</strong></p>
        <p>On behalf of {{companyName}}, I am pleased to express our sincere appreciation for your outstanding contribution in {{appreciationContext}}.</p>
        <p>{{appreciationBody}}</p>
        <p>Your dedication, professionalism, and commitment to excellence have significantly contributed to our organization's success. Your efforts are truly valued and recognized.</p>
        <p>We look forward to your continued contributions and wish you great success in all your future endeavors.</p>
        <p style="margin-top: 30px;">With warm regards,</p>
        <p style="font-weight: 600; margin-top: 40px;">{{appreciationAuthor}}<br><span style="font-weight: 400; font-size: 12px; color: #6b7280;">{{authorDesignation}}, {{companyName}}</span></p>
      </div>
    `,
    variables: [
      { name: 'appreciationContext', label: 'Context / Reason', type: 'select', required: true, options: ['Project Excellence', 'Client Appreciation', 'Team Leadership', 'Initiative & Innovation', 'Customer Service', 'Process Improvement', 'Long Service', 'Extra Effort'] },
      { name: 'appreciationBody', label: 'Appreciation Message', type: 'text', required: true, defaultValue: 'Your exceptional work on the recent project exceeded all expectations. Your dedication and innovative approach delivered outstanding results.' },
      { name: 'appreciationAuthor', label: 'Author Name (Manager/HR)', type: 'text', required: true },
      { name: 'authorDesignation', label: 'Author Designation', type: 'text', required: true, defaultValue: 'Head of Human Resources' },
    ],
  },

  'gate-pass': {
    name: 'Visitor / Employee Gate Pass',
    category: 'other',
    watermarkText: 'RELISOFT TECHNOLOGIES · SECURITY',
    showWatermark: false,
    officialLink: 'https://www.relisofttechnologies.com/security',
    officialLinkText: 'View Security Policies',
    bodyHtml: `
      <div class="doc-title"><h2>Gate Pass</h2><div class="divider"></div></div>
      <div class="doc-body">
        <table class="info-table">
          <tr><td>Pass Number</td><td><strong>{{gatePassNumber}}</strong></td></tr>
          <tr><td>Name</td><td>{{empName}}</td></tr>
          <tr><td>Type</td><td><span class="badge badge-blue">{{gatePassType}}</span></td></tr>
          <tr><td>Date</td><td>{{currentDate}}</td></tr>
          <tr><td>Valid From</td><td>{{validFrom}}</td></tr>
          <tr><td>Valid Till</td><td>{{validTill}}</td></tr>
          <tr><td>Purpose</td><td>{{gatePassPurpose}}</td></tr>
          <tr><td>Authorized By</td><td>{{authorizedBy}}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; text-align: center;">
          <p style="font-size: 12px; font-weight: 600; color: #92400e;">Please present this pass at the security desk upon arrival and departure.</p>
        </div>
      </div>
    `,
    variables: [
      { name: 'gatePassNumber', label: 'Gate Pass Number', type: 'text', required: true, defaultValue: 'GP-' + Date.now().toString(36).toUpperCase() },
      { name: 'gatePassType', label: 'Pass Type', type: 'select', required: true, options: ['Employee', 'Visitor', 'Contractor', 'Temporary', 'VIP'] },
      { name: 'validFrom', label: 'Valid From', type: 'date', required: true, defaultValue: '{{currentDate}}' },
      { name: 'validTill', label: 'Valid Till', type: 'date', required: true },
      { name: 'gatePassPurpose', label: 'Purpose', type: 'text', required: true },
      { name: 'authorizedBy', label: 'Authorized By', type: 'text', required: true },
    ],
  },

  'recognition-letter': {
    name: 'Recognition & Commendation Certificate',
    category: 'certificate',
    watermarkText: 'RELISOFT TECHNOLOGIES ★ RECOGNITION',
    officialLink: 'https://www.relisofttechnologies.com/hr/recognition',
    officialLinkText: 'View Recognition Programs',
    bodyHtml: `
      <div class="certificate-border"></div>
      <div class="certificate-border-inner"></div>
      <div class="doc-title" style="margin-top: 60px;">
        <h2>Recognition Certificate</h2>
        <div class="divider"></div>
      </div>
      <div class="doc-body" style="text-align: center; padding: 30px 40px;">
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">{{companyName}} proudly recognizes</p>
        <h3 style="font-size: 30px; font-weight: 800; color: ${RELISOFT_BRANDING.primaryColor}; margin-bottom: 8px; letter-spacing: 1px;">{{empName}}</h3>
        <p style="font-size: 14px; color: #4b5563; margin-bottom: 16px;">{{empDesignation}} · {{empDepartment}}</p>
        <div style="width: 100px; height: 3px; background: linear-gradient(to right, ${RELISOFT_BRANDING.accentColor}, ${RELISOFT_BRANDING.primaryColor}); margin: 16px auto;"></div>
        <p style="font-size: 14px; line-height: 1.8; color: #374151; font-style: italic; padding: 0 30px;">"{{recognitionQuote}}"</p>
        <div style="margin-top: 20px;">
          <span class="badge badge-amber">{{recognitionType}}</span>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #374151;">For demonstrating {{recognizedQuality}} and making a significant impact on our organization.</p>
      </div>
    `,
    variables: [
      { name: 'recognitionQuote', label: 'Recognition Quote', type: 'text', required: true, defaultValue: 'Excellence is not a skill. It is an attitude.' },
      { name: 'recognitionType', label: 'Recognition Type', type: 'select', required: true, options: ['Spot Recognition', 'Quarterly Star', 'Values Champion', 'Innovation Award', 'Customer Delight', 'Team Player', 'Leadership Award'] },
      { name: 'recognizedQuality', label: 'Recognized Quality', type: 'select', required: true, options: ['Leadership', 'Innovation', 'Collaboration', 'Customer Focus', 'Integrity', 'Excellence', 'Ownership', 'Inclusive Mindset'] },
    ],
  },
};

class DocumentGenerationService {
  async generateDocument(templateCode, employee, variables) {
    const template = DOCUMENT_TEMPLATES[templateCode];
    if (!template) throw new Error(`Unknown template: ${templateCode}`);

    const body = fillTemplateVariables(template.bodyHtml || template.content || '', employee, variables);
    const header = template.headerHtml || this._defaultHeader();
    const footer = template.footerHtml || this._defaultFooter();
    const watermark = template.showWatermark !== false ? `<div class="watermark">${template.watermarkText || RELISOFT_BRANDING.companyName}</div>` : '';
    const officialLink = template.officialLink ? `
      <div class="official-link">
        <a href="${template.officialLink}" target="_blank" rel="noopener noreferrer">
          🔗 ${template.officialLinkText || 'View Official Guidelines'}
        </a>
        <p style="font-size: 11px; color: #6b7280; margin-top: 6px;">For detailed information, please visit the official website</p>
      </div>` : '';
    const borderHtml = template.category === 'certificate' ? '' : '';

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${template.name} — ${RELISOFT_BRANDING.companyName}</title>
<style>${RELISOFT_STYLES}</style></head>
<body>
<div class="relisoft-doc">
  ${watermark}
  ${header}
  ${body}
  ${officialLink}
  <div class="signature-section">
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-label">Prepared By</div>
      <div class="signature-name">${RELISOFT_BRANDING.shortName} HR</div>
    </div>
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-label">Authorized Signatory</div>
      <div class="signature-name">{{authorizedSignatory}}</div>
    </div>
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-label">Employee</div>
      <div class="signature-name">{{empName}}</div>
    </div>
  </div>
  ${footer}
</div>
<div style="text-align: center; padding: 10px; font-size: 10px; color: #9ca3af;">
  Document generated by ReliSoft HR Platform · ${new Date().toISOString()} · Template v${template.version || 1}
</div>
</body></html>`;

    return fullHtml;
  }

  getTemplate(templateCode) {
    const t = DOCUMENT_TEMPLATES[templateCode];
    if (!t) return null;
    return {
      code: templateCode,
      name: t.name,
      category: t.category,
      description: t.description,
      watermarkText: t.watermarkText,
      showWatermark: t.showWatermark,
      showLogo: t.showLogo,
      showBorder: t.showBorder,
      variables: t.variables,
      officialLink: t.officialLink,
      officialLinkText: t.officialLinkText || 'View Official Guidelines',
      version: t.version || 1,
    };
  }

  getAllTemplates() {
    return Object.entries(DOCUMENT_TEMPLATES).map(([code, t]) => ({
      code,
      name: t.name,
      category: t.category,
      description: t.description,
      watermarkText: t.watermarkText,
      showWatermark: t.showWatermark !== false,
      variables: t.variables,
      officialLink: t.officialLink,
      officialLinkText: t.officialLinkText,
    }));
  }

  static getBranding() { return RELISOFT_BRANDING; }
  static getStyles() { return RELISOFT_STYLES; }

  _defaultHeader() {
    return `
      <div class="doc-header">
        <div class="logo-area">RS</div>
        <div class="header-text">
          <h1>${RELISOFT_BRANDING.companyName}</h1>
          <div class="tagline">${RELISOFT_BRANDING.tagline}</div>
          <div class="address">${RELISOFT_BRANDING.address} · ${RELISOFT_BRANDING.phone}</div>
        </div>
        <div class="header-right">
          <div>CIN: ${RELISOFT_BRANDING.cin}</div>
          <div>GST: ${RELISOFT_BRANDING.gst}</div>
          <div>PAN: ${RELISOFT_BRANDING.pan}</div>
        </div>
      </div>`;
  }

  _defaultFooter() {
    return `
      <div class="doc-footer">
        <div class="footer-links">
          <a href="${RELISOFT_BRANDING.website}" target="_blank">Website</a>
          <a href="mailto:${RELISOFT_BRANDING.email}">Email</a>
          <a href="${RELISOFT_BRANDING.website}/privacy" target="_blank">Privacy Policy</a>
          <a href="${RELISOFT_BRANDING.website}/terms" target="_blank">Terms of Service</a>
        </div>
        <div>${RELISOFT_BRANDING.companyName} · ${RELISOFT_BRANDING.address}</div>
        <div>© ${new Date().getFullYear()} ${RELISOFT_BRANDING.companyName}. All rights reserved. | CIN: ${RELISOFT_BRANDING.cin}</div>
        <div style="margin-top: 4px; color: #d1d5db;">This is a system-generated document. For verification, scan QR or visit ${RELISOFT_BRANDING.website}/verify</div>
      </div>`;
  }
}

export { DOCUMENT_TEMPLATES, RELISOFT_BRANDING, RELISOFT_STYLES };
export default new DocumentGenerationService();
