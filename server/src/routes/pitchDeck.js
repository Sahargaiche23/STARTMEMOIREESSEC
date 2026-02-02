const express = require('express');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Pitch deck slide templates
const slideTemplates = {
  modern: [
    { type: 'title', title: 'Page de titre', content: 'Nom de la startup, slogan, logo' },
    { type: 'problem', title: 'Le Problème', content: 'Quel problème résolvez-vous ?' },
    { type: 'solution', title: 'La Solution', content: 'Comment résolvez-vous ce problème ?' },
    { type: 'product', title: 'Produit / Service', content: 'Démonstration ou capture d\'écran' },
    { type: 'market', title: 'Marché', content: 'TAM, SAM, SOM - Taille du marché' },
    { type: 'business_model', title: 'Modèle Économique', content: 'Comment gagnez-vous de l\'argent ?' },
    { type: 'traction', title: 'Traction', content: 'Métriques clés, clients, revenus' },
    { type: 'competition', title: 'Concurrence', content: 'Positionnement et différenciation' },
    { type: 'team', title: 'Équipe', content: 'Fondateurs et membres clés' },
    { type: 'financials', title: 'Projections Financières', content: 'Revenus, coûts, rentabilité' },
    { type: 'ask', title: 'La Demande', content: 'Ce que vous recherchez (financement, partenariats)' },
    { type: 'contact', title: 'Contact', content: 'Coordonnées et appel à l\'action' }
  ],
  minimal: [
    { type: 'title', title: 'Introduction', content: '' },
    { type: 'problem', title: 'Problème', content: '' },
    { type: 'solution', title: 'Solution', content: '' },
    { type: 'demo', title: 'Démo', content: '' },
    { type: 'market', title: 'Opportunité', content: '' },
    { type: 'team', title: 'Équipe', content: '' },
    { type: 'ask', title: 'Demande', content: '' }
  ],
  investor: [
    { type: 'title', title: 'Page de titre', content: '' },
    { type: 'hook', title: 'Accroche', content: 'Statistique ou fait marquant' },
    { type: 'problem', title: 'Le Problème', content: '' },
    { type: 'solution', title: 'Notre Solution', content: '' },
    { type: 'product', title: 'Le Produit', content: '' },
    { type: 'market', title: 'Opportunité de Marché', content: '' },
    { type: 'business_model', title: 'Modèle Économique', content: '' },
    { type: 'go_to_market', title: 'Stratégie Go-to-Market', content: '' },
    { type: 'traction', title: 'Traction & Métriques', content: '' },
    { type: 'competition', title: 'Paysage Concurrentiel', content: '' },
    { type: 'team', title: 'L\'Équipe', content: '' },
    { type: 'financials', title: 'Projections Financières', content: '' },
    { type: 'use_of_funds', title: 'Utilisation des Fonds', content: '' },
    { type: 'roadmap', title: 'Roadmap', content: '' },
    { type: 'ask', title: 'Notre Demande', content: '' },
    { type: 'appendix', title: 'Annexes', content: '' }
  ]
};

// Get pitch deck for a project
router.get('/project/:projectId', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const pitchDeck = db.prepare('SELECT * FROM pitch_decks WHERE projectId = ?')
      .get(req.params.projectId);

    if (pitchDeck && pitchDeck.slides) {
      pitchDeck.slides = JSON.parse(pitchDeck.slides);
    }

    res.json({ pitchDeck: pitchDeck || null });
  } catch (error) {
    console.error('Get pitch deck error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create pitch deck from template
router.post('/project/:projectId/create', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const { template } = req.body;
    const selectedTemplate = slideTemplates[template] || slideTemplates.modern;

    // Get project data to pre-fill slides
    const branding = db.prepare('SELECT * FROM branding WHERE projectId = ?').get(req.params.projectId);
    const businessModel = db.prepare('SELECT * FROM business_models WHERE projectId = ?').get(req.params.projectId);
    const businessPlan = db.prepare('SELECT * FROM business_plans WHERE projectId = ?').get(req.params.projectId);

    // Create slides with project data
    const slides = selectedTemplate.map(slideTemplate => {
      const slide = { ...slideTemplate, id: Date.now() + Math.random() };
      
      // Pre-fill with project data
      if (slideTemplate.type === 'title' && branding) {
        slide.content = `${branding.companyName || project.name}\n${branding.slogan || ''}`;
      }
      if (slideTemplate.type === 'solution' && businessPlan) {
        slide.content = businessPlan.executiveSummary || slideTemplate.content;
      }
      if (slideTemplate.type === 'business_model' && businessModel) {
        slide.content = `Proposition de valeur: ${businessModel.valuePropositions || ''}\nSources de revenus: ${businessModel.revenueStreams || ''}`;
      }
      if (slideTemplate.type === 'market' && businessPlan) {
        slide.content = businessPlan.marketAnalysis || slideTemplate.content;
      }
      
      return slide;
    });

    // Check if pitch deck exists
    const existing = db.prepare('SELECT id FROM pitch_decks WHERE projectId = ?').get(req.params.projectId);

    if (existing) {
      db.prepare(`
        UPDATE pitch_decks SET slides = ?, template = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE projectId = ?
      `).run(JSON.stringify(slides), template || 'modern', req.params.projectId);
    } else {
      db.prepare(`
        INSERT INTO pitch_decks (projectId, slides, template)
        VALUES (?, ?, ?)
      `).run(req.params.projectId, JSON.stringify(slides), template || 'modern');
    }

    const pitchDeck = db.prepare('SELECT * FROM pitch_decks WHERE projectId = ?').get(req.params.projectId);
    pitchDeck.slides = JSON.parse(pitchDeck.slides);

    res.json({ message: 'Pitch deck créé', pitchDeck });
  } catch (error) {
    console.error('Create pitch deck error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update slides
router.put('/project/:projectId/slides', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const { slides } = req.body;

    db.prepare(`
      UPDATE pitch_decks SET slides = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE projectId = ?
    `).run(JSON.stringify(slides), req.params.projectId);

    res.json({ message: 'Slides mis à jour' });
  } catch (error) {
    console.error('Update slides error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get available templates
router.get('/templates', authMiddleware, (req, res) => {
  res.json({
    templates: [
      { id: 'modern', name: 'Moderne', description: '12 slides - Format standard', slideCount: 12 },
      { id: 'minimal', name: 'Minimaliste', description: '7 slides - Essentiel uniquement', slideCount: 7 },
      { id: 'investor', name: 'Investisseur', description: '16 slides - Détaillé pour levée de fonds', slideCount: 16 }
    ],
    slideTemplates
  });
});

module.exports = router;
