const express = require('express');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Check if user has active accounting product
const checkAccountingAccess = (userId, productSlug) => {
  const product = db.prepare(`
    SELECT up.* FROM user_products up
    JOIN products p ON up.productId = p.id
    WHERE up.userId = ? AND p.slug = ? AND up.status = 'active'
    AND (up.expiresAt IS NULL OR up.expiresAt > datetime('now'))
  `).get(userId, productSlug);
  return !!product;
};

// Get user's active accounting products
router.get('/my-modules', authMiddleware, (req, res) => {
  try {
    const modules = db.prepare(`
      SELECT p.slug, p.name, p.features, up.activatedAt, up.expiresAt,
             julianday(up.expiresAt) - julianday('now') as daysRemaining
      FROM user_products up
      JOIN products p ON up.productId = p.id
      JOIN product_categories pc ON p.categoryId = pc.id
      WHERE up.userId = ? AND up.status = 'active'
      AND pc.slug = 'comptabilite-gestion'
      AND (up.expiresAt IS NULL OR up.expiresAt > datetime('now'))
    `).all(req.user.userId);

    res.json({ modules });
  } catch (error) {
    console.error('Get accounting modules error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ TRANSACTIONS ============

// Get all transactions
router.get('/transactions', authMiddleware, (req, res) => {
  try {
    const { projectId, startDate, endDate, type, category } = req.query;
    
    let query = `SELECT * FROM accounting_transactions WHERE userId = ?`;
    const params = [req.user.userId];

    if (projectId) {
      query += ` AND projectId = ?`;
      params.push(projectId);
    }
    if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }
    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY date DESC, id DESC`;

    const transactions = db.prepare(query).all(...params);
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Add transaction
router.post('/transactions', authMiddleware, (req, res) => {
  try {
    const { type, category, description, amount, date, paymentMethod, reference, notes, projectId } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const result = db.prepare(`
      INSERT INTO accounting_transactions (userId, projectId, type, category, description, amount, date, paymentMethod, reference, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.userId, projectId || null, type, category, description, amount, date, paymentMethod, reference, notes);

    res.status(201).json({ 
      message: 'Transaction ajoutée',
      transactionId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update transaction
router.put('/transactions/:id', authMiddleware, (req, res) => {
  try {
    const { type, category, description, amount, date, paymentMethod, reference, notes } = req.body;

    const existing = db.prepare('SELECT * FROM accounting_transactions WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!existing) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    db.prepare(`
      UPDATE accounting_transactions 
      SET type = ?, category = ?, description = ?, amount = ?, date = ?, paymentMethod = ?, reference = ?, notes = ?
      WHERE id = ?
    `).run(type, category, description, amount, date, paymentMethod, reference, notes, req.params.id);

    res.json({ message: 'Transaction mise à jour' });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete transaction
router.delete('/transactions/:id', authMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM accounting_transactions WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!existing) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    db.prepare('DELETE FROM accounting_transactions WHERE id = ?').run(req.params.id);
    res.json({ message: 'Transaction supprimée' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ DASHBOARD & REPORTS ============

// Get financial summary
router.get('/summary', authMiddleware, (req, res) => {
  try {
    const { projectId, year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    let dateFilter = `strftime('%Y', date) = '${currentYear}'`;
    if (month) {
      dateFilter += ` AND strftime('%m', date) = '${String(currentMonth).padStart(2, '0')}'`;
    }

    let projectFilter = '';
    if (projectId) {
      projectFilter = ` AND projectId = ${projectId}`;
    }

    // Total revenues
    const revenues = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'revenue' AND ${dateFilter}${projectFilter}
    `).get(req.user.userId);

    // Total expenses
    const expenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'expense' AND ${dateFilter}${projectFilter}
    `).get(req.user.userId);

    // Monthly breakdown
    const monthlyData = db.prepare(`
      SELECT 
        strftime('%m', date) as month,
        SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as revenues,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM accounting_transactions 
      WHERE userId = ? AND strftime('%Y', date) = '${currentYear}'${projectFilter}
      GROUP BY strftime('%m', date)
      ORDER BY month
    `).all(req.user.userId);

    // Category breakdown
    const categoryBreakdown = db.prepare(`
      SELECT category, type, SUM(amount) as total
      FROM accounting_transactions 
      WHERE userId = ? AND ${dateFilter}${projectFilter}
      GROUP BY category, type
      ORDER BY total DESC
    `).all(req.user.userId);

    // Recent transactions
    const recentTransactions = db.prepare(`
      SELECT * FROM accounting_transactions 
      WHERE userId = ?${projectFilter}
      ORDER BY date DESC, id DESC
      LIMIT 10
    `).all(req.user.userId);

    res.json({
      summary: {
        totalRevenues: revenues.total,
        totalExpenses: expenses.total,
        profit: revenues.total - expenses.total,
        profitMargin: revenues.total > 0 ? ((revenues.total - expenses.total) / revenues.total * 100).toFixed(1) : 0
      },
      monthlyData,
      categoryBreakdown,
      recentTransactions
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get balance sheet (Bilan)
router.get('/balance-sheet', authMiddleware, (req, res) => {
  try {
    const { projectId, date } = req.query;
    const asOfDate = date || new Date().toISOString().split('T')[0];

    let projectFilter = projectId ? ` AND projectId = ${projectId}` : '';

    // Assets (simplified - based on revenues minus expenses)
    const totalRevenues = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'revenue' AND date <= ?${projectFilter}
    `).get(req.user.userId, asOfDate);

    const totalExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'expense' AND date <= ?${projectFilter}
    `).get(req.user.userId, asOfDate);

    // Group by categories for detailed view
    const revenuesByCategory = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'revenue' AND date <= ?${projectFilter}
      GROUP BY category
    `).all(req.user.userId, asOfDate);

    const expensesByCategory = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'expense' AND date <= ?${projectFilter}
      GROUP BY category
    `).all(req.user.userId, asOfDate);

    const netAssets = totalRevenues.total - totalExpenses.total;

    res.json({
      asOfDate,
      assets: {
        currentAssets: netAssets > 0 ? netAssets : 0,
        details: revenuesByCategory
      },
      liabilities: {
        currentLiabilities: netAssets < 0 ? Math.abs(netAssets) : 0,
        details: expensesByCategory
      },
      equity: {
        retainedEarnings: netAssets,
        total: netAssets
      },
      totalAssets: Math.max(0, netAssets),
      totalLiabilities: netAssets < 0 ? Math.abs(netAssets) : 0
    });
  } catch (error) {
    console.error('Get balance sheet error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get income statement (Compte de résultat)
router.get('/income-statement', authMiddleware, (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const end = endDate || now.toISOString().split('T')[0];

    let projectFilter = projectId ? ` AND projectId = ${projectId}` : '';

    const revenues = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'revenue' AND date BETWEEN ? AND ?${projectFilter}
      GROUP BY category
      ORDER BY total DESC
    `).all(req.user.userId, start, end);

    const expenses = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'expense' AND date BETWEEN ? AND ?${projectFilter}
      GROUP BY category
      ORDER BY total DESC
    `).all(req.user.userId, start, end);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.total, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.total, 0);
    const netIncome = totalRevenue - totalExpense;

    res.json({
      period: { start, end },
      revenues: {
        items: revenues,
        total: totalRevenue
      },
      expenses: {
        items: expenses,
        total: totalExpense
      },
      grossProfit: totalRevenue,
      operatingIncome: netIncome,
      netIncome
    });
  } catch (error) {
    console.error('Get income statement error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get cash flow
router.get('/cash-flow', authMiddleware, (req, res) => {
  try {
    const { projectId, months = 12 } = req.query;
    let projectFilter = projectId ? ` AND projectId = ${projectId}` : '';

    const cashFlow = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as period,
        SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as inflow,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as outflow
      FROM accounting_transactions 
      WHERE userId = ? AND date >= date('now', '-${months} months')${projectFilter}
      GROUP BY strftime('%Y-%m', date)
      ORDER BY period
    `).all(req.user.userId);

    // Calculate running balance
    let runningBalance = 0;
    const cashFlowWithBalance = cashFlow.map(cf => {
      const netFlow = cf.inflow - cf.outflow;
      runningBalance += netFlow;
      return {
        ...cf,
        netFlow,
        balance: runningBalance
      };
    });

    res.json({ cashFlow: cashFlowWithBalance });
  } catch (error) {
    console.error('Get cash flow error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ VAT ============

// Get VAT summary
router.get('/vat/summary', authMiddleware, (req, res) => {
  try {
    const { year, month, projectId } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    let dateFilter = `strftime('%Y', date) = '${currentYear}' AND strftime('%m', date) = '${String(currentMonth).padStart(2, '0')}'`;
    let projectFilter = projectId ? ` AND projectId = ${projectId}` : '';

    // Sales (revenues) - VAT collected
    const sales = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'revenue' AND ${dateFilter}${projectFilter}
    `).get(req.user.userId);

    // Purchases (expenses) - VAT deductible
    const purchases = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'expense' AND ${dateFilter}${projectFilter}
    `).get(req.user.userId);

    const vatRate19 = 0.19;
    const vatRate7 = 0.07;

    // Assuming 19% VAT on sales and purchases (simplified)
    const vatCollected = sales.total * vatRate19 / (1 + vatRate19);
    const vatDeductible = purchases.total * vatRate19 / (1 + vatRate19);
    const vatDue = vatCollected - vatDeductible;

    res.json({
      period: `${currentMonth}/${currentYear}`,
      salesHT: sales.total / (1 + vatRate19),
      salesTTC: sales.total,
      purchasesHT: purchases.total / (1 + vatRate19),
      purchasesTTC: purchases.total,
      vatCollected: Math.round(vatCollected * 100) / 100,
      vatDeductible: Math.round(vatDeductible * 100) / 100,
      vatDue: Math.round(vatDue * 100) / 100,
      vatRate: '19%'
    });
  } catch (error) {
    console.error('Get VAT summary error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Save VAT declaration
router.post('/vat/declarations', authMiddleware, (req, res) => {
  try {
    const { year, month, salesAmount, purchasesAmount, vatCollected, vatDeductible, vatDue, projectId } = req.body;

    const result = db.prepare(`
      INSERT INTO vat_declarations (userId, projectId, period, year, month, salesAmount, purchasesAmount, vatCollected, vatDeductible, vatDue, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `).run(req.user.userId, projectId || null, `${month}/${year}`, year, month, salesAmount, purchasesAmount, vatCollected, vatDeductible, vatDue);

    res.status(201).json({ 
      message: 'Déclaration TVA enregistrée',
      declarationId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Save VAT declaration error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get VAT declarations
router.get('/vat/declarations', authMiddleware, (req, res) => {
  try {
    const declarations = db.prepare(`
      SELECT * FROM vat_declarations 
      WHERE userId = ?
      ORDER BY year DESC, month DESC
    `).all(req.user.userId);

    res.json({ declarations });
  } catch (error) {
    console.error('Get VAT declarations error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ EXPORT ============

// Export data for accountant
router.get('/export/fec', authMiddleware, (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const end = endDate || now.toISOString().split('T')[0];

    let projectFilter = projectId ? ` AND projectId = ${projectId}` : '';

    const transactions = db.prepare(`
      SELECT * FROM accounting_transactions 
      WHERE userId = ? AND date BETWEEN ? AND ?${projectFilter}
      ORDER BY date, id
    `).all(req.user.userId, start, end);

    // Format as FEC (Fichier des Écritures Comptables)
    const fecData = transactions.map((t, index) => ({
      JournalCode: t.type === 'revenue' ? 'VE' : 'AC',
      JournalLib: t.type === 'revenue' ? 'Ventes' : 'Achats',
      EcritureNum: String(index + 1).padStart(6, '0'),
      EcritureDate: t.date.replace(/-/g, ''),
      CompteNum: t.type === 'revenue' ? '70000000' : '60000000',
      CompteLib: t.category,
      CompAuxNum: '',
      CompAuxLib: '',
      PieceRef: t.reference || '',
      PieceDate: t.date.replace(/-/g, ''),
      EcritureLib: t.description || t.category,
      Debit: t.type === 'expense' ? t.amount.toFixed(2) : '0.00',
      Credit: t.type === 'revenue' ? t.amount.toFixed(2) : '0.00',
      EcritureLet: '',
      DateLet: '',
      ValidDate: t.date.replace(/-/g, ''),
      Montantdevise: '',
      Idevise: ''
    }));

    res.json({ 
      format: 'FEC',
      period: { start, end },
      entries: fecData,
      totalEntries: fecData.length
    });
  } catch (error) {
    console.error('Export FEC error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Export summary as JSON (for PDF generation on frontend)
router.get('/export/summary', authMiddleware, (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const end = endDate || now.toISOString().split('T')[0];

    let projectFilter = projectId ? ` AND projectId = ${projectId}` : '';

    // Get user info
    const user = db.prepare('SELECT firstName, lastName, company FROM users WHERE id = ?')
      .get(req.user.userId);

    // Get project info if specified
    let project = null;
    if (projectId) {
      project = db.prepare('SELECT name FROM projects WHERE id = ?').get(projectId);
    }

    // Get summary data
    const revenues = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'revenue' AND date BETWEEN ? AND ?${projectFilter}
      GROUP BY category
      ORDER BY total DESC
    `).all(req.user.userId, start, end);

    const expenses = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM accounting_transactions 
      WHERE userId = ? AND type = 'expense' AND date BETWEEN ? AND ?${projectFilter}
      GROUP BY category
      ORDER BY total DESC
    `).all(req.user.userId, start, end);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.total, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.total, 0);

    res.json({
      generatedAt: new Date().toISOString(),
      period: { start, end },
      company: user.company || `${user.firstName} ${user.lastName}`,
      project: project?.name || 'Tous les projets',
      revenues: {
        items: revenues,
        total: totalRevenue
      },
      expenses: {
        items: expenses,
        total: totalExpense
      },
      netProfit: totalRevenue - totalExpense,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpense) / totalRevenue * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Export summary error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
