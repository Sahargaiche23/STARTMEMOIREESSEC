const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Business Model Canvas templates
const canvasTemplates = {
  saas: {
    keyPartners: 'Hébergeurs cloud, Intégrateurs API, Revendeurs',
    keyActivities: 'Développement logiciel, Support client, Marketing digital',
    keyResources: 'Équipe technique, Infrastructure cloud, Propriété intellectuelle',
    valuePropositions: 'Solution accessible, Mises à jour automatiques, Support 24/7',
    customerRelationships: 'Self-service, Support en ligne, Communauté utilisateurs',
    channels: 'Site web, App stores, Partenaires, Réseaux sociaux',
    customerSegments: 'PME, Startups, Freelances',
    costStructure: 'Développement, Hébergement, Marketing, Support',
    revenueStreams: 'Abonnements mensuels/annuels, Plans premium, Services additionnels'
  },
  marketplace: {
    keyPartners: 'Vendeurs, Prestataires logistiques, Processeurs de paiement',
    keyActivities: 'Gestion plateforme, Acquisition vendeurs/acheteurs, Contrôle qualité',
    keyResources: 'Plateforme technologique, Base utilisateurs, Marque',
    valuePropositions: 'Large choix, Prix compétitifs, Confiance et sécurité',
    customerRelationships: 'Avis et notations, Service client, Programme fidélité',
    channels: 'Application mobile, Site web, Marketing digital',
    customerSegments: 'Acheteurs en ligne, Vendeurs professionnels, Particuliers',
    costStructure: 'Technologie, Marketing, Logistique, Support',
    revenueStreams: 'Commission sur ventes, Frais d\'inscription, Publicité'
  },
  service: {
    keyPartners: 'Prestataires, Fournisseurs, Partenaires stratégiques',
    keyActivities: 'Prestation de service, Relation client, Formation',
    keyResources: 'Expertise, Équipe qualifiée, Réputation',
    valuePropositions: 'Qualité de service, Personnalisation, Réactivité',
    customerRelationships: 'Accompagnement personnalisé, Suivi régulier',
    channels: 'Vente directe, Recommandations, Présence en ligne',
    customerSegments: 'Entreprises, Particuliers, Institutions',
    costStructure: 'Salaires, Formation, Marketing, Outils',
    revenueStreams: 'Honoraires, Forfaits, Contrats récurrents'
  }
};

// Get business model for a project
router.get('/project/:projectId', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const businessModel = db.prepare('SELECT * FROM business_models WHERE projectId = ?')
      .get(req.params.projectId);

    res.json({ businessModel: businessModel || null });
  } catch (error) {
    console.error('Get business model error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Generate business model from template
router.post('/generate', authMiddleware, (req, res) => {
  try {
    const { projectId, template, customData } = req.body;

    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const selectedTemplate = canvasTemplates[template] || canvasTemplates.saas;
    
    // Merge template with custom data
    const businessModelData = {
      ...selectedTemplate,
      ...customData
    };

    res.json({ businessModel: businessModelData, template: selectedTemplate });
  } catch (error) {
    console.error('Generate business model error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Save or update business model
router.post('/project/:projectId', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const {
      keyPartners,
      keyActivities,
      keyResources,
      valuePropositions,
      customerRelationships,
      channels,
      customerSegments,
      costStructure,
      revenueStreams
    } = req.body;

    const existing = db.prepare('SELECT id FROM business_models WHERE projectId = ?')
      .get(req.params.projectId);

    if (existing) {
      db.prepare(`
        UPDATE business_models SET
          keyPartners = ?, keyActivities = ?, keyResources = ?,
          valuePropositions = ?, customerRelationships = ?, channels = ?,
          customerSegments = ?, costStructure = ?, revenueStreams = ?,
          updatedAt = CURRENT_TIMESTAMP
        WHERE projectId = ?
      `).run(
        keyPartners, keyActivities, keyResources,
        valuePropositions, customerRelationships, channels,
        customerSegments, costStructure, revenueStreams,
        req.params.projectId
      );
    } else {
      db.prepare(`
        INSERT INTO business_models (
          projectId, keyPartners, keyActivities, keyResources,
          valuePropositions, customerRelationships, channels,
          customerSegments, costStructure, revenueStreams
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.params.projectId,
        keyPartners, keyActivities, keyResources,
        valuePropositions, customerRelationships, channels,
        customerSegments, costStructure, revenueStreams
      );
    }

    const businessModel = db.prepare('SELECT * FROM business_models WHERE projectId = ?')
      .get(req.params.projectId);

    res.json({ message: 'Business Model sauvegardé', businessModel });
  } catch (error) {
    console.error('Save business model error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get available templates
router.get('/templates', authMiddleware, (req, res) => {
  res.json({
    templates: [
      { id: 'saas', name: 'SaaS / Logiciel', description: 'Pour les startups logicielles' },
      { id: 'marketplace', name: 'Marketplace', description: 'Pour les plateformes de mise en relation' },
      { id: 'service', name: 'Service', description: 'Pour les entreprises de services' }
    ]
  });
});

module.exports = router;
