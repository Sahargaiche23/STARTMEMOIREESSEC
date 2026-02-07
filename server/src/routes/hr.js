const express = require('express');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// ============ EMPLOYEES ============

// Get all employees
router.get('/employees', authMiddleware, (req, res) => {
  try {
    const employees = db.prepare(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM leave_requests WHERE employeeId = e.id AND status = 'pending') as pendingLeaves,
        (SELECT COUNT(*) FROM contracts WHERE employeeId = e.id) as contractsCount
      FROM employees e 
      WHERE e.userId = ? AND e.status != 'deleted'
      ORDER BY e.lastName, e.firstName
    `).all(req.user.userId);

    res.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get single employee
router.get('/employees/:id', authMiddleware, (req, res) => {
  try {
    const employee = db.prepare(`
      SELECT * FROM employees WHERE id = ? AND userId = ?
    `).get(req.params.id, req.user.userId);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Get documents
    const documents = db.prepare(`
      SELECT * FROM employee_documents WHERE employeeId = ? ORDER BY uploadedAt DESC
    `).all(employee.id);

    // Get contracts
    const contracts = db.prepare(`
      SELECT * FROM contracts WHERE employeeId = ? ORDER BY createdAt DESC
    `).all(employee.id);

    // Get leave balance for current year
    const currentYear = new Date().getFullYear();
    let leaveBalance = db.prepare(`
      SELECT * FROM leave_balances WHERE employeeId = ? AND year = ?
    `).get(employee.id, currentYear);

    if (!leaveBalance) {
      // Create default leave balance
      db.prepare(`
        INSERT INTO leave_balances (userId, employeeId, year)
        VALUES (?, ?, ?)
      `).run(req.user.userId, employee.id, currentYear);
      leaveBalance = { annualLeave: 24, usedAnnualLeave: 0, sickLeave: 15, usedSickLeave: 0 };
    }

    res.json({ employee, documents, contracts, leaveBalance });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create employee
router.post('/employees', authMiddleware, (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, cin, cnssNumber, address, birthDate,
      hireDate, position, department, contractType, workSchedule,
      baseSalary, transportAllowance, mealAllowance, otherAllowances,
      bankName, bankAccount, notes
    } = req.body;

    if (!firstName || !lastName || !hireDate || !position || !baseSalary) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const result = db.prepare(`
      INSERT INTO employees (
        userId, firstName, lastName, email, phone, cin, cnssNumber, address, birthDate,
        hireDate, position, department, contractType, workSchedule,
        baseSalary, transportAllowance, mealAllowance, otherAllowances,
        bankName, bankAccount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.userId, firstName, lastName, email, phone, cin, cnssNumber, address, birthDate,
      hireDate, position, department, contractType || 'CDI', workSchedule || 'full_time',
      baseSalary, transportAllowance || 0, mealAllowance || 0, otherAllowances || 0,
      bankName, bankAccount, notes
    );

    // Create leave balance for current year
    const currentYear = new Date().getFullYear();
    db.prepare(`
      INSERT INTO leave_balances (userId, employeeId, year)
      VALUES (?, ?, ?)
    `).run(req.user.userId, result.lastInsertRowid, currentYear);

    res.status(201).json({ 
      message: 'Employé créé avec succès',
      employeeId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update employee
router.put('/employees/:id', authMiddleware, (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    const {
      firstName, lastName, email, phone, cin, cnssNumber, address, birthDate,
      hireDate, endDate, position, department, contractType, workSchedule,
      baseSalary, transportAllowance, mealAllowance, otherAllowances,
      bankName, bankAccount, status, notes
    } = req.body;

    db.prepare(`
      UPDATE employees SET
        firstName = ?, lastName = ?, email = ?, phone = ?, cin = ?, cnssNumber = ?,
        address = ?, birthDate = ?, hireDate = ?, endDate = ?, position = ?, department = ?,
        contractType = ?, workSchedule = ?, baseSalary = ?, transportAllowance = ?,
        mealAllowance = ?, otherAllowances = ?, bankName = ?, bankAccount = ?,
        status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      firstName, lastName, email, phone, cin, cnssNumber,
      address, birthDate, hireDate, endDate, position, department,
      contractType, workSchedule, baseSalary, transportAllowance || 0,
      mealAllowance || 0, otherAllowances || 0, bankName, bankAccount,
      status || 'active', notes, req.params.id
    );

    res.json({ message: 'Employé mis à jour' });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete employee (soft delete)
router.delete('/employees/:id', authMiddleware, (req, res) => {
  try {
    const result = db.prepare(`
      UPDATE employees SET status = 'deleted', endDate = CURRENT_DATE
      WHERE id = ? AND userId = ?
    `).run(req.params.id, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    res.json({ message: 'Employé supprimé' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ PAYSLIPS ============

// Tunisian tax brackets for IRPP calculation
const calculateIRPP = (annualTaxableIncome) => {
  // Tunisian IRPP brackets 2024
  const brackets = [
    { min: 0, max: 5000, rate: 0 },
    { min: 5000, max: 20000, rate: 0.26 },
    { min: 20000, max: 30000, rate: 0.28 },
    { min: 30000, max: 50000, rate: 0.32 },
    { min: 50000, max: Infinity, rate: 0.35 }
  ];

  let tax = 0;
  let remaining = annualTaxableIncome;

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  return tax / 12; // Monthly IRPP
};

// CNSS rates Tunisia
const CNSS_EMPLOYEE_RATE = 0.0918; // 9.18%
const CNSS_EMPLOYER_RATE = 0.1657; // 16.57%

// Get payslips
router.get('/payslips', authMiddleware, (req, res) => {
  try {
    const { year, month, employeeId } = req.query;
    
    let query = `
      SELECT p.*, e.firstName, e.lastName, e.position, e.department
      FROM payslips p
      JOIN employees e ON p.employeeId = e.id
      WHERE p.userId = ?
    `;
    const params = [req.user.userId];

    if (year) {
      query += ' AND p.year = ?';
      params.push(year);
    }
    if (month) {
      query += ' AND p.month = ?';
      params.push(month);
    }
    if (employeeId) {
      query += ' AND p.employeeId = ?';
      params.push(employeeId);
    }

    query += ' ORDER BY p.year DESC, p.month DESC, e.lastName';

    const payslips = db.prepare(query).all(...params);
    res.json({ payslips });
  } catch (error) {
    console.error('Get payslips error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Generate payslip for employee
router.post('/payslips/generate', authMiddleware, (req, res) => {
  try {
    const { employeeId, year, month, overtimeHours, bonus, otherDeductions } = req.body;

    const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND userId = ?')
      .get(employeeId, req.user.userId);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Check if payslip already exists
    const existing = db.prepare(`
      SELECT id FROM payslips WHERE employeeId = ? AND year = ? AND month = ?
    `).get(employeeId, year, month);

    if (existing) {
      return res.status(400).json({ message: 'Fiche de paie déjà générée pour cette période' });
    }

    // Calculate payslip
    const baseSalary = employee.baseSalary;
    const transportAllowance = employee.transportAllowance || 0;
    const mealAllowance = employee.mealAllowance || 0;
    const otherAllowances = employee.otherAllowances || 0;
    const overtimeAmount = (overtimeHours || 0) * (baseSalary / 173.33) * 1.5; // 173.33 = avg monthly hours
    const bonusAmount = bonus || 0;

    const grossSalary = baseSalary + transportAllowance + mealAllowance + otherAllowances + overtimeAmount + bonusAmount;
    
    // CNSS calculation (on gross salary excluding transport allowance)
    const cnssBase = grossSalary - transportAllowance;
    const cnssEmployee = cnssBase * CNSS_EMPLOYEE_RATE;
    const cnssEmployer = cnssBase * CNSS_EMPLOYER_RATE;

    // IRPP calculation
    const annualTaxable = (grossSalary - cnssEmployee) * 12;
    const irpp = calculateIRPP(annualTaxable);

    const netSalary = grossSalary - cnssEmployee - irpp - (otherDeductions || 0);
    const period = `${year}-${String(month).padStart(2, '0')}`;

    const result = db.prepare(`
      INSERT INTO payslips (
        userId, employeeId, period, year, month, baseSalary, transportAllowance,
        mealAllowance, otherAllowances, overtimeHours, overtimeAmount, bonus,
        grossSalary, cnssEmployee, cnssEmployer, irpp, otherDeductions, netSalary, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `).run(
      req.user.userId, employeeId, period, year, month, baseSalary, transportAllowance,
      mealAllowance, otherAllowances, overtimeHours || 0, overtimeAmount, bonusAmount,
      grossSalary, cnssEmployee, cnssEmployer, irpp, otherDeductions || 0, netSalary
    );

    res.status(201).json({
      message: 'Fiche de paie générée',
      payslipId: result.lastInsertRowid,
      payslip: {
        grossSalary,
        cnssEmployee,
        cnssEmployer,
        irpp,
        netSalary
      }
    });
  } catch (error) {
    console.error('Generate payslip error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Generate payslips for all employees
router.post('/payslips/generate-all', authMiddleware, (req, res) => {
  try {
    const { year, month } = req.body;

    const employees = db.prepare(`
      SELECT * FROM employees WHERE userId = ? AND status = 'active'
    `).all(req.user.userId);

    let generated = 0;
    let skipped = 0;

    for (const employee of employees) {
      // Check if payslip already exists
      const existing = db.prepare(`
        SELECT id FROM payslips WHERE employeeId = ? AND year = ? AND month = ?
      `).get(employee.id, year, month);

      if (existing) {
        skipped++;
        continue;
      }

      // Calculate payslip
      const baseSalary = employee.baseSalary;
      const transportAllowance = employee.transportAllowance || 0;
      const mealAllowance = employee.mealAllowance || 0;
      const otherAllowances = employee.otherAllowances || 0;

      const grossSalary = baseSalary + transportAllowance + mealAllowance + otherAllowances;
      const cnssBase = grossSalary - transportAllowance;
      const cnssEmployee = cnssBase * CNSS_EMPLOYEE_RATE;
      const cnssEmployer = cnssBase * CNSS_EMPLOYER_RATE;
      const annualTaxable = (grossSalary - cnssEmployee) * 12;
      const irpp = calculateIRPP(annualTaxable);
      const netSalary = grossSalary - cnssEmployee - irpp;
      const period = `${year}-${String(month).padStart(2, '0')}`;

      db.prepare(`
        INSERT INTO payslips (
          userId, employeeId, period, year, month, baseSalary, transportAllowance,
          mealAllowance, otherAllowances, overtimeHours, overtimeAmount, bonus,
          grossSalary, cnssEmployee, cnssEmployer, irpp, otherDeductions, netSalary, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, 0, ?, 'draft')
      `).run(
        req.user.userId, employee.id, period, year, month, baseSalary, transportAllowance,
        mealAllowance, otherAllowances, grossSalary, cnssEmployee, cnssEmployer, irpp, netSalary
      );

      generated++;
    }

    res.json({
      message: `${generated} fiches générées, ${skipped} ignorées (déjà existantes)`,
      generated,
      skipped
    });
  } catch (error) {
    console.error('Generate all payslips error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mark payslip as paid
router.post('/payslips/:id/pay', authMiddleware, (req, res) => {
  try {
    const result = db.prepare(`
      UPDATE payslips SET status = 'paid', paidAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?
    `).run(req.params.id, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Fiche de paie non trouvée' });
    }

    res.json({ message: 'Fiche de paie marquée comme payée' });
  } catch (error) {
    console.error('Pay payslip error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get payslip summary for period
router.get('/payslips/summary', authMiddleware, (req, res) => {
  try {
    const { year, month } = req.query;
    
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as totalPayslips,
        SUM(grossSalary) as totalGross,
        SUM(netSalary) as totalNet,
        SUM(cnssEmployee) as totalCnssEmployee,
        SUM(cnssEmployer) as totalCnssEmployer,
        SUM(irpp) as totalIrpp
      FROM payslips 
      WHERE userId = ? AND year = ? AND month = ?
    `).get(req.user.userId, year, month);

    res.json({ summary });
  } catch (error) {
    console.error('Get payslip summary error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ CNSS DECLARATIONS ============

// Get CNSS declarations
router.get('/cnss', authMiddleware, (req, res) => {
  try {
    const declarations = db.prepare(`
      SELECT * FROM cnss_declarations 
      WHERE userId = ?
      ORDER BY year DESC, quarter DESC
    `).all(req.user.userId);

    res.json({ declarations });
  } catch (error) {
    console.error('Get CNSS declarations error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Generate CNSS declaration for quarter
router.post('/cnss/generate', authMiddleware, (req, res) => {
  try {
    const { quarter, year } = req.body;

    // Check if already exists
    const existing = db.prepare(`
      SELECT id FROM cnss_declarations WHERE userId = ? AND quarter = ? AND year = ?
    `).get(req.user.userId, quarter, year);

    if (existing) {
      return res.status(400).json({ message: 'Déclaration déjà existante pour cette période' });
    }

    // Get months for the quarter
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;

    // Aggregate payslips for the quarter
    const data = db.prepare(`
      SELECT 
        COUNT(DISTINCT employeeId) as totalEmployees,
        SUM(grossSalary) as totalGross,
        SUM(cnssEmployee) as cnssEmployee,
        SUM(cnssEmployer) as cnssEmployer
      FROM payslips
      WHERE userId = ? AND year = ? AND month >= ? AND month <= ?
    `).get(req.user.userId, year, startMonth, endMonth);

    if (!data.totalEmployees || data.totalEmployees === 0) {
      return res.status(400).json({ message: 'Aucune fiche de paie pour cette période' });
    }

    const totalContributions = (data.cnssEmployee || 0) + (data.cnssEmployer || 0);
    
    // Calculate due date (15th of month following the quarter)
    const dueMonth = endMonth + 1 > 12 ? 1 : endMonth + 1;
    const dueYear = dueMonth === 1 ? year + 1 : year;
    const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-15`;

    const result = db.prepare(`
      INSERT INTO cnss_declarations (
        userId, quarter, year, totalEmployees, totalGrossSalary,
        cnssEmployeeTotal, cnssEmployerTotal, totalContributions, dueDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.userId, quarter, year, data.totalEmployees, data.totalGross || 0,
      data.cnssEmployee || 0, data.cnssEmployer || 0, totalContributions, dueDate
    );

    res.status(201).json({
      message: 'Déclaration CNSS générée',
      declarationId: result.lastInsertRowid,
      data: {
        totalEmployees: data.totalEmployees,
        totalGross: data.totalGross,
        totalContributions
      }
    });
  } catch (error) {
    console.error('Generate CNSS declaration error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Submit CNSS declaration
router.post('/cnss/:id/submit', authMiddleware, (req, res) => {
  try {
    const referenceNumber = `CNSS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = db.prepare(`
      UPDATE cnss_declarations 
      SET status = 'submitted', submittedAt = CURRENT_TIMESTAMP, referenceNumber = ?
      WHERE id = ? AND userId = ?
    `).run(referenceNumber, req.params.id, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Déclaration non trouvée' });
    }

    res.json({ message: 'Déclaration soumise', referenceNumber });
  } catch (error) {
    console.error('Submit CNSS declaration error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ LEAVE MANAGEMENT ============

// Get leave requests
router.get('/leaves', authMiddleware, (req, res) => {
  try {
    const { status, employeeId } = req.query;
    
    let query = `
      SELECT lr.*, e.firstName, e.lastName, e.position
      FROM leave_requests lr
      JOIN employees e ON lr.employeeId = e.id
      WHERE lr.userId = ?
    `;
    const params = [req.user.userId];

    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }
    if (employeeId) {
      query += ' AND lr.employeeId = ?';
      params.push(employeeId);
    }

    query += ' ORDER BY lr.createdAt DESC';

    const leaves = db.prepare(query).all(...params);
    res.json({ leaves });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create leave request
router.post('/leaves', authMiddleware, (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND userId = ?')
      .get(employeeId, req.user.userId);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Calculate total days (excluding weekends)
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalDays = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const balance = db.prepare(`
      SELECT * FROM leave_balances WHERE employeeId = ? AND year = ?
    `).get(employeeId, currentYear);

    if (balance) {
      if (leaveType === 'annual' && (balance.annualLeave - balance.usedAnnualLeave) < totalDays) {
        return res.status(400).json({ message: 'Solde de congés annuels insuffisant' });
      }
      if (leaveType === 'sick' && (balance.sickLeave - balance.usedSickLeave) < totalDays) {
        return res.status(400).json({ message: 'Solde de congés maladie insuffisant' });
      }
    }

    const result = db.prepare(`
      INSERT INTO leave_requests (userId, employeeId, leaveType, startDate, endDate, totalDays, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.userId, employeeId, leaveType, startDate, endDate, totalDays, reason);

    res.status(201).json({
      message: 'Demande de congé créée',
      leaveId: result.lastInsertRowid,
      totalDays
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Approve leave request
router.post('/leaves/:id/approve', authMiddleware, (req, res) => {
  try {
    const leave = db.prepare(`
      SELECT * FROM leave_requests WHERE id = ? AND userId = ? AND status = 'pending'
    `).get(req.params.id, req.user.userId);

    if (!leave) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    // Update leave request
    db.prepare(`
      UPDATE leave_requests SET status = 'approved', approvedBy = ?, approvedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(req.user.userId, req.params.id);

    // Update leave balance
    const currentYear = new Date().getFullYear();
    if (leave.leaveType === 'annual') {
      db.prepare(`
        UPDATE leave_balances SET usedAnnualLeave = usedAnnualLeave + ?
        WHERE employeeId = ? AND year = ?
      `).run(leave.totalDays, leave.employeeId, currentYear);
    } else if (leave.leaveType === 'sick') {
      db.prepare(`
        UPDATE leave_balances SET usedSickLeave = usedSickLeave + ?
        WHERE employeeId = ? AND year = ?
      `).run(leave.totalDays, leave.employeeId, currentYear);
    }

    res.json({ message: 'Congé approuvé' });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Reject leave request
router.post('/leaves/:id/reject', authMiddleware, (req, res) => {
  try {
    const { reason } = req.body;
    
    const result = db.prepare(`
      UPDATE leave_requests SET status = 'rejected', rejectionReason = ?
      WHERE id = ? AND userId = ? AND status = 'pending'
    `).run(reason, req.params.id, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    res.json({ message: 'Demande refusée' });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get leave balances
router.get('/leaves/balances', authMiddleware, (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    
    const balances = db.prepare(`
      SELECT lb.*, e.firstName, e.lastName, e.position
      FROM leave_balances lb
      JOIN employees e ON lb.employeeId = e.id
      WHERE lb.userId = ? AND lb.year = ? AND e.status = 'active'
    `).all(req.user.userId, year);

    res.json({ balances });
  } catch (error) {
    console.error('Get leave balances error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ CONTRACTS ============

// Get contracts
router.get('/contracts', authMiddleware, (req, res) => {
  try {
    const contracts = db.prepare(`
      SELECT c.*, e.firstName, e.lastName
      FROM contracts c
      JOIN employees e ON c.employeeId = e.id
      WHERE c.userId = ?
      ORDER BY c.createdAt DESC
    `).all(req.user.userId);

    res.json({ contracts });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create contract
router.post('/contracts', authMiddleware, (req, res) => {
  try {
    const { employeeId, contractType, title, content, startDate, endDate, salary, position } = req.body;

    const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND userId = ?')
      .get(employeeId, req.user.userId);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    const result = db.prepare(`
      INSERT INTO contracts (userId, employeeId, contractType, title, content, startDate, endDate, salary, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.userId, employeeId, contractType, title, content, startDate, endDate, salary, position);

    res.status(201).json({
      message: 'Contrat créé',
      contractId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Sign contract (employer)
router.post('/contracts/:id/sign-employer', authMiddleware, (req, res) => {
  try {
    const { signature } = req.body;
    
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    const hash = crypto.createHash('sha256')
      .update(`${contract.id}-employer-${Date.now()}`)
      .digest('hex');

    db.prepare(`
      UPDATE contracts SET 
        employerSignedAt = CURRENT_TIMESTAMP, 
        employerSignature = ?,
        signatureHash = ?,
        status = CASE WHEN employeeSignedAt IS NOT NULL THEN 'signed' ELSE 'pending_employee' END
      WHERE id = ?
    `).run(signature || 'Signature numérique', hash, req.params.id);

    res.json({ message: 'Contrat signé par l\'employeur', hash });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Sign contract (employee) - generates unique token
router.post('/contracts/:id/sign-employee', authMiddleware, (req, res) => {
  try {
    const { signature } = req.body;
    
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    const hash = crypto.createHash('sha256')
      .update(`${contract.signatureHash || ''}-employee-${Date.now()}`)
      .digest('hex');

    db.prepare(`
      UPDATE contracts SET 
        employeeSignedAt = CURRENT_TIMESTAMP, 
        employeeSignature = ?,
        signatureHash = ?,
        status = CASE WHEN employerSignedAt IS NOT NULL THEN 'signed' ELSE 'pending_employer' END
      WHERE id = ?
    `).run(signature || 'Signature numérique', hash, req.params.id);

    res.json({ message: 'Contrat signé par l\'employé', hash });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ DOCUMENTS ============

// Upload document
router.post('/documents/upload', authMiddleware, upload.single('file'), (req, res) => {
  try {
    const { employeeId, documentType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND userId = ?')
      .get(employeeId, req.user.userId);

    if (!employee) {
      // Delete uploaded file if employee not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    const result = db.prepare(`
      INSERT INTO employee_documents (employeeId, userId, documentType, documentName, filePath)
      VALUES (?, ?, ?, ?, ?)
    `).run(employeeId, req.user.userId, documentType, req.file.originalname, req.file.filename);

    res.status(201).json({
      message: 'Document ajouté avec succès',
      documentId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Upload document error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Download document
router.get('/documents/:id/download', authMiddleware, (req, res) => {
  try {
    const doc = db.prepare(`
      SELECT ed.* FROM employee_documents ed
      JOIN employees e ON ed.employeeId = e.id
      WHERE ed.id = ? AND e.userId = ?
    `).get(req.params.id, req.user.userId);

    if (!doc) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    const filePath = path.join(uploadDir, doc.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    res.download(filePath, doc.documentName);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete document
router.delete('/documents/:id', authMiddleware, (req, res) => {
  try {
    const doc = db.prepare(`
      SELECT ed.* FROM employee_documents ed
      JOIN employees e ON ed.employeeId = e.id
      WHERE ed.id = ? AND e.userId = ?
    `).get(req.params.id, req.user.userId);

    if (!doc) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Delete file from disk
    const filePath = path.join(uploadDir, doc.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare('DELETE FROM employee_documents WHERE id = ?').run(req.params.id);

    res.json({ message: 'Document supprimé' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get employee history (payslips, leaves, contracts)
router.get('/employees/:id/history', authMiddleware, (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Get payslips history
    const payslips = db.prepare(`
      SELECT id, period, year, month, grossSalary, netSalary, status, generatedAt
      FROM payslips WHERE employeeId = ?
      ORDER BY year DESC, month DESC
    `).all(req.params.id);

    // Get leaves history
    const leaves = db.prepare(`
      SELECT id, leaveType, startDate, endDate, totalDays, status, createdAt
      FROM leave_requests WHERE employeeId = ?
      ORDER BY createdAt DESC
    `).all(req.params.id);

    // Get contracts history
    const contracts = db.prepare(`
      SELECT id, contractType, title, startDate, endDate, salary, status, createdAt
      FROM contracts WHERE employeeId = ?
      ORDER BY createdAt DESC
    `).all(req.params.id);

    // Get documents history
    const documents = db.prepare(`
      SELECT id, documentType, documentName, uploadedAt
      FROM employee_documents WHERE employeeId = ?
      ORDER BY uploadedAt DESC
    `).all(req.params.id);

    res.json({
      employee: { id: employee.id, firstName: employee.firstName, lastName: employee.lastName },
      history: {
        payslips,
        leaves,
        contracts,
        documents
      }
    });
  } catch (error) {
    console.error('Get employee history error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update leave balance
router.put('/employees/:id/leave-balance', authMiddleware, (req, res) => {
  try {
    const { annualLeave, usedAnnualLeave, sickLeave, usedSickLeave } = req.body;
    const currentYear = new Date().getFullYear();

    const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Check if balance exists
    const existing = db.prepare(`
      SELECT * FROM leave_balances WHERE employeeId = ? AND year = ?
    `).get(req.params.id, currentYear);

    if (existing) {
      db.prepare(`
        UPDATE leave_balances SET 
          annualLeave = ?, usedAnnualLeave = ?, 
          sickLeave = ?, usedSickLeave = ?
        WHERE employeeId = ? AND year = ?
      `).run(annualLeave, usedAnnualLeave, sickLeave, usedSickLeave, req.params.id, currentYear);
    } else {
      db.prepare(`
        INSERT INTO leave_balances (userId, employeeId, year, annualLeave, usedAnnualLeave, sickLeave, usedSickLeave)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.userId, req.params.id, currentYear, annualLeave, usedAnnualLeave, sickLeave, usedSickLeave);
    }

    res.json({ message: 'Solde de congés mis à jour' });
  } catch (error) {
    console.error('Update leave balance error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get dashboard stats
router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    const stats = {
      employees: db.prepare(`SELECT COUNT(*) as count FROM employees WHERE userId = ? AND status = 'active'`).get(req.user.userId),
      pendingLeaves: db.prepare(`SELECT COUNT(*) as count FROM leave_requests WHERE userId = ? AND status = 'pending'`).get(req.user.userId),
      pendingContracts: db.prepare(`SELECT COUNT(*) as count FROM contracts WHERE userId = ? AND status IN ('draft', 'pending_employee', 'pending_employer')`).get(req.user.userId),
      currentMonth: new Date().getMonth() + 1,
      currentYear: new Date().getFullYear()
    };

    // Get payroll summary for current month
    stats.payroll = db.prepare(`
      SELECT 
        COUNT(*) as count,
        SUM(grossSalary) as totalGross,
        SUM(netSalary) as totalNet
      FROM payslips 
      WHERE userId = ? AND year = ? AND month = ?
    `).get(req.user.userId, stats.currentYear, stats.currentMonth);

    res.json({ stats });
  } catch (error) {
    console.error('Get HR dashboard error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
