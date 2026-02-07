const express = require('express');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Seed default categories and products
const seedProducts = () => {
  const existingCategories = db.prepare('SELECT COUNT(*) as count FROM product_categories').get();
  
  if (existingCategories.count === 0) {
    // Insert categories
    const categories = [
      { name: 'Comptabilité & Gestion', slug: 'comptabilite-gestion', description: 'Solutions de comptabilité et gestion financière', icon: 'Calculator', color: '#10B981', sortOrder: 1 },
      { name: 'Paie & Ressources Humaines', slug: 'paie-rh', description: 'Gestion de la paie et des ressources humaines', icon: 'Users', color: '#3B82F6', sortOrder: 2 },
      { name: 'ERP & Gestion d\'entreprise', slug: 'erp-gestion', description: 'Solutions ERP complètes pour startups', icon: 'Building2', color: '#8B5CF6', sortOrder: 3 },
      { name: 'Marketing & Growth', slug: 'marketing-growth', description: 'Outils marketing et croissance', icon: 'TrendingUp', color: '#F59E0B', sortOrder: 4 },
      { name: 'Solutions Experts-Comptables', slug: 'experts-comptables', description: 'Outils pour experts-comptables', icon: 'Briefcase', color: '#F97316', sortOrder: 5 },
      { name: 'Intelligence Business (IA)', slug: 'intelligence-business', description: 'Intelligence artificielle pour votre business', icon: 'Brain', color: '#EF4444', sortOrder: 6 }
    ];

    const insertCategory = db.prepare(`
      INSERT INTO product_categories (name, slug, description, icon, color, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    categories.forEach(cat => {
      insertCategory.run(cat.name, cat.slug, cat.description, cat.icon, cat.color, cat.sortOrder);
    });

    // Insert products
    const products = [
      // Comptabilité & Gestion
      { categorySlug: 'comptabilite-gestion', name: 'StartUp Comptabilité Lite', slug: 'comptabilite-lite', description: 'Comptabilité simplifiée pour les petites startups', features: JSON.stringify(['Saisie revenus/dépenses', 'Calcul automatique bénéfices', 'Tableau de bord mensuel', 'Export PDF']), price: 29, isPopular: 0, requiredPlan: 'startup' },
      { categorySlug: 'comptabilite-gestion', name: 'StartUp Comptabilité Pro', slug: 'comptabilite-pro', description: 'Comptabilité complète avec bilan et prévisions', features: JSON.stringify(['Bilan automatique', 'Compte de résultat', 'Cash Flow', 'Prévision financière', 'Conseils IA']), price: 49, isPopular: 1, requiredPlan: 'founder' },
      { categorySlug: 'comptabilite-gestion', name: 'Bilan Automatique', slug: 'bilan-auto', description: 'Génération automatique de bilans comptables', features: JSON.stringify(['Bilan actif/passif', 'Analyse automatique', 'Format standard tunisien']), price: 19, isPopular: 0, requiredPlan: 'startup' },
      { categorySlug: 'comptabilite-gestion', name: 'TVA Tunisie Auto', slug: 'tva-tunisie', description: 'Calcul et déclaration TVA automatisés', features: JSON.stringify(['Calcul TVA 19%/7%', 'Déclaration mensuelle', 'Export pour administration']), price: 15, isPopular: 0, requiredPlan: 'startup' },
      { categorySlug: 'comptabilite-gestion', name: 'Export Expert-Comptable', slug: 'export-expert', description: 'Export de données pour votre expert-comptable', features: JSON.stringify(['Format FEC', 'Export Excel/PDF', 'Partage sécurisé']), price: 10, isPopular: 0, requiredPlan: 'startup' },

      // Paie & RH
      { categorySlug: 'paie-rh', name: 'Gestion Employés', slug: 'gestion-employes', description: 'Gérez vos employés facilement', features: JSON.stringify(['Fiches employés', 'Contrats', 'Documents', 'Historique']), price: 25, isPopular: 0, requiredPlan: 'startup' },
      { categorySlug: 'paie-rh', name: 'Fiches de Paie Auto', slug: 'fiches-paie', description: 'Génération automatique des fiches de paie', features: JSON.stringify(['Calcul salaire net', 'Retenues CNSS', 'IRPP automatique', 'PDF professionnel']), price: 39, isPopular: 1, requiredPlan: 'founder' },
      { categorySlug: 'paie-rh', name: 'Déclaration CNSS', slug: 'declaration-cnss', description: 'Déclarations CNSS automatisées', features: JSON.stringify(['Calcul cotisations', 'Déclaration trimestrielle', 'Export formulaires']), price: 20, isPopular: 0, requiredPlan: 'startup' },
      { categorySlug: 'paie-rh', name: 'Gestion Congés', slug: 'gestion-conges', description: 'Suivi des congés et absences', features: JSON.stringify(['Demandes en ligne', 'Validation manager', 'Solde temps réel', 'Planning équipe']), price: 15, isPopular: 0, requiredPlan: 'startup' },
      { categorySlug: 'paie-rh', name: 'Signature Contrat Digital', slug: 'signature-contrat', description: 'Signature électronique des contrats', features: JSON.stringify(['Signature légale', 'Horodatage', 'Archivage sécurisé']), price: 25, isNew: 1, requiredPlan: 'founder' },

      // ERP & Gestion
      { categorySlug: 'erp-gestion', name: 'Gestion Fournisseurs', slug: 'gestion-fournisseurs', description: 'Gérez vos fournisseurs et achats', features: JSON.stringify(['Fiches fournisseurs', 'Commandes', 'Suivi livraisons', 'Historique achats']), price: 29, isPopular: 0, requiredPlan: 'founder' },
      { categorySlug: 'erp-gestion', name: 'Gestion Stock', slug: 'gestion-stock', description: 'Suivi de stock en temps réel', features: JSON.stringify(['Inventaire', 'Alertes stock bas', 'Mouvements', 'Valorisation']), price: 35, isPopular: 1, requiredPlan: 'founder' },
      { categorySlug: 'erp-gestion', name: 'Gestion Facturation', slug: 'gestion-facturation', description: 'Facturation professionnelle', features: JSON.stringify(['Devis', 'Factures', 'Relances auto', 'Multi-devises']), price: 25, isPopular: 1, requiredPlan: 'startup' },
      { categorySlug: 'erp-gestion', name: 'Gestion Multi-branches', slug: 'multi-branches', description: 'Gérez plusieurs points de vente', features: JSON.stringify(['Multi-sites', 'Consolidation', 'Transferts inter-branches']), price: 59, isNew: 1, requiredPlan: 'enterprise' },
      { categorySlug: 'erp-gestion', name: 'Tableau Financier Avancé', slug: 'tableau-financier', description: 'Tableaux de bord financiers avancés', features: JSON.stringify(['KPIs personnalisés', 'Graphiques interactifs', 'Alertes', 'Export automatique']), price: 39, isPopular: 0, requiredPlan: 'founder' },

      // Marketing & Growth
      { categorySlug: 'marketing-growth', name: 'Création Site Web', slug: 'creation-site', description: 'Créez votre site web startup', features: JSON.stringify(['Templates modernes', 'Responsive', 'SEO optimisé', 'Domaine .tn']), price: 199, isPopular: 1, requiredPlan: 'startup' },
      { categorySlug: 'marketing-growth', name: 'Création App Mobile', slug: 'creation-app', description: 'Créez votre application mobile', features: JSON.stringify(['iOS & Android', 'Design moderne', 'Push notifications']), price: 499, isNew: 1, requiredPlan: 'enterprise' },
      { categorySlug: 'marketing-growth', name: 'SEO Tunisie', slug: 'seo-tunisie', description: 'Référencement local optimisé', features: JSON.stringify(['Audit SEO', 'Optimisation', 'Rapport mensuel', 'Google My Business']), price: 99, isPopular: 0, requiredPlan: 'founder' },
      { categorySlug: 'marketing-growth', name: 'Sponsoring Facebook Ads', slug: 'facebook-ads', description: 'Gestion de vos publicités Facebook', features: JSON.stringify(['Création campagnes', 'Ciblage Tunisie', 'Optimisation budget', 'Rapports ROAS']), price: 149, isPopular: 1, requiredPlan: 'founder' },
      { categorySlug: 'marketing-growth', name: 'Email Marketing', slug: 'email-marketing', description: 'Campagnes email professionnelles', features: JSON.stringify(['Templates', 'Automation', 'Segmentation', 'Analytics']), price: 39, isPopular: 0, requiredPlan: 'startup' },
      { categorySlug: 'marketing-growth', name: 'Landing Pages', slug: 'landing-pages', description: 'Pages d\'atterrissage optimisées', features: JSON.stringify(['Builder drag & drop', 'A/B testing', 'Analytics intégrés']), price: 29, isPopular: 0, requiredPlan: 'startup' },

      // Experts-Comptables
      { categorySlug: 'experts-comptables', name: 'Accès Collaboratif Expert', slug: 'acces-expert', description: 'Invitez votre expert-comptable', features: JSON.stringify(['Accès lecture', 'Commentaires', 'Validation documents']), price: 19, isPopular: 1, requiredPlan: 'startup' },
      { categorySlug: 'experts-comptables', name: 'Validation Factures', slug: 'validation-factures', description: 'Workflow de validation des factures', features: JSON.stringify(['Double validation', 'Historique', 'Notifications']), price: 15, isPopular: 0, requiredPlan: 'founder' },
      { categorySlug: 'experts-comptables', name: 'Export FEC', slug: 'export-fec', description: 'Export au format FEC', features: JSON.stringify(['Format standard', 'Compatible tous logiciels', 'Archivage']), price: 10, isPopular: 0, requiredPlan: 'startup' },
      { categorySlug: 'experts-comptables', name: 'Tableau Fiscal', slug: 'tableau-fiscal', description: 'Suivi des obligations fiscales', features: JSON.stringify(['Calendrier fiscal', 'Rappels échéances', 'Calculs auto']), price: 25, isPopular: 0, requiredPlan: 'founder' },
      { categorySlug: 'experts-comptables', name: 'Historique Transactions', slug: 'historique-transactions', description: 'Historique complet des transactions', features: JSON.stringify(['Recherche avancée', 'Filtres', 'Export', 'Audit trail']), price: 15, isPopular: 0, requiredPlan: 'startup' },

      // Intelligence Business
      { categorySlug: 'intelligence-business', name: 'Score Santé Financière', slug: 'score-sante', description: 'Évaluez la santé de votre startup', features: JSON.stringify(['Score global', 'Indicateurs clés', 'Recommandations IA', 'Benchmark secteur']), price: 29, isPopular: 1, requiredPlan: 'founder' },
      { categorySlug: 'intelligence-business', name: 'Prévision Cashflow', slug: 'prevision-cashflow', description: 'Prédiction de trésorerie IA', features: JSON.stringify(['Prévision 12 mois', 'Scénarios', 'Alertes', 'Recommandations']), price: 39, isPopular: 1, requiredPlan: 'founder' },
      { categorySlug: 'intelligence-business', name: 'Analyse Concurrence', slug: 'analyse-concurrence', description: 'Analysez vos concurrents', features: JSON.stringify(['Veille automatique', 'Comparatif', 'Alertes nouveautés']), price: 49, isNew: 1, requiredPlan: 'enterprise' },
      { categorySlug: 'intelligence-business', name: 'Analyse Marché', slug: 'analyse-marche', description: 'Études de marché IA', features: JSON.stringify(['Tendances', 'Opportunités', 'Risques', 'Rapports']), price: 59, isNew: 1, requiredPlan: 'enterprise' },
      { categorySlug: 'intelligence-business', name: 'Prédiction Ventes', slug: 'prediction-ventes', description: 'Prévisions de ventes intelligentes', features: JSON.stringify(['ML predictions', 'Saisonnalité', 'Facteurs externes', 'Précision 85%+']), price: 49, isPopular: 0, requiredPlan: 'enterprise' }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (categoryId, name, slug, description, features, price, isPopular, isNew, requiredPlan, sortOrder)
      VALUES ((SELECT id FROM product_categories WHERE slug = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach((prod, index) => {
      insertProduct.run(
        prod.categorySlug,
        prod.name,
        prod.slug,
        prod.description,
        prod.features,
        prod.price,
        prod.isPopular || 0,
        prod.isNew || 0,
        prod.requiredPlan,
        index + 1
      );
    });

    console.log('✅ Products seeded successfully');
  }
};

// Initialize products on startup
try {
  seedProducts();
} catch (error) {
  console.log('Products already seeded or error:', error.message);
}

// Get all categories with products
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT * FROM product_categories WHERE isActive = 1 ORDER BY sortOrder
    `).all();

    const products = db.prepare(`
      SELECT p.*, pc.slug as categorySlug 
      FROM products p 
      JOIN product_categories pc ON p.categoryId = pc.id 
      WHERE p.isActive = 1 
      ORDER BY p.sortOrder
    `).all();

    // Group products by category
    const categoriesWithProducts = categories.map(cat => ({
      ...cat,
      products: products
        .filter(p => p.categorySlug === cat.slug)
        .map(p => ({ ...p, features: JSON.parse(p.features || '[]') }))
    }));

    res.json({ categories: categoriesWithProducts });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get single category with products
router.get('/categories/:slug', (req, res) => {
  try {
    const category = db.prepare(`
      SELECT * FROM product_categories WHERE slug = ? AND isActive = 1
    `).get(req.params.slug);

    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    const products = db.prepare(`
      SELECT * FROM products WHERE categoryId = ? AND isActive = 1 ORDER BY sortOrder
    `).all(category.id);

    res.json({ 
      category: {
        ...category,
        products: products.map(p => ({ ...p, features: JSON.parse(p.features || '[]') }))
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get single product
router.get('/product/:slug', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, pc.name as categoryName, pc.slug as categorySlug 
      FROM products p 
      JOIN product_categories pc ON p.categoryId = pc.id 
      WHERE p.slug = ? AND p.isActive = 1
    `).get(req.params.slug);

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ 
      product: { ...product, features: JSON.parse(product.features || '[]') }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Request product activation (pending admin approval)
router.post('/activate', authMiddleware, (req, res) => {
  try {
    const { productId, projectId, duration = 1, durationUnit = 'month' } = req.body;
    const userId = req.user.userId;

    // Check if product exists
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND isActive = 1').get(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Check user subscription
    const user = db.prepare('SELECT subscription, firstName, lastName FROM users WHERE id = ?').get(userId);
    const planLevels = { free: 0, student: 1, startup: 2, founder: 3, enterprise: 4 };
    const requiredLevel = planLevels[product.requiredPlan] || 0;
    const userLevel = planLevels[user.subscription] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        message: `Ce produit nécessite un abonnement ${product.requiredPlan}`,
        requiredPlan: product.requiredPlan
      });
    }

    // Check if already requested or activated
    const existing = db.prepare(`
      SELECT * FROM user_products 
      WHERE userId = ? AND productId = ? AND status IN ('pending', 'active')
    `).get(userId, productId);

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'Demande déjà en cours de traitement' });
      }
      return res.status(400).json({ message: 'Produit déjà activé' });
    }

    // Calculate price based on duration
    const totalPrice = product.price * duration;

    // Create activation request (pending)
    const result = db.prepare(`
      INSERT INTO user_products (userId, productId, projectId, status, duration, durationUnit, price, requestedAt)
      VALUES (?, ?, ?, 'pending', ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, productId, projectId || null, duration, durationUnit, totalPrice);

    // Create notification for admin
    const admins = db.prepare('SELECT id FROM users WHERE role = ?').all('admin');
    admins.forEach(admin => {
      db.prepare(`
        INSERT INTO notifications (userId, type, title, message)
        VALUES (?, 'product_request', 'Nouvelle demande d''activation', ?)
      `).run(admin.id, `${user.firstName} ${user.lastName} demande l'activation de "${product.name}"`);
    });

    res.status(201).json({ 
      message: 'Demande envoyée ! En attente d\'approbation par l\'administrateur.',
      userProductId: result.lastInsertRowid,
      status: 'pending'
    });
  } catch (error) {
    console.error('Activate product error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get user's products (all statuses with subscription info)
router.get('/my-products', authMiddleware, (req, res) => {
  try {
    const products = db.prepare(`
      SELECT up.*, p.name as productName, p.slug, p.description, p.icon, p.price as unitPrice,
             pc.name as categoryName, pc.color,
             julianday(up.expiresAt) - julianday('now') as daysRemaining
      FROM user_products up
      JOIN products p ON up.productId = p.id
      JOIN product_categories pc ON p.categoryId = pc.id
      WHERE up.userId = ?
      ORDER BY 
        CASE up.status 
          WHEN 'active' THEN 1 
          WHEN 'pending' THEN 2 
          WHEN 'expired' THEN 3 
          ELSE 4 
        END,
        up.requestedAt DESC
    `).all(req.user.userId);

    // Add computed fields
    const enrichedProducts = products.map(p => ({
      ...p,
      daysRemaining: p.daysRemaining ? Math.max(0, Math.floor(p.daysRemaining)) : null,
      isExpiringSoon: p.daysRemaining && p.daysRemaining <= 7 && p.daysRemaining > 0,
      isExpired: p.status === 'active' && p.expiresAt && new Date(p.expiresAt) < new Date()
    }));

    // Separate by status
    const active = enrichedProducts.filter(p => p.status === 'active' && !p.isExpired);
    const pending = enrichedProducts.filter(p => p.status === 'pending');
    const expired = enrichedProducts.filter(p => p.status === 'expired' || p.isExpired);
    const rejected = enrichedProducts.filter(p => p.status === 'rejected');

    res.json({ 
      products: enrichedProducts,
      summary: {
        active: active.length,
        pending: pending.length,
        expired: expired.length,
        rejected: rejected.length
      }
    });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Deactivate product
router.delete('/deactivate/:userProductId', authMiddleware, (req, res) => {
  try {
    const userProduct = db.prepare(`
      SELECT * FROM user_products WHERE id = ? AND userId = ?
    `).get(req.params.userProductId, req.user.userId);

    if (!userProduct) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    db.prepare('UPDATE user_products SET status = ? WHERE id = ?')
      .run('inactive', req.params.userProductId);

    res.json({ message: 'Produit désactivé' });
  } catch (error) {
    console.error('Deactivate product error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Request renewal
router.post('/renew/:userProductId', authMiddleware, (req, res) => {
  try {
    const { duration = 1 } = req.body;
    const userProduct = db.prepare(`
      SELECT up.*, p.price, p.name 
      FROM user_products up
      JOIN products p ON up.productId = p.id
      WHERE up.id = ? AND up.userId = ?
    `).get(req.params.userProductId, req.user.userId);

    if (!userProduct) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    const user = db.prepare('SELECT firstName, lastName FROM users WHERE id = ?').get(req.user.userId);
    const totalPrice = userProduct.price * duration;

    // Update to pending renewal
    db.prepare(`
      UPDATE user_products 
      SET status = 'pending', duration = ?, price = ?, requestedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(duration, totalPrice, req.params.userProductId);

    // Notify admin
    const admins = db.prepare('SELECT id FROM users WHERE role = ?').all('admin');
    admins.forEach(admin => {
      db.prepare(`
        INSERT INTO notifications (userId, type, title, message)
        VALUES (?, 'product_renewal', 'Demande de renouvellement', ?)
      `).run(admin.id, `${user.firstName} ${user.lastName} demande le renouvellement de "${userProduct.name}"`);
    });

    res.json({ message: 'Demande de renouvellement envoyée' });
  } catch (error) {
    console.error('Renew product error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ ADMIN ROUTES ============

// Get all pending product requests (admin)
router.get('/admin/requests', authMiddleware, (req, res) => {
  try {
    // Check if admin (either isAdmin flag or role in DB)
    if (!req.user.isAdmin) {
      const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    const requests = db.prepare(`
      SELECT up.*, 
             p.name as productName, p.slug, p.price as unitPrice,
             pc.name as categoryName, pc.color,
             u.firstName, u.lastName, u.email, u.subscription as userPlan
      FROM user_products up
      JOIN products p ON up.productId = p.id
      JOIN product_categories pc ON p.categoryId = pc.id
      JOIN users u ON up.userId = u.id
      WHERE up.status = 'pending'
      ORDER BY up.requestedAt ASC
    `).all();

    res.json({ requests });
  } catch (error) {
    console.error('Get admin requests error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get all product subscriptions (admin)
router.get('/admin/subscriptions', authMiddleware, (req, res) => {
  try {
    // Check if admin (either isAdmin flag or role in DB)
    if (!req.user.isAdmin) {
      const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    const subscriptions = db.prepare(`
      SELECT up.*, 
             p.name as productName, p.slug, p.price as unitPrice,
             pc.name as categoryName, pc.color,
             u.firstName, u.lastName, u.email, u.subscription as userPlan,
             julianday(up.expiresAt) - julianday('now') as daysRemaining
      FROM user_products up
      JOIN products p ON up.productId = p.id
      JOIN product_categories pc ON p.categoryId = pc.id
      JOIN users u ON up.userId = u.id
      ORDER BY up.status, up.requestedAt DESC
    `).all();

    // Add computed fields
    const enriched = subscriptions.map(s => ({
      ...s,
      daysRemaining: s.daysRemaining ? Math.max(0, Math.floor(s.daysRemaining)) : null,
      isExpiringSoon: s.daysRemaining && s.daysRemaining <= 7 && s.daysRemaining > 0
    }));

    res.json({ subscriptions: enriched });
  } catch (error) {
    console.error('Get admin subscriptions error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Approve product request (admin)
router.post('/admin/approve/:requestId', authMiddleware, (req, res) => {
  try {
    // Check if admin (either isAdmin flag or role in DB)
    if (!req.user.isAdmin) {
      const admin = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.userId);
      if (admin?.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    const request = db.prepare(`
      SELECT up.*, p.name as productName, u.firstName, u.lastName
      FROM user_products up
      JOIN products p ON up.productId = p.id
      JOIN users u ON up.userId = u.id
      WHERE up.id = ? AND up.status = 'pending'
    `).get(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    // Calculate expiry date
    const now = new Date();
    let expiresAt = new Date(now);
    if (request.durationUnit === 'month') {
      expiresAt.setMonth(expiresAt.getMonth() + request.duration);
    } else if (request.durationUnit === 'year') {
      expiresAt.setFullYear(expiresAt.getFullYear() + request.duration);
    } else {
      expiresAt.setDate(expiresAt.getDate() + request.duration);
    }

    // Approve and activate
    db.prepare(`
      UPDATE user_products 
      SET status = 'active', 
          approvedAt = CURRENT_TIMESTAMP, 
          approvedBy = ?,
          activatedAt = CURRENT_TIMESTAMP,
          expiresAt = ?
      WHERE id = ?
    `).run(req.user.userId, expiresAt.toISOString(), req.params.requestId);

    // Notify user
    db.prepare(`
      INSERT INTO notifications (userId, type, title, message)
      VALUES (?, 'product_approved', 'Offre activée !', ?)
    `).run(request.userId, `Votre offre "${request.productName}" a été activée. Valide jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}`);

    res.json({ 
      message: 'Offre approuvée et activée',
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Reject product request (admin)
router.post('/admin/reject/:requestId', authMiddleware, (req, res) => {
  try {
    const { reason } = req.body;
    
    // Check if admin (either isAdmin flag or role in DB)
    if (!req.user.isAdmin) {
      const admin = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.userId);
      if (admin?.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    const request = db.prepare(`
      SELECT up.*, p.name as productName
      FROM user_products up
      JOIN products p ON up.productId = p.id
      WHERE up.id = ? AND up.status = 'pending'
    `).get(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    // Reject
    db.prepare(`
      UPDATE user_products 
      SET status = 'rejected', adminNote = ?
      WHERE id = ?
    `).run(reason || 'Demande refusée', req.params.requestId);

    // Notify user
    db.prepare(`
      INSERT INTO notifications (userId, type, title, message)
      VALUES (?, 'product_rejected', 'Demande refusée', ?)
    `).run(request.userId, `Votre demande pour "${request.productName}" a été refusée. ${reason || ''}`);

    res.json({ message: 'Demande refusée' });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
