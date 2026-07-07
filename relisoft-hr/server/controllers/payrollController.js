import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import SalaryStructure from '../models/SalaryStructure.js';
import Payslip from '../models/Payslip.js';
import TaxDeclaration from '../models/TaxDeclaration.js';

export const getPayrolls = async (req, res) => {
  try {
    const { page = 1, limit = 10, month, year, department, status } = req.query;
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;
    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      query.employee = { $in: employees.map((e) => e._id) };
    }

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Payroll.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payrolls,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee');

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const m = parseInt(month);
    const y = parseInt(year);

    const employees = await Employee.find({ status: 'active' });

    const payrolls = [];
    for (const employee of employees) {
      const existing = await Payroll.findOne({
        employee: employee._id,
        month: m,
        year: y,
      });

      if (!existing) {
        const payroll = await Payroll.create({
          employee: employee._id,
          month: m,
          year: y,
          basicSalary: employee.salary?.basic || 0,
          allowances: employee.salary?.allowances || [],
          deductions: employee.salary?.deductions || [],
          status: 'processing',
        });
        payrolls.push(payroll);
      }
    }

    res.status(201).json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPayroll = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const payrolls = await Payroll.find({ employee: employee._id }).sort('-year -month');

    res.status(200).json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee');

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const payroll = await Payroll.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayrollSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth();
    const y = parseInt(year) || new Date().getFullYear();

    const payrolls = await Payroll.find({ month: m, year: y }).populate('employee', 'department');

    const totalGross = payrolls.reduce((sum, p) => sum + (p.grossPay || 0), 0);
    const totalNet = payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + (p.totalDeductions || 0), 0);

    const departmentWise = {};
    for (const p of payrolls) {
      const dept = p.employee?.department || 'unknown';
      if (!departmentWise[dept]) departmentWise[dept] = { count: 0, total: 0 };
      departmentWise[dept].count++;
      departmentWise[dept].total += p.netPay || 0;
    }

    res.status(200).json({
      success: true,
      data: {
        month: m,
        year: y,
        totalEmployees: payrolls.length,
        totalGross,
        totalNet,
        totalDeductions,
        departmentWise,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const computeStructureTotals = (components) => {
  let totalEarnings = 0;
  let totalDeductions = 0;

  for (const comp of components) {
    if (!comp.isActive) continue;
    if (comp.type === 'Earnings') {
      totalEarnings += comp.value || 0;
    } else {
      totalDeductions += comp.value || 0;
    }
  }

  return {
    totalEarnings,
    totalDeductions,
    netTotal: totalEarnings - totalDeductions,
  };
};

export const createSalaryStructure = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });

    const totals = computeStructureTotals(req.body.components || []);

    const structure = await SalaryStructure.create({
      ...req.body,
      ...totals,
      createdBy: employee?._id || req.body.createdBy,
    });

    res.status(201).json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalaryStructures = async (req, res) => {
  try {
    const { status, isDefault } = req.query;
    const query = {};
    if (status) query.status = status;
    if (isDefault !== undefined) query.isDefault = isDefault === 'true';

    const structures = await SalaryStructure.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: structures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalaryStructure = async (req, res) => {
  try {
    const structure = await SalaryStructure.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!structure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found' });
    }

    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSalaryStructure = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.components) {
      const totals = computeStructureTotals(req.body.components);
      updateData.totalEarnings = totals.totalEarnings;
      updateData.totalDeductions = totals.totalDeductions;
      updateData.netTotal = totals.netTotal;
    }

    const structure = await SalaryStructure.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!structure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found' });
    }

    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSalaryStructure = async (req, res) => {
  try {
    const structure = await SalaryStructure.findByIdAndDelete(req.params.id);

    if (!structure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found' });
    }

    res.status(200).json({ success: true, message: 'Salary structure deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setDefaultStructure = async (req, res) => {
  try {
    await SalaryStructure.updateMany({ isDefault: true }, { isDefault: false });

    const structure = await SalaryStructure.findByIdAndUpdate(
      req.params.id,
      { isDefault: true },
      { new: true }
    );

    if (!structure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found' });
    }

    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const numberToWords = (num) => {
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertBelow1000 = (n) => {
    if (n === 0) return '';
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  };

  const convertBelow10000000 = (n) => {
    if (n === 0) return 'Zero';
    let str = '';
    const crore = Math.floor(n / 10000000);
    if (crore > 0) {
      str += convertBelow1000(crore) + ' Crore ';
      n %= 10000000;
    }
    const lakh = Math.floor(n / 100000);
    if (lakh > 0) {
      str += convertBelow1000(lakh) + ' Lakh ';
      n %= 100000;
    }
    const thousand = Math.floor(n / 1000);
    if (thousand > 0) {
      str += convertBelow1000(thousand) + ' Thousand ';
      n %= 1000;
    }
    const hundred = Math.floor(n / 100);
    if (hundred > 0) {
      str += ones[hundred] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str) str += 'and ';
      str += ones[n] + ' ';
    }
    return str.trim();
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let words = convertBelow10000000(integerPart) + ' Rupees';
  if (decimalPart > 0) {
    words += ' and ' + convertBelow1000(decimalPart) + ' Paise';
  }
  words += ' Only';

  return words;
};

const generatePayslipData = async (employee, month, year, salaryStructureId) => {
  let structure;
  if (salaryStructureId) {
    structure = await SalaryStructure.findById(salaryStructureId);
  }
  if (!structure) {
    structure = await SalaryStructure.findOne({ isDefault: true, status: 'Active' });
  }

  const earnings = [];
  const deductions = [];
  let grossEarnings = 0;
  let grossDeductions = 0;

  if (structure) {
    for (const comp of structure.components) {
      if (!comp.isActive) continue;
      let amount = comp.value || 0;

      if (comp.calculationType === 'Percentage' && comp.percentageOf) {
        const baseComp = structure.components.find(
          (c) => c.name === comp.percentageOf && c.isActive
        );
        if (baseComp) {
          amount = (baseComp.value * (comp.value || 0)) / 100;
        }
      } else if (comp.calculationType === 'Formula') {
        try {
          const totalEarnings = structure.components
            .filter((c) => c.type === 'Earnings' && c.isActive)
            .reduce((s, c) => s + (c.value || 0), 0);
          const totalDeductions = structure.components
            .filter((c) => c.type === 'Deduction' && c.isActive)
            .reduce((s, c) => s + (c.value || 0), 0);
          const monthlyTotal = totalEarnings - totalDeductions;
          const formula = (comp.formula || '')
            .replace(/basic/gi, String(structure.components.find(c => c.name.toLowerCase() === 'basic')?.value || 0))
            .replace(/total/gi, String(monthlyTotal))
            .replace(/gross/gi, String(totalEarnings));
          amount = eval(formula) || 0;
        } catch {
          amount = comp.value || 0;
        }
      }

      if (comp.type === 'Earnings') {
        earnings.push({ name: comp.name, amount });
        grossEarnings += amount;
      } else {
        deductions.push({ name: comp.name, amount });
        grossDeductions += amount;
      }
    }
  } else {
    grossEarnings = employee.salary?.basic || 0;
    earnings.push({ name: 'Basic Pay', amount: grossEarnings });
  }

  const netPay = grossEarnings - grossDeductions;
  const amountInWords = numberToWords(netPay);

  return {
    employee: employee._id,
    salaryStructure: structure?._id,
    earnings,
    deductions,
    grossEarnings,
    grossDeductions,
    netPay,
    totalDays: 30,
    daysWorked: 30,
    daysPaid: 30,
    totalPayable: netPay,
    amountInWords,
    bankName: employee.bankName || '',
    bankAccount: employee.accountNumber || '',
    status: 'Generated',
  };
};

export const generatePayslipForEmployee = async (req, res) => {
  try {
    const { employeeId, month, year, salaryStructureId } = req.body;
    const m = parseInt(month);
    const y = parseInt(year);

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const existing = await Payslip.findOne({ employee: employeeId, month: m, year: y });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Payslip already exists for this employee for the given month/year',
      });
    }

    const payslipData = await generatePayslipData(employee, m, y, salaryStructureId);
    const payslip = await Payslip.create({ ...payslipData, month: m, year: y });

    res.status(201).json({ success: true, data: payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayslips = async (req, res) => {
  try {
    const { page = 1, limit = 10, employee, month, year, status } = req.query;
    const query = {};
    if (employee) query.employee = employee;
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const payslips = await Payslip.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .populate('salaryStructure', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-year -month');

    const total = await Payslip.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payslips,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employee')
      .populate('salaryStructure', 'name');

    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    res.status(200).json({ success: true, data: payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkGeneratePayslips = async (req, res) => {
  try {
    const { month, year, salaryStructureId } = req.body;
    const m = parseInt(month);
    const y = parseInt(year);

    const employees = await Employee.find({ employmentStatus: 'active' });

    const results = { created: 0, skipped: 0, errors: [] };

    for (const employee of employees) {
      try {
        const existing = await Payslip.findOne({ employee: employee._id, month: m, year: y });
        if (existing) {
          results.skipped++;
          continue;
        }

        const payslipData = await generatePayslipData(employee, m, y, salaryStructureId);
        await Payslip.create({ ...payslipData, month: m, year: y });
        results.created++;
      } catch (err) {
        results.errors.push({ employee: employee._id, message: err.message });
      }
    }

    res.status(201).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approvePayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );

    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    res.status(200).json({ success: true, data: payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayslipPDF = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employee')
      .populate('salaryStructure', 'name');

    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    const emp = payslip.employee;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const earningsRows = payslip.earnings.map((e) =>
      `<tr><td style="padding:4px 8px;border:1px solid #ddd;">${e.name}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${e.amount.toFixed(2)}</td></tr>`
    ).join('');

    const deductionsRows = payslip.deductions.map((d) =>
      `<tr><td style="padding:4px 8px;border:1px solid #ddd;">${d.name}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${d.amount.toFixed(2)}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Payslip</title>
<style>
body { font-family: Arial, sans-serif; font-size: 12px; }
.payslip { width: 700px; margin: 20px auto; border: 2px solid #333; padding: 20px; }
.header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 15px; padding-bottom: 10px; }
.header h1 { margin: 0; font-size: 20px; }
.header h3 { margin: 5px 0; color: #555; }
.details { width: 100%; margin-bottom: 15px; }
.details td { padding: 3px 8px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
th { background: #f0f0f0; padding: 6px 8px; border: 1px solid #ddd; text-align: left; }
.total-row { font-weight: bold; background: #f9f9f9; }
.footer { margin-top: 15px; text-align: center; font-size: 10px; color: #777; }
</style></head><body>
<div class="payslip">
  <div class="header">
    <h1>RELISOFT HR</h1>
    <h3>Salary Payslip for ${monthNames[payslip.month - 1]} ${payslip.year}</h3>
  </div>
  <table class="details">
    <tr><td><strong>Employee:</strong> ${emp.firstName} ${emp.lastName || ''}</td>
        <td><strong>Employee ID:</strong> ${emp.employeeId || ''}</td></tr>
    <tr><td><strong>Designation:</strong> ${emp.designation || ''}</td>
        <td><strong>Department:</strong> ${emp.department || ''}</td></tr>
    <tr><td><strong>PAN:</strong> ${emp.panNumber || ''}</td>
        <td><strong>Bank Account:</strong> ${payslip.bankAccount || ''}</td></tr>
    <tr><td><strong>Days:</strong> ${payslip.daysWorked || payslip.totalDays} / ${payslip.totalDays}</td>
        <td><strong>Pay Date:</strong> ${payslip.paymentDate ? new Date(payslip.paymentDate).toLocaleDateString() : '-'}</td></tr>
  </table>
  <table>
    <tr><th style="width:70%">Earnings</th><th style="width:30%">Amount (₹)</th></tr>
    ${earningsRows}
    <tr class="total-row"><td style="padding:4px 8px;border:1px solid #ddd;">Gross Earnings</td>
        <td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${payslip.grossEarnings.toFixed(2)}</td></tr>
  </table>
  <table>
    <tr><th style="width:70%">Deductions</th><th style="width:30%">Amount (₹)</th></tr>
    ${deductionsRows}
    <tr class="total-row"><td style="padding:4px 8px;border:1px solid #ddd;">Gross Deductions</td>
        <td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${payslip.grossDeductions.toFixed(2)}</td></tr>
  </table>
  <table>
    <tr class="total-row"><td style="padding:6px 8px;border:1px solid #ddd;font-size:14px;">Net Pay</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;font-size:14px;">₹ ${payslip.netPay.toFixed(2)}</td></tr>
  </table>
  <p><strong>Amount in Words:</strong> ${payslip.amountInWords}</p>
  ${payslip.arrears ? `<p><strong>Arrears:</strong> ₹${payslip.arrears.toFixed(2)}</p>` : ''}
  ${payslip.loanRecovery ? `<p><strong>Loan Recovery:</strong> ₹${payslip.loanRecovery.toFixed(2)}</p>` : ''}
  ${payslip.notes ? `<p><strong>Notes:</strong> ${payslip.notes}</p>` : ''}
  <div class="footer">This is a computer-generated payslip. Signature not required.</div>
</div></body></html>`;

    res.status(200).json({ success: true, data: { html, payslip } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateForm16 = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { financialYear } = req.query;

    if (!financialYear) {
      return res.status(400).json({ success: false, message: 'financialYear query parameter is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const [startYear] = financialYear.split('-').map(Number);
    const yearStart = startYear;
    const yearEnd = startYear + 1;

    const payslips = await Payslip.find({
      employee: employeeId,
      year: { $gte: yearStart, $lte: yearEnd },
      status: { $ne: 'Cancelled' },
    }).sort('month');

    const taxDec = await TaxDeclaration.findOne({
      employee: employeeId,
      financialYear,
    });

    const totalGrossSalary = payslips.reduce((s, p) => s + (p.grossEarnings || 0), 0);
    const totalDeductions = payslips.reduce((s, p) => s + (p.grossDeductions || 0), 0);
    const totalNetPay = payslips.reduce((s, p) => s + (p.netPay || 0), 0);
    const totalTDS = payslips.reduce((s, p) => {
      const tdsEntry = p.deductions.find((d) => d.name.toLowerCase().includes('tds') || d.name.toLowerCase().includes('tax'));
      return s + (tdsEntry?.amount || 0);
    }, 0);

    const partA = {
      employeeName: `${employee.firstName} ${employee.lastName || ''}`,
      employeeId: employee.employeeId,
      pan: employee.panNumber,
      designation: employee.designation,
      department: employee.department,
      totalMonths: payslips.length,
      grossSalary: totalGrossSalary,
      deductions: totalDeductions,
      netSalary: totalNetPay,
      tdsDeducted: totalTDS,
      monthWise: payslips.map((p) => ({
        month: p.month,
        grossEarnings: p.grossEarnings,
        grossDeductions: p.grossDeductions,
        netPay: p.netPay,
      })),
    };

    const partB = {
      incomeFromSalary: totalGrossSalary,
      perquisites: 0,
      profitsInLieuOfSalary: 0,
      allowancesNotExempt: 0,
      totalIncomeFromSalary: totalGrossSalary,
    };

    const taxDetails = {
      totalIncome: taxDec?.totalIncome || totalGrossSalary,
      totalDeductions: taxDec?.totalDeductions || 0,
      taxableIncome: taxDec?.taxableIncome || (totalGrossSalary - (taxDec?.totalDeductions || 0)),
      taxLiability: taxDec?.taxLiability || 0,
      tdsDeducted: taxDec?.tdsDeducted || totalTDS,
      reliefUnderSection89: 0,
      netTaxLiability: Math.max(0, (taxDec?.taxLiability || 0) - (taxDec?.tdsDeducted || totalTDS)),
    };

    const chapterVIA = {
      section80C: taxDec?.section80C || 0,
      section80D: taxDec?.section80D || 0,
      section80E: taxDec?.section80E || 0,
      section80G: taxDec?.section80G || 0,
      hraExemption: taxDec?.hraExemption || 0,
      homeLoanInterest: taxDec?.homeLoanInterest || 0,
      otherInvestments: taxDec?.otherInvestments || [],
      totalChapterVIA: taxDec?.totalDeductions || 0,
    };

    res.status(200).json({
      success: true,
      data: {
        financialYear,
        employeeDetails: {
          name: `${employee.firstName} ${employee.lastName || ''}`,
          employeeId: employee.employeeId,
          pan: employee.panNumber,
          aadhar: employee.aadharNumber,
          uan: employee.uanNumber,
          pfNumber: employee.pfNumber,
          designation: employee.designation,
          department: employee.department,
          dateOfJoining: employee.dateOfJoining,
          bankName: employee.bankName,
          accountNumber: employee.accountNumber,
        },
        partA,
        partB,
        taxDetails,
        chapterVIA,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getForm16PDF = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { financialYear } = req.query;

    if (!financialYear) {
      return res.status(400).json({ success: false, message: 'financialYear query parameter is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const [startYear] = financialYear.split('-').map(Number);
    const yearStart = startYear;
    const yearEnd = startYear + 1;

    const payslips = await Payslip.find({
      employee: employeeId,
      year: { $gte: yearStart, $lte: yearEnd },
      status: { $ne: 'Cancelled' },
    }).sort('month');

    const taxDec = await TaxDeclaration.findOne({ employee: employeeId, financialYear });

    const totalGrossSalary = payslips.reduce((s, p) => s + (p.grossEarnings || 0), 0);
    const totalTDS = payslips.reduce((s, p) => {
      const tdsEntry = p.deductions.find((d) => d.name.toLowerCase().includes('tds') || d.name.toLowerCase().includes('tax'));
      return s + (tdsEntry?.amount || 0);
    }, 0);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const monthRows = payslips.map((p) =>
      `<tr><td style="padding:4px 8px;border:1px solid #000;">${monthNames[p.month - 1]} ${p.year}</td>
        <td style="padding:4px 8px;border:1px solid #000;text-align:right;">${p.grossEarnings.toFixed(2)}</td>
        <td style="padding:4px 8px;border:1px solid #000;text-align:right;">${p.netPay.toFixed(2)}</td>
        <td style="padding:4px 8px;border:1px solid #000;text-align:right;">${(p.grossEarnings - p.netPay).toFixed(2)}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Form 16</title>
<style>
body { font-family: Arial, sans-serif; font-size: 11px; }
.form16 { width: 800px; margin: 20px auto; padding: 30px; border: 2px solid #000; }
.header { text-align: center; border-bottom: 2px solid #000; margin-bottom: 20px; }
.header h1 { margin: 0; font-size: 22px; }
.header h3 { margin: 5px 0; color: #333; }
.section { margin-bottom: 20px; }
.section h2 { background: #e0e0e0; padding: 6px; font-size: 14px; margin: 10px 0; border: 1px solid #000; }
table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
th, td { padding: 4px 8px; border: 1px solid #000; text-align: left; }
th { background: #f0f0f0; }
.total-row { font-weight: bold; background: #f9f9f9; }
.footer { margin-top: 20px; text-align: center; font-size: 10px; }
</style></head><body>
<div class="form16">
  <div class="header">
    <h1>FORM 16</h1>
    <h3>Certificate under Section 203 of the Income-Tax Act, 1961</h3>
    <p>for the Financial Year ${financialYear}</p>
  </div>

  <div class="section">
    <h2>Part A: Salary Details</h2>
    <table>
      <tr><td><strong>Name of Employee:</strong></td><td>${employee.firstName} ${employee.lastName || ''}</td></tr>
      <tr><td><strong>PAN:</strong></td><td>${employee.panNumber || '-'}</td></tr>
      <tr><td><strong>Designation:</strong></td><td>${employee.designation || '-'}</td></tr>
      <tr><td><strong>Department:</strong></td><td>${employee.department || '-'}</td></tr>
      <tr><td><strong>Period:</strong></td><td>April ${yearStart} - March ${yearEnd}</td></tr>
    </table>
    <table>
      <tr><th>Month</th><th>Gross Salary (₹)</th><th>Net Salary (₹)</th><th>Deductions (₹)</th></tr>
      ${monthRows}
      <tr class="total-row"><td><strong>Total</strong></td>
        <td style="text-align:right;">${totalGrossSalary.toFixed(2)}</td>
        <td style="text-align:right;">${payslips.reduce((s, p) => s + (p.netPay || 0), 0).toFixed(2)}</td>
        <td style="text-align:right;">${payslips.reduce((s, p) => s + (p.grossDeductions || 0), 0).toFixed(2)}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Part B: Income from Salary</h2>
    <table>
      <tr><td>1. Gross Salary (as per Part A)</td><td style="text-align:right;">${totalGrossSalary.toFixed(2)}</td></tr>
      <tr><td>2. Less: Allowances not exempt</td><td style="text-align:right;">0.00</td></tr>
      <tr><td>3. Less: Entertainment Allowance</td><td style="text-align:right;">0.00</td></tr>
      <tr><td>4. Less: Professional Tax</td><td style="text-align:right;">${payslips.reduce((s, p) => { const pt = p.deductions.find(d => d.name.toLowerCase().includes('professional') || d.name.toLowerCase().includes('pt')); return s + (pt?.amount || 0); }, 0).toFixed(2)}</td></tr>
      <tr><td><strong>Income Chargeable under Head "Salaries"</strong></td><td style="text-align:right;"><strong>${totalGrossSalary.toFixed(2)}</strong></td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Tax Details</h2>
    <table>
      <tr><td>Total Income</td><td style="text-align:right;">${(taxDec?.totalIncome || totalGrossSalary).toFixed(2)}</td></tr>
      <tr><td>Less: Deductions under Chapter VI-A</td><td style="text-align:right;">${(taxDec?.totalDeductions || 0).toFixed(2)}</td></tr>
      <tr><td>Taxable Income</td><td style="text-align:right;">${(taxDec?.taxableIncome || totalGrossSalary).toFixed(2)}</td></tr>
      <tr><td>Tax Liability</td><td style="text-align:right;">${(taxDec?.taxLiability || 0).toFixed(2)}</td></tr>
      <tr><td>Less: TDS Deducted</td><td style="text-align:right;">${(taxDec?.tdsDeducted || totalTDS).toFixed(2)}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Deductions under Chapter VI-A</h2>
    <table>
      <tr><td>Section 80C (PPF, LIC, ELSS, etc.)</td><td style="text-align:right;">${(taxDec?.section80C || 0).toFixed(2)}</td></tr>
      <tr><td>Section 80D (Medical Insurance)</td><td style="text-align:right;">${(taxDec?.section80D || 0).toFixed(2)}</td></tr>
      <tr><td>Section 80E (Education Loan)</td><td style="text-align:right;">${(taxDec?.section80E || 0).toFixed(2)}</td></tr>
      <tr><td>Section 80G (Donations)</td><td style="text-align:right;">${(taxDec?.section80G || 0).toFixed(2)}</td></tr>
      <tr><td>HRA Exemption</td><td style="text-align:right;">${(taxDec?.hraExemption || 0).toFixed(2)}</td></tr>
      <tr><td>Home Loan Interest</td><td style="text-align:right;">${(taxDec?.homeLoanInterest || 0).toFixed(2)}</td></tr>
      <tr class="total-row"><td><strong>Total Deductions</strong></td><td style="text-align:right;"><strong>${(taxDec?.totalDeductions || 0).toFixed(2)}</strong></td></tr>
    </table>
  </div>

  <div class="footer">
    <p>This is a computer-generated Form 16. Signature not required.</p>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  </div>
</div></body></html>`;

    res.status(200).json({ success: true, data: { html, financialYear, employeeName: `${employee.firstName} ${employee.lastName || ''}` } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitTaxDeclaration = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { financialYear } = req.body;
    if (!financialYear) {
      return res.status(400).json({ success: false, message: 'financialYear is required' });
    }

    const section80C = req.body.section80C || 0;
    const section80D = req.body.section80D || 0;
    const section80E = req.body.section80E || 0;
    const section80G = req.body.section80G || 0;
    const hraExemption = req.body.hraExemption || 0;
    const homeLoanInterest = req.body.homeLoanInterest || 0;
    const otherInvestments = req.body.otherInvestments || [];
    const previousEmployerIncome = req.body.previousEmployerIncome || 0;
    const previousEmployerTax = req.body.previousEmployerTax || 0;
    const otherInvestmentsTotal = otherInvestments.reduce((s, i) => s + (i.amount || 0), 0);

    const totalDeductions = section80C + section80D + section80E + section80G + otherInvestmentsTotal;
    const totalIncome = previousEmployerIncome + 0;
    const taxableIncome = Math.max(0, totalIncome - totalDeductions);

    let taxLiability = 0;
    if (taxableIncome > 1500000) {
      taxLiability = 150000 * 0.1 + 150000 * 0.15 + 150000 * 0.2 + 150000 * 0.25 + 150000 * 0.3 + (taxableIncome - 1500000) * 0.3;
    } else if (taxableIncome > 1200000) {
      taxLiability = 150000 * 0.1 + 150000 * 0.15 + 150000 * 0.2 + 150000 * 0.25 + (taxableIncome - 1200000) * 0.3;
    } else if (taxableIncome > 900000) {
      taxLiability = 150000 * 0.1 + 150000 * 0.15 + 150000 * 0.2 + (taxableIncome - 900000) * 0.25;
    } else if (taxableIncome > 600000) {
      taxLiability = 150000 * 0.1 + 150000 * 0.15 + (taxableIncome - 600000) * 0.2;
    } else if (taxableIncome > 300000) {
      taxLiability = 150000 * 0.1 + (taxableIncome - 300000) * 0.15;
    } else if (taxableIncome > 700000) {
      taxLiability = (taxableIncome - 300000) * 0.05;
    }

    const declaration = await TaxDeclaration.findOneAndUpdate(
      { employee: employee._id, financialYear },
      {
        employee: employee._id,
        financialYear,
        section80C,
        section80D,
        section80E,
        section80G,
        hraExemption,
        homeLoanInterest,
        otherInvestments,
        previousEmployerIncome,
        previousEmployerTax,
        totalIncome,
        totalDeductions,
        taxableIncome,
        taxLiability,
        status: 'Submitted',
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: declaration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTaxDeclaration = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { financialYear } = req.query;
    const query = { employee: employee._id };
    if (financialYear) query.financialYear = financialYear;

    const declaration = await TaxDeclaration.findOne(query).populate('verifiedBy', 'firstName lastName');

    if (!declaration) {
      return res.status(404).json({ success: false, message: 'Tax declaration not found' });
    }

    res.status(200).json({ success: true, data: declaration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaxDeclarations = async (req, res) => {
  try {
    const { page = 1, limit = 10, financialYear, status } = req.query;
    const query = {};
    if (financialYear) query.financialYear = financialYear;
    if (status) query.status = status;

    const declarations = await TaxDeclaration.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('verifiedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await TaxDeclaration.countDocuments(query);

    res.status(200).json({
      success: true,
      data: declarations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyTaxDeclaration = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    const { status } = req.body;

    if (!status || !['Verified', 'Approved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Verified or Approved' });
    }

    const declaration = await TaxDeclaration.findByIdAndUpdate(
      req.params.id,
      { status, verifiedBy: employee?._id },
      { new: true }
    );

    if (!declaration) {
      return res.status(404).json({ success: false, message: 'Tax declaration not found' });
    }

    res.status(200).json({ success: true, data: declaration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const preProcessPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const m = parseInt(month);
    const y = parseInt(year);

    const employees = await Employee.find({ employmentStatus: 'active' });
    const defaultStructure = await SalaryStructure.findOne({ isDefault: true, status: 'Active' });

    const preview = [];

    for (const employee of employees) {
      const existingPayslip = await Payslip.findOne({
        employee: employee._id,
        month: m,
        year: y,
      });

      const payslipData = await generatePayslipData(employee, m, y, defaultStructure?._id);

      preview.push({
        employee: {
          _id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId,
          department: employee.department,
          designation: employee.designation,
        },
        grossEarnings: payslipData.grossEarnings,
        grossDeductions: payslipData.grossDeductions,
        netPay: payslipData.netPay,
        earnings: payslipData.earnings,
        deductions: payslipData.deductions,
        exists: !!existingPayslip,
      });
    }

    const totals = preview.reduce(
      (acc, p) => ({
        grossEarnings: acc.grossEarnings + p.grossEarnings,
        grossDeductions: acc.grossDeductions + p.grossDeductions,
        netPay: acc.netPay + p.netPay,
        count: acc.count + 1,
        existing: acc.existing + (p.exists ? 1 : 0),
      }),
      { grossEarnings: 0, grossDeductions: 0, netPay: 0, count: 0, existing: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        month: m,
        year: y,
        employees: preview,
        totals,
        salaryStructure: defaultStructure ? { id: defaultStructure._id, name: defaultStructure.name } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
