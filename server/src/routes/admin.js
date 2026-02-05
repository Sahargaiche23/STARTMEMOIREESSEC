const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

// Admin credentials (stored securely)
const ADMIN_EMAIL = 'admin@startuplab.com';
const ADMIN_PASSWORD = 'Admin@2024!';

// Admin login
router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();
    
    console.log('Admin login attempt:', { email, password, expectedEmail: ADMIN_EMAIL, expectedPassword: ADMIN_PASSWORD });
    
    // Check admin credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      console.log('Admin login failed - credentials mismatch');
      return res.status(401).json({ message: 'Identifiants administrateur incorrects' });
    }
    
    // Generate admin token
    const token = jwt.sign(
      { userId: 0, email: ADMIN_EMAIL, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({
      message: 'Connexion admin réussie',
      token,
      user: {
        id: 0,
        email: ADMIN_EMAIL,
        firstName: 'Admin',
        lastName: 'StartUpLab',
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    return next();
  }
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
  }
  next();
};

// Get dashboard stats
router.get('/stats', authMiddleware, isAdmin, (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    const totalIdeas = db.prepare('SELECT COUNT(*) as count FROM ideas').get().count;
    const activeSubscriptions = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE isActive = 1 AND plan != 'free'").get().count;
    
    // Users by subscription
    const usersByPlan = db.prepare(`
      SELECT s.plan, COUNT(*) as count 
      FROM subscriptions s 
      GROUP BY s.plan
    `).all();
    
    // Recent users (last 7 days)
    const recentUsers = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE createdAt >= datetime('now', '-7 days')
    `).get().count;
    
    // Revenue stats
    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'
    `).get().total;
    
    const monthlyRevenue = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments 
      WHERE status = 'completed' AND createdAt >= datetime('now', '-30 days')
    `).get().total;

    res.json({
      totalUsers,
      totalProjects,
      totalIdeas,
      activeSubscriptions,
      recentUsers,
      totalRevenue,
      monthlyRevenue,
      usersByPlan
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get all users
router.get('/users', authMiddleware, isAdmin, (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.id, u.email, u.firstName, u.lastName, u.phone, u.company, 
             u.role, u.subscription, u.avatarUrl, u.authProvider, u.isActive,
             u.createdAt, s.plan as subscriptionPlan
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.userId
      WHERE 1=1
    `;
    const params = [];
    
    if (search) {
      query += ` AND (u.email LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }
    
    if (status === 'active') {
      query += ` AND u.isActive = 1`;
    } else if (status === 'inactive') {
      query += ` AND u.isActive = 0`;
    }
    
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as count FROM');
    const total = db.prepare(countQuery).get(...params).count;
    
    query += ` ORDER BY u.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const users = db.prepare(query).all(...params);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get single user details
router.get('/users/:id', authMiddleware, isAdmin, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT u.*, s.plan as subscriptionPlan, s.startDate, s.endDate
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.userId
      WHERE u.id = ?
    `).get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Get user's projects
    const projects = db.prepare('SELECT * FROM projects WHERE userId = ?').all(req.params.id);
    
    // Get user's payments
    const payments = db.prepare('SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC').all(req.params.id);
    
    delete user.password;
    delete user.faceDescriptor;
    
    res.json({ user, projects, payments });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update user
router.put('/users/:id', authMiddleware, isAdmin, (req, res) => {
  try {
    const { firstName, lastName, email, role, isActive, subscription } = req.body;
    const userId = req.params.id;
    
    db.prepare(`
      UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(firstName, lastName, email, role, isActive ? 1 : 0, userId);
    
    if (subscription) {
      db.prepare('UPDATE subscriptions SET plan = ? WHERE userId = ?').run(subscription, userId);
    }
    
    res.json({ message: 'Utilisateur mis à jour' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete user
router.delete('/users/:id', authMiddleware, isAdmin, (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent self-deletion
    if (userId == req.user.userId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get all projects
router.get('/projects', authMiddleware, isAdmin, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const total = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    
    const projects = db.prepare(`
      SELECT p.*, u.email as ownerEmail, u.firstName as ownerFirstName, u.lastName as ownerLastName
      FROM projects p
      JOIN users u ON p.userId = u.id
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));
    
    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get all payments
router.get('/payments', authMiddleware, isAdmin, (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, u.email as userEmail, u.firstName, u.lastName
      FROM payments p
      JOIN users u ON p.userId = u.id
    `;
    const params = [];
    
    if (status) {
      query += ` WHERE p.status = ?`;
      params.push(status);
    }
    
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as count FROM');
    const total = db.prepare(countQuery).get(...params).count;
    
    query += ` ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const payments = db.prepare(query).all(...params);
    
    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Approve/Reject payment
router.put('/payments/:id/status', authMiddleware, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    
    // Update payment status
    db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(status, id);
    
    // If approved, activate the subscription
    if (status === 'approved') {
      const subscription = db.prepare('SELECT * FROM subscriptions WHERE userId = ?').get(payment.userId);
      if (subscription) {
        db.prepare('UPDATE subscriptions SET isActive = 1, paymentStatus = ? WHERE userId = ?').run('approved', payment.userId);
      } else {
        // Create subscription if doesn't exist
        db.prepare(`
          INSERT INTO subscriptions (userId, plan, isActive, paymentStatus, startDate)
          VALUES (?, ?, 1, 'approved', datetime('now'))
        `).run(payment.userId, payment.subscriptionType || 'pro');
      }
      
      // Update user subscription field
      db.prepare('UPDATE users SET subscription = ? WHERE id = ?').run(payment.subscriptionType || 'pro', payment.userId);
      
      // Create notification for user
      db.prepare(`
        INSERT INTO notifications (userId, type, title, message)
        VALUES (?, 'subscription_approved', 'Abonnement activé', 'Votre paiement a été approuvé. Votre abonnement ${payment.subscriptionType} est maintenant actif !')
      `).run(payment.userId);
      
    } else if (status === 'rejected') {
      // Deactivate subscription if rejected
      db.prepare('UPDATE subscriptions SET isActive = 0, paymentStatus = ? WHERE userId = ?').run('rejected', payment.userId);
      
      // Create notification for user
      db.prepare(`
        INSERT INTO notifications (userId, type, title, message)
        VALUES (?, 'subscription_rejected', 'Paiement rejeté', 'Votre paiement a été rejeté. Veuillez contacter le support pour plus d''informations.')
      `).run(payment.userId);
    }
    
    res.json({ message: `Paiement ${status === 'approved' ? 'approuvé' : 'rejeté'}` });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Activity logs
router.get('/activity', authMiddleware, isAdmin, (req, res) => {
  try {
    // Get recent user registrations
    const recentUsers = db.prepare(`
      SELECT id, email, firstName, lastName, createdAt, 'registration' as type
      FROM users
      ORDER BY createdAt DESC
      LIMIT 10
    `).all();
    
    // Get recent projects
    const recentProjects = db.prepare(`
      SELECT p.id, p.name, p.createdAt, u.email as userEmail, 'project' as type
      FROM projects p
      JOIN users u ON p.userId = u.id
      ORDER BY p.createdAt DESC
      LIMIT 10
    `).all();
    
    // Get recent payments
    const recentPayments = db.prepare(`
      SELECT p.id, p.amount, p.status, p.createdAt, u.email as userEmail, 'payment' as type
      FROM payments p
      JOIN users u ON p.userId = u.id
      ORDER BY p.createdAt DESC
      LIMIT 10
    `).all();
    
    // Combine and sort by date
    const activities = [...recentUsers, ...recentProjects, ...recentPayments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
    
    res.json({ activities });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
