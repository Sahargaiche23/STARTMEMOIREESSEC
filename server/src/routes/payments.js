const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Subscription plans
const subscriptionPlans = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'TND',
    features: [
      '1 projet actif',
      'Générateur d\'idées basique',
      'Business Model Canvas',
      'Support communautaire'
    ],
    limits: {
      projects: 1,
      ideas: 10,
      teamMembers: 2
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'TND',
    period: 'mois',
    features: [
      '5 projets actifs',
      'Générateur d\'idées avancé',
      'Business Model Canvas',
      'Génération de Business Plan PDF',
      'Pitch Deck Builder',
      'Support email'
    ],
    limits: {
      projects: 5,
      ideas: 50,
      teamMembers: 5
    }
  },
  pro: {
    id: 'pro',
    name: 'Professionnel',
    price: 79,
    currency: 'TND',
    period: 'mois',
    features: [
      'Projets illimités',
      'Toutes les fonctionnalités',
      'Branding complet',
      'Gestion d\'équipe avancée',
      'Exports illimités',
      'Support prioritaire',
      'Consultation mensuelle'
    ],
    limits: {
      projects: -1,
      ideas: -1,
      teamMembers: -1
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Entreprise',
    price: 199,
    currency: 'TND',
    period: 'mois',
    features: [
      'Tout du plan Pro',
      'API Access',
      'White-label',
      'Support dédié 24/7',
      'Formation personnalisée',
      'Intégrations sur mesure'
    ],
    limits: {
      projects: -1,
      ideas: -1,
      teamMembers: -1
    }
  }
};

// Payment methods available in Tunisia
const paymentMethods = [
  { id: 'd17', name: 'D17', type: 'mobile', description: 'Paiement mobile D17' },
  { id: 'flouci', name: 'Flouci', type: 'mobile', description: 'Paiement mobile Flouci' },
  { id: 'bank_card', name: 'Carte bancaire', type: 'card', description: 'Visa / Mastercard tunisienne' },
  { id: 'bank_transfer', name: 'Virement bancaire', type: 'transfer', description: 'Virement IBAN' }
];

// Get subscription plans
router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(subscriptionPlans) });
});

// Get payment methods
router.get('/methods', (req, res) => {
  res.json({ methods: paymentMethods });
});

// Get current subscription
router.get('/subscription', authMiddleware, (req, res) => {
  try {
    const subscription = db.prepare(`
      SELECT s.*, u.email
      FROM subscriptions s
      JOIN users u ON s.userId = u.id
      WHERE s.userId = ?
    `).get(req.user.userId);

    const plan = subscriptionPlans[subscription?.plan || 'free'];
    
    // Check if subscription is actually active (payment approved)
    const isActive = subscription?.isActive === 1 && subscription?.paymentStatus === 'approved';

    res.json({ 
      subscription: subscription || { plan: 'free', isActive: true, paymentStatus: 'approved' },
      planDetails: plan,
      canAccessFeatures: subscription?.plan === 'free' || isActive,
      paymentStatus: subscription?.paymentStatus || 'approved'
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Initiate payment
router.post('/initiate', authMiddleware, (req, res) => {
  try {
    const { planId, paymentMethod } = req.body;
    const plan = subscriptionPlans[planId];

    if (!plan) {
      return res.status(400).json({ message: 'Plan invalide' });
    }

    if (plan.price === 0) {
      return res.status(400).json({ message: 'Le plan gratuit ne nécessite pas de paiement' });
    }

    const method = paymentMethods.find(m => m.id === paymentMethod);
    if (!method) {
      return res.status(400).json({ message: 'Méthode de paiement invalide' });
    }

    // Create pending payment
    const transactionId = uuidv4();
    const result = db.prepare(`
      INSERT INTO payments (userId, amount, currency, method, status, subscriptionType, transactionId)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).run(
      req.user.userId,
      plan.price,
      plan.currency,
      paymentMethod,
      planId,
      transactionId
    );

    // Generate payment instructions based on method
    let paymentInstructions = {};

    switch (paymentMethod) {
      case 'd17':
        paymentInstructions = {
          type: 'mobile',
          phone: '+216 XX XXX XXX',
          reference: transactionId.substring(0, 8).toUpperCase(),
          instructions: 'Envoyez le montant via D17 avec la référence indiquée'
        };
        break;
      case 'flouci':
        paymentInstructions = {
          type: 'redirect',
          url: `https://flouci.com/pay?amount=${plan.price}&ref=${transactionId}`,
          instructions: 'Vous allez être redirigé vers Flouci'
        };
        break;
      case 'bank_card':
        paymentInstructions = {
          type: 'card_form',
          instructions: 'Entrez les informations de votre carte'
        };
        break;
      case 'bank_transfer':
        paymentInstructions = {
          type: 'transfer',
          iban: 'TN59 XXXX XXXX XXXX XXXX XXXX',
          bank: 'Banque Nationale',
          beneficiary: 'StartUpLab SARL',
          reference: transactionId.substring(0, 8).toUpperCase(),
          instructions: 'Effectuez le virement avec la référence indiquée'
        };
        break;
    }

    res.json({
      paymentId: result.lastInsertRowid,
      transactionId,
      amount: plan.price,
      currency: plan.currency,
      plan: plan.name,
      paymentInstructions
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Confirm payment (user confirms they made the payment - awaiting admin approval)
router.post('/confirm/:transactionId', authMiddleware, (req, res) => {
  try {
    const payment = db.prepare('SELECT * FROM payments WHERE transactionId = ? AND userId = ?')
      .get(req.params.transactionId, req.user.userId);

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Ce paiement a déjà été traité' });
    }

    // Create/update subscription with pending payment status (NOT active yet)
    const existingSub = db.prepare('SELECT * FROM subscriptions WHERE userId = ?').get(req.user.userId);
    
    if (existingSub) {
      db.prepare(`
        UPDATE subscriptions SET 
          plan = ?, 
          paymentStatus = 'pending',
          isActive = 0
        WHERE userId = ?
      `).run(payment.subscriptionType, req.user.userId);
    } else {
      db.prepare(`
        INSERT INTO subscriptions (userId, plan, isActive, paymentStatus)
        VALUES (?, ?, 0, 'pending')
      `).run(req.user.userId, payment.subscriptionType);
    }

    res.json({ 
      message: 'Paiement enregistré. En attente de validation par l\'administrateur.',
      status: 'pending_approval'
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get payment history
router.get('/history', authMiddleware, (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT * FROM payments 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `).all(req.user.userId);

    res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Cancel subscription
router.post('/cancel', authMiddleware, (req, res) => {
  try {
    db.prepare(`
      UPDATE subscriptions SET isActive = 0 WHERE userId = ?
    `).run(req.user.userId);

    db.prepare('UPDATE users SET subscription = ? WHERE id = ?')
      .run('free', req.user.userId);

    res.json({ message: 'Abonnement annulé. Vous passerez au plan gratuit à la fin de la période.' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
