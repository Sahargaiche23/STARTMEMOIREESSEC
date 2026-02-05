const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all projects for user (owned + team member)
router.get('/', authMiddleware, (req, res) => {
  try {
    // Get user email for team member check
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.userId);
    
    // Get owned projects
    const ownedProjects = db.prepare(`
      SELECT p.*, 
             (SELECT COUNT(*) FROM tasks WHERE projectId = p.id) as taskCount,
             (SELECT COUNT(*) FROM tasks WHERE projectId = p.id AND status = 'done') as completedTasks,
             'owner' as role
      FROM projects p
      WHERE p.userId = ?
      ORDER BY p.updatedAt DESC
    `).all(req.user.userId);

    // Get projects where user is a team member
    const teamProjects = db.prepare(`
      SELECT p.*, 
             (SELECT COUNT(*) FROM tasks WHERE projectId = p.id) as taskCount,
             (SELECT COUNT(*) FROM tasks WHERE projectId = p.id AND status = 'done') as completedTasks,
             tm.role as role,
             u.firstName as ownerFirstName, u.lastName as ownerLastName
      FROM projects p
      JOIN team_members tm ON p.id = tm.projectId
      JOIN users u ON p.userId = u.id
      WHERE (tm.userId = ? OR tm.email = ?) AND tm.status = 'active'
      ORDER BY p.updatedAt DESC
    `).all(req.user.userId, user?.email);

    // Combine and remove duplicates
    const allProjects = [...ownedProjects, ...teamProjects.filter(tp => 
      !ownedProjects.some(op => op.id === tp.id)
    )];

    res.json({ projects: allProjects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get single project
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.userId);
    console.log('GET project - userId:', req.user.userId, 'email:', user?.email, 'projectId:', req.params.id);
    
    // Check if user owns the project
    let project = db.prepare(`
      SELECT *, 'owner' as userRole FROM projects WHERE id = ? AND userId = ?
    `).get(req.params.id, req.user.userId);
    console.log('Owner check result:', project ? 'found' : 'not found');

    // If not owner, check if user is a team member
    if (!project) {
      const teamMember = db.prepare(`
        SELECT tm.role FROM team_members tm
        WHERE tm.projectId = ? AND (tm.userId = ? OR tm.email = ?) AND tm.status = 'active'
      `).get(req.params.id, req.user.userId, user?.email);
      console.log('Team member check result:', teamMember);
      
      if (teamMember) {
        project = db.prepare(`SELECT *, ? as userRole FROM projects WHERE id = ?`)
          .get(teamMember.role, req.params.id);
        console.log('Project loaded for team member:', project ? 'found' : 'not found');
      }
    }

    if (!project) {
      console.log('Project not found - returning 404');
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

// Plan limits
const PLAN_LIMITS = {
  free: { projects: 1, ideas: 10 },
  starter: { projects: 5, ideas: 50 },
  pro: { projects: -1, ideas: -1 },
  enterprise: { projects: -1, ideas: -1 }
};

// Create project
router.post('/', authMiddleware, [
  body('name').notEmpty().withMessage('Le nom du projet est requis')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check subscription limits
    const user = db.prepare('SELECT subscription FROM users WHERE id = ?').get(req.user.userId);
    const userPlan = user?.subscription || 'free';
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
    
    if (limits.projects !== -1) {
      const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects WHERE userId = ?').get(req.user.userId);
      if (projectCount.count >= limits.projects) {
        return res.status(403).json({ 
          message: `Limite de projets atteinte (${limits.projects}). Passez à un plan supérieur.`,
          code: 'PROJECT_LIMIT_REACHED'
        });
      }
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
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.userId);
    
    // Check if owner
    let project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.id, req.user.userId);

    // Check if team member
    if (!project) {
      const teamMember = db.prepare(`
        SELECT tm.role FROM team_members tm
        WHERE tm.projectId = ? AND (tm.userId = ? OR tm.email = ?) AND tm.status = 'active'
      `).get(req.params.id, req.user.userId, user?.email);
      
      if (teamMember) {
        project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
      }
    }

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
