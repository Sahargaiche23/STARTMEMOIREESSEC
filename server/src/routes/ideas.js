const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Startup idea templates by industry
const ideaTemplates = {
  tech: [
    { title: 'Application de productivité IA', problem: 'Les professionnels perdent du temps sur des tâches répétitives', solution: 'Une application qui automatise les tâches quotidiennes avec l\'IA' },
    { title: 'Plateforme EdTech', problem: 'L\'accès à l\'éducation de qualité est limité', solution: 'Une plateforme d\'apprentissage en ligne personnalisée' },
    { title: 'Solution SaaS B2B', problem: 'Les PME manquent d\'outils adaptés à leur budget', solution: 'Un logiciel cloud abordable pour la gestion d\'entreprise' },
    { title: 'Application de cybersécurité', problem: 'Les petites entreprises sont vulnérables aux cyberattaques', solution: 'Une solution de sécurité simple et accessible' }
  ],
  ecommerce: [
    { title: 'Marketplace locale', problem: 'Les artisans locaux n\'ont pas de visibilité en ligne', solution: 'Une plateforme de vente pour les produits locaux' },
    { title: 'E-commerce éco-responsable', problem: 'Difficulté à trouver des produits durables', solution: 'Une boutique en ligne spécialisée dans les produits écologiques' },
    { title: 'Subscription box personnalisée', problem: 'Les consommateurs veulent des expériences uniques', solution: 'Des box mensuelles personnalisées selon les préférences' }
  ],
  fintech: [
    { title: 'Application de gestion financière', problem: 'Les jeunes ont du mal à gérer leur budget', solution: 'Une app intuitive pour suivre et optimiser ses dépenses' },
    { title: 'Plateforme de crowdfunding', problem: 'Accès limité au financement pour les startups', solution: 'Une plateforme de financement participatif locale' },
    { title: 'Solution de paiement mobile', problem: 'Les paiements numériques sont complexes', solution: 'Un portefeuille mobile simple et sécurisé' }
  ],
  health: [
    { title: 'Télémédecine', problem: 'Accès difficile aux soins médicaux', solution: 'Une plateforme de consultation médicale en ligne' },
    { title: 'Application de bien-être', problem: 'Le stress et l\'anxiété sont en augmentation', solution: 'Une app de méditation et de suivi de santé mentale' },
    { title: 'Gestion de rendez-vous médicaux', problem: 'Organisation complexe des rendez-vous', solution: 'Une plateforme centralisée pour la gestion médicale' }
  ],
  food: [
    { title: 'Livraison de repas sains', problem: 'Manque de temps pour cuisiner sainement', solution: 'Un service de livraison de repas équilibrés' },
    { title: 'Application anti-gaspillage', problem: 'Le gaspillage alimentaire est important', solution: 'Une app connectant restaurants et consommateurs pour les invendus' },
    { title: 'Ferme urbaine', problem: 'Accès limité aux produits frais en ville', solution: 'Des micro-fermes urbaines avec livraison locale' }
  ],
  services: [
    { title: 'Plateforme freelance locale', problem: 'Difficulté à trouver des prestataires de confiance', solution: 'Une marketplace de services avec avis vérifiés' },
    { title: 'Conciergerie digitale', problem: 'Manque de temps pour les tâches quotidiennes', solution: 'Un service de conciergerie accessible via app' },
    { title: 'Plateforme de coworking', problem: 'Les espaces de travail flexibles sont rares', solution: 'Un réseau d\'espaces de coworking à la demande' }
  ],
  education: [
    { title: 'Tutorat en ligne', problem: 'Les étudiants ont besoin d\'aide personnalisée', solution: 'Une plateforme de mise en relation tuteur-étudiant' },
    { title: 'Formation professionnelle', problem: 'Les compétences évoluent rapidement', solution: 'Des formations courtes et certifiantes en ligne' },
    { title: 'Application d\'apprentissage des langues', problem: 'Apprendre une langue est long et coûteux', solution: 'Une méthode d\'apprentissage gamifiée et accessible' }
  ]
};

// Generate startup ideas
router.post('/generate', authMiddleware, (req, res) => {
  try {
    const { industry, interests, skills, budget } = req.body;

    const selectedIndustry = industry || 'tech';
    const templates = ideaTemplates[selectedIndustry] || ideaTemplates.tech;
    
    // Generate customized ideas based on input
    const generatedIdeas = templates.map((template, index) => {
      const targetMarkets = [
        'Jeunes professionnels (25-35 ans)',
        'Étudiants universitaires',
        'PME et startups',
        'Familles urbaines',
        'Freelances et entrepreneurs'
      ];

      return {
        title: template.title,
        description: `${template.solution} ciblant le marché tunisien.`,
        problem: template.problem,
        solution: template.solution,
        targetMarket: targetMarkets[index % targetMarkets.length],
        industry: selectedIndustry,
        score: Math.floor(Math.random() * 30) + 70,
        viability: {
          market: Math.floor(Math.random() * 20) + 80,
          competition: Math.floor(Math.random() * 30) + 60,
          implementation: Math.floor(Math.random() * 25) + 70
        }
      };
    });

    res.json({ ideas: generatedIdeas });
  } catch (error) {
    console.error('Generate ideas error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get all saved ideas for user
router.get('/', authMiddleware, (req, res) => {
  try {
    const ideas = db.prepare(`
      SELECT i.*, p.name as projectName
      FROM ideas i
      LEFT JOIN projects p ON i.projectId = p.id
      WHERE i.userId = ?
      ORDER BY i.createdAt DESC
    `).all(req.user.userId);

    res.json({ ideas });
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Save an idea
router.post('/', authMiddleware, [
  body('title').notEmpty().withMessage('Le titre est requis')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, problem, solution, targetMarket, industry, score, projectId } = req.body;

    const result = db.prepare(`
      INSERT INTO ideas (userId, projectId, title, description, problem, solution, targetMarket, industry, score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.userId,
      projectId || null,
      title,
      description || null,
      problem || null,
      solution || null,
      targetMarket || null,
      industry || null,
      score || 0
    );

    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Idée sauvegardée', idea });
  } catch (error) {
    console.error('Save idea error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Toggle favorite
router.put('/:id/favorite', authMiddleware, (req, res) => {
  try {
    const idea = db.prepare('SELECT * FROM ideas WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!idea) {
      return res.status(404).json({ message: 'Idée non trouvée' });
    }

    db.prepare('UPDATE ideas SET isFavorite = ? WHERE id = ?')
      .run(idea.isFavorite ? 0 : 1, req.params.id);

    res.json({ message: 'Statut favori mis à jour', isFavorite: !idea.isFavorite });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete idea
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const idea = db.prepare('SELECT * FROM ideas WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!idea) {
      return res.status(404).json({ message: 'Idée non trouvée' });
    }

    db.prepare('DELETE FROM ideas WHERE id = ?').run(req.params.id);
    res.json({ message: 'Idée supprimée' });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Convert idea to project
router.post('/:id/to-project', authMiddleware, (req, res) => {
  try {
    const idea = db.prepare('SELECT * FROM ideas WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!idea) {
      return res.status(404).json({ message: 'Idée non trouvée' });
    }

    // Create project from idea
    const result = db.prepare(`
      INSERT INTO projects (userId, name, description, industry, stage)
      VALUES (?, ?, ?, ?, 'idea')
    `).run(req.user.userId, idea.title, idea.description, idea.industry);

    // Link idea to project
    db.prepare('UPDATE ideas SET projectId = ? WHERE id = ?')
      .run(result.lastInsertRowid, req.params.id);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Projet créé à partir de l\'idée', project });
  } catch (error) {
    console.error('Convert idea error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
