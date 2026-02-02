const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/business-plans');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Get business plan for a project
router.get('/project/:projectId', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const businessPlan = db.prepare('SELECT * FROM business_plans WHERE projectId = ?')
      .get(req.params.projectId);

    res.json({ businessPlan: businessPlan || null });
  } catch (error) {
    console.error('Get business plan error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Save business plan
router.post('/project/:projectId', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const {
      executiveSummary,
      companyDescription,
      marketAnalysis,
      organization,
      productLine,
      marketing,
      fundingRequest,
      financialProjections,
      appendix
    } = req.body;

    const existing = db.prepare('SELECT id FROM business_plans WHERE projectId = ?')
      .get(req.params.projectId);

    if (existing) {
      db.prepare(`
        UPDATE business_plans SET
          executiveSummary = ?, companyDescription = ?, marketAnalysis = ?,
          organization = ?, productLine = ?, marketing = ?,
          fundingRequest = ?, financialProjections = ?, appendix = ?,
          updatedAt = CURRENT_TIMESTAMP
        WHERE projectId = ?
      `).run(
        executiveSummary, companyDescription, marketAnalysis,
        organization, productLine, marketing,
        fundingRequest, financialProjections, appendix,
        req.params.projectId
      );
    } else {
      db.prepare(`
        INSERT INTO business_plans (
          projectId, executiveSummary, companyDescription, marketAnalysis,
          organization, productLine, marketing, fundingRequest,
          financialProjections, appendix
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.params.projectId,
        executiveSummary, companyDescription, marketAnalysis,
        organization, productLine, marketing,
        fundingRequest, financialProjections, appendix
      );
    }

    const businessPlan = db.prepare('SELECT * FROM business_plans WHERE projectId = ?')
      .get(req.params.projectId);

    res.json({ message: 'Business Plan sauvegardé', businessPlan });
  } catch (error) {
    console.error('Save business plan error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Generate PDF
router.post('/project/:projectId/pdf', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const businessPlan = db.prepare('SELECT * FROM business_plans WHERE projectId = ?')
      .get(req.params.projectId);

    if (!businessPlan) {
      return res.status(404).json({ message: 'Business Plan non trouvé' });
    }

    const branding = db.prepare('SELECT * FROM branding WHERE projectId = ?')
      .get(req.params.projectId);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `business-plan-${project.id}-${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);
    const writeStream = fs.createWriteStream(filepath);

    doc.pipe(writeStream);

    // Title page
    doc.fontSize(28).font('Helvetica-Bold')
       .text('BUSINESS PLAN', { align: 'center' });
    doc.moveDown();
    doc.fontSize(24).font('Helvetica')
       .text(branding?.companyName || project.name, { align: 'center' });
    doc.moveDown();
    if (branding?.slogan) {
      doc.fontSize(14).font('Helvetica-Oblique')
         .text(branding.slogan, { align: 'center' });
    }
    doc.moveDown(4);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

    // Table of contents
    doc.addPage();
    doc.fontSize(18).font('Helvetica-Bold').text('Table des matières');
    doc.moveDown();
    doc.fontSize(12).font('Helvetica');
    const sections = [
      '1. Résumé Exécutif',
      '2. Description de l\'entreprise',
      '3. Analyse de marché',
      '4. Organisation et gestion',
      '5. Produits et services',
      '6. Stratégie marketing',
      '7. Demande de financement',
      '8. Projections financières',
      '9. Annexes'
    ];
    sections.forEach(section => {
      doc.text(section);
      doc.moveDown(0.5);
    });

    // Sections
    const addSection = (title, content) => {
      if (content) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').text(title);
        doc.moveDown();
        doc.fontSize(11).font('Helvetica').text(content, { align: 'justify' });
      }
    };

    addSection('1. Résumé Exécutif', businessPlan.executiveSummary);
    addSection('2. Description de l\'entreprise', businessPlan.companyDescription);
    addSection('3. Analyse de marché', businessPlan.marketAnalysis);
    addSection('4. Organisation et gestion', businessPlan.organization);
    addSection('5. Produits et services', businessPlan.productLine);
    addSection('6. Stratégie marketing', businessPlan.marketing);
    addSection('7. Demande de financement', businessPlan.fundingRequest);
    addSection('8. Projections financières', businessPlan.financialProjections);
    addSection('9. Annexes', businessPlan.appendix);

    doc.end();

    writeStream.on('finish', () => {
      // Update database with PDF URL
      const pdfUrl = `/uploads/business-plans/${filename}`;
      db.prepare('UPDATE business_plans SET pdfUrl = ? WHERE projectId = ?')
        .run(pdfUrl, req.params.projectId);

      res.json({ 
        message: 'PDF généré avec succès', 
        pdfUrl,
        filename 
      });
    });

  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Download PDF
router.get('/download/:filename', authMiddleware, (req, res) => {
  try {
    const filepath = path.join(uploadsDir, req.params.filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    res.download(filepath);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get business plan template
router.get('/template', authMiddleware, (req, res) => {
  res.json({
    template: {
      executiveSummary: `Résumé de votre projet startup :
- Vision et mission de l'entreprise
- Problème résolu et solution proposée
- Marché cible et opportunité
- Modèle économique
- Équipe fondatrice
- Besoins de financement`,
      companyDescription: `Description de votre entreprise :
- Historique et contexte
- Structure juridique
- Localisation
- Vision à long terme`,
      marketAnalysis: `Analyse du marché :
- Taille du marché (TAM, SAM, SOM)
- Tendances du secteur
- Analyse de la concurrence
- Avantages concurrentiels`,
      organization: `Organisation et équipe :
- Structure organisationnelle
- Équipe de direction
- Conseillers et mentors
- Plan de recrutement`,
      productLine: `Produits et services :
- Description détaillée
- Cycle de développement
- Propriété intellectuelle
- Roadmap produit`,
      marketing: `Stratégie marketing :
- Positionnement
- Stratégie de prix
- Canaux de distribution
- Plan de communication`,
      fundingRequest: `Demande de financement :
- Montant recherché
- Utilisation des fonds
- Conditions proposées
- Stratégie de sortie`,
      financialProjections: `Projections financières :
- Prévisions de revenus (3-5 ans)
- Structure de coûts
- Seuil de rentabilité
- Besoins en trésorerie`
    }
  });
});

module.exports = router;
