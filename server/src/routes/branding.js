const express = require('express');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');
const { checkProjectAccess } = require('../middleware/projectAccess');

const router = express.Router();

// Name generators
const nameGenerators = {
  tech: ['Tech', 'App', 'Cloud', 'Smart', 'Digital', 'Cyber', 'Data', 'Net', 'Soft', 'AI'],
  suffix: ['Lab', 'Hub', 'Plus', 'Pro', 'Go', 'Now', 'Up', 'Box', 'ify', 'ly', 'io'],
  prefix: ['i', 'e', 'my', 'get', 'we', 'the', 'all', 'one', 'easy', 'super']
};

const sloganTemplates = [
  'Innovez avec {name}',
  '{name} - Votre succès, notre mission',
  'Simplifiez votre vie avec {name}',
  '{name} - L\'innovation à portée de main',
  'Transformez vos idées avec {name}',
  '{name} - Le futur commence ici',
  'Créez l\'extraordinaire avec {name}',
  '{name} - Plus simple, plus efficace',
  'Votre partenaire digital - {name}',
  '{name} - Excellence et innovation'
];

const colorPalettes = [
  { name: 'Moderne', primary: '#6366F1', secondary: '#EC4899', accent: '#14B8A6' },
  { name: 'Professionnel', primary: '#1E40AF', secondary: '#64748B', accent: '#F59E0B' },
  { name: 'Énergique', primary: '#DC2626', secondary: '#F97316', accent: '#FBBF24' },
  { name: 'Nature', primary: '#059669', secondary: '#84CC16', accent: '#22D3EE' },
  { name: 'Élégant', primary: '#7C3AED', secondary: '#DB2777', accent: '#F472B6' },
  { name: 'Minimaliste', primary: '#18181B', secondary: '#71717A', accent: '#3B82F6' }
];

// Generate company names
router.post('/generate-names', authMiddleware, (req, res) => {
  try {
    const { industry, keywords, style } = req.body;
    const generatedNames = [];

    // Generate various name combinations
    for (let i = 0; i < 10; i++) {
      const prefix = nameGenerators.prefix[Math.floor(Math.random() * nameGenerators.prefix.length)];
      const tech = nameGenerators.tech[Math.floor(Math.random() * nameGenerators.tech.length)];
      const suffix = nameGenerators.suffix[Math.floor(Math.random() * nameGenerators.suffix.length)];

      const styles = [
        `${prefix}${tech}`,
        `${tech}${suffix}`,
        `${prefix.charAt(0).toUpperCase() + prefix.slice(1)}${suffix}`,
        `${tech}${suffix.toLowerCase()}`,
        `${prefix}${tech}${suffix}`
      ];

      generatedNames.push(styles[Math.floor(Math.random() * styles.length)]);
    }

    // Add keyword-based names if provided
    if (keywords) {
      const keywordList = keywords.split(',').map(k => k.trim());
      keywordList.forEach(keyword => {
        const suffix = nameGenerators.suffix[Math.floor(Math.random() * nameGenerators.suffix.length)];
        generatedNames.push(`${keyword.charAt(0).toUpperCase() + keyword.slice(1)}${suffix}`);
      });
    }

    // Remove duplicates
    const uniqueNames = [...new Set(generatedNames)];

    res.json({ names: uniqueNames.slice(0, 15) });
  } catch (error) {
    console.error('Generate names error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Generate slogans
router.post('/generate-slogans', authMiddleware, (req, res) => {
  try {
    const { companyName, industry, values } = req.body;
    
    const slogans = sloganTemplates.map(template => 
      template.replace('{name}', companyName || 'Votre Startup')
    );

    // Add custom slogans based on values
    if (values) {
      const valueList = values.split(',').map(v => v.trim());
      valueList.forEach(value => {
        slogans.push(`${companyName || 'Nous'} - ${value.charAt(0).toUpperCase() + value.slice(1)} avant tout`);
      });
    }

    res.json({ slogans: slogans.slice(0, 12) });
  } catch (error) {
    console.error('Generate slogans error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Generate logo suggestions (returns design parameters, not actual images)
router.post('/generate-logo', authMiddleware, (req, res) => {
  try {
    const { companyName, industry, style } = req.body;

    const logoSuggestions = [
      {
        type: 'Monogramme',
        logoType: 'monogram',
        description: `Les initiales "${companyName?.substring(0, 2).toUpperCase() || 'AB'}" stylisées`,
        style: 'Moderne et minimaliste',
        colors: { primary: '#6366F1', secondary: '#EC4899', accent: '#14B8A6' }
      },
      {
        type: 'Icône abstraite',
        logoType: 'abstract',
        description: 'Cercles concentriques représentant l\'innovation',
        style: 'Tech et professionnel',
        colors: { primary: '#1E40AF', secondary: '#3B82F6', accent: '#F59E0B' }
      },
      {
        type: 'Géométrique',
        logoType: 'geometric',
        description: 'Forme carrée rotative dynamique',
        style: 'Bold et impactant',
        colors: { primary: '#7C3AED', secondary: '#A855F7', accent: '#F472B6' }
      },
      {
        type: 'Dégradé',
        logoType: 'gradient',
        description: 'Logo avec effet dégradé moderne',
        style: 'Tendance et vibrant',
        colors: { primary: '#F97316', secondary: '#EC4899', accent: '#FBBF24' }
      },
      {
        type: 'Contour',
        logoType: 'outline',
        description: 'Style ligne fine et épuré',
        style: 'Minimaliste et élégant',
        colors: { primary: '#18181B', secondary: '#71717A', accent: '#3B82F6' }
      },
      {
        type: 'Cercle',
        logoType: 'circle',
        description: 'Logo circulaire harmonieux',
        style: 'Équilibré et accessible',
        colors: { primary: '#059669', secondary: '#84CC16', accent: '#22D3EE' }
      },
      {
        type: 'Hexagone',
        logoType: 'hexagon',
        description: 'Forme hexagonale tech',
        style: 'Moderne et structuré',
        colors: { primary: '#0891B2', secondary: '#06B6D4', accent: '#14B8A6' }
      },
      {
        type: 'Bouclier',
        logoType: 'shield',
        description: 'Emblème de confiance',
        style: 'Sécurité et fiabilité',
        colors: { primary: '#1E3A8A', secondary: '#3B82F6', accent: '#F59E0B' }
      },
      {
        type: 'Vague',
        logoType: 'wave',
        description: 'Design fluide et dynamique',
        style: 'Créatif et énergique',
        colors: { primary: '#8B5CF6', secondary: '#C084FC', accent: '#F472B6' }
      },
      {
        type: 'Minimal',
        logoType: 'minimal',
        description: 'Ultra minimaliste avec accent',
        style: 'Sophistiqué et moderne',
        colors: { primary: '#374151', secondary: '#F43F5E', accent: '#F43F5E' }
      }
    ];

    res.json({ logoSuggestions, colorPalettes });
  } catch (error) {
    console.error('Generate logo error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get branding for a project
router.get('/project/:projectId', authMiddleware, (req, res) => {
  try {
    const access = checkProjectAccess(req.user.userId, req.params.projectId);
    if (!access.hasAccess) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const branding = db.prepare('SELECT * FROM branding WHERE projectId = ?')
      .get(req.params.projectId);

    res.json({ branding: branding || null });
  } catch (error) {
    console.error('Get branding error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Save branding for a project
router.post('/project/:projectId', authMiddleware, (req, res) => {
  try {
    const access = checkProjectAccess(req.user.userId, req.params.projectId, ['owner', 'admin', 'member']);
    if (!access.hasAccess) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const { companyName, slogan, logoUrl, primaryColor, secondaryColor, fontFamily, brandVoice } = req.body;

    const existing = db.prepare('SELECT id FROM branding WHERE projectId = ?')
      .get(req.params.projectId);

    if (existing) {
      db.prepare(`
        UPDATE branding SET
          companyName = ?, slogan = ?, logoUrl = ?,
          primaryColor = ?, secondaryColor = ?, fontFamily = ?,
          brandVoice = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE projectId = ?
      `).run(
        companyName, slogan, logoUrl,
        primaryColor, secondaryColor, fontFamily,
        brandVoice, req.params.projectId
      );
    } else {
      db.prepare(`
        INSERT INTO branding (projectId, companyName, slogan, logoUrl, primaryColor, secondaryColor, fontFamily, brandVoice)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.params.projectId,
        companyName, slogan, logoUrl,
        primaryColor, secondaryColor, fontFamily, brandVoice
      );
    }

    const branding = db.prepare('SELECT * FROM branding WHERE projectId = ?')
      .get(req.params.projectId);

    res.json({ message: 'Branding sauvegardé', branding });
  } catch (error) {
    console.error('Save branding error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get color palettes
router.get('/colors', authMiddleware, (req, res) => {
  res.json({ colorPalettes });
});

module.exports = router;
