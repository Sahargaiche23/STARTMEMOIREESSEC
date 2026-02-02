const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all projects for user
router.get('/', authMiddleware, (req, res) => {
  try {
    const projects = db.prepare(`
      SELECT p.*, 
             (SELECT COUNT(*) FROM tasks WHERE projectId = p.id) as taskCount,
             (SELECT COUNT(*) FROM tasks WHERE projectId = p.id AND status = 'done') as completedTasks
      FROM projects p
      WHERE p.userId = ?
      ORDER BY p.updatedAt DESC
    `).all(req.user.userId);

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get single project
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const project = db.prepare(`
      SELECT * FROM projects WHERE id = ? AND userId = ?
    `).get(req.params.id, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Get related data
    const businessModel = db.prepare('SELECT * FROM business_models WHERE projectId = ?').get(project.id);
    const branding = db.prepare('SELECT * FROM branding WHERE projectId = ?').get(project.id);
    const businessPlan = db.prepare('SELECT * FROM business_plans WHERE projectId = ?').get(project.id);
    const pitchDeck = db.prepare('SELECT * FROM pitch_decks WHERE projectId = ?').get(project.id);
    const tasks = db.prepare('SELECT * FROM tasks WHERE projectId = ? ORDER BY createdAt DESC').all(project.id);
    const teamMembers = db.prepare('SELECT * FROM team_members WHERE projectId = ?').all(project.id);

    res.json({
      project,
      businessModel,
      branding,
      businessPlan,
      pitchDeck,
      tasks,
      teamMembers
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create project
router.post('/', authMiddleware, [
  body('name').notEmpty().withMessage('Le nom du projet est requis')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, industry, stage } = req.body;

    const result = db.prepare(`
      INSERT INTO projects (userId, name, description, industry, stage)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.userId, name, description || null, industry || null, stage || 'idea');

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Projet créé avec succès', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update project
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const { name, description, industry, stage, status } = req.body;

    db.prepare(`
      UPDATE projects 
      SET name = ?, description = ?, industry = ?, stage = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || project.name,
      description !== undefined ? description : project.description,
      industry || project.industry,
      stage || project.stage,
      status || project.status,
      req.params.id
    );

    const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json({ message: 'Projet mis à jour', project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete project
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get project stats
router.get('/:id/stats', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const taskStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM tasks WHERE projectId = ?
    `).get(req.params.id);

    const teamCount = db.prepare('SELECT COUNT(*) as count FROM team_members WHERE projectId = ?')
      .get(req.params.id);

    const hasBusinessModel = db.prepare('SELECT id FROM business_models WHERE projectId = ?').get(req.params.id);
    const hasBranding = db.prepare('SELECT id FROM branding WHERE projectId = ?').get(req.params.id);
    const hasBusinessPlan = db.prepare('SELECT id FROM business_plans WHERE projectId = ?').get(req.params.id);
    const hasPitchDeck = db.prepare('SELECT id FROM pitch_decks WHERE projectId = ?').get(req.params.id);

    res.json({
      tasks: taskStats,
      teamMembers: teamCount.count,
      completion: {
        businessModel: !!hasBusinessModel,
        branding: !!hasBranding,
        businessPlan: !!hasBusinessPlan,
        pitchDeck: !!hasPitchDeck
      }
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
