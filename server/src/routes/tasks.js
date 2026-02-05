const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');
const { checkProjectAccess } = require('../middleware/projectAccess');

const router = express.Router();

// Get all tasks for a project
router.get('/project/:projectId', authMiddleware, (req, res) => {
  try {
    const access = checkProjectAccess(req.user.userId, req.params.projectId);
    if (!access.hasAccess) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const tasks = db.prepare(`
      SELECT t.*, u.firstName, u.lastName, u.email as assigneeEmail
      FROM tasks t
      LEFT JOIN users u ON t.assignedTo = u.id
      WHERE t.projectId = ?
      ORDER BY 
        CASE t.priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        t.dueDate ASC
    `).all(req.params.projectId);

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get tasks by status (Kanban view)
router.get('/project/:projectId/kanban', authMiddleware, (req, res) => {
  try {
    const access = checkProjectAccess(req.user.userId, req.params.projectId);
    if (!access.hasAccess) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const todo = db.prepare(`
      SELECT t.*, u.firstName, u.lastName 
      FROM tasks t LEFT JOIN users u ON t.assignedTo = u.id
      WHERE t.projectId = ? AND t.status = 'todo'
      ORDER BY t.priority DESC, t.dueDate ASC
    `).all(req.params.projectId);

    const inProgress = db.prepare(`
      SELECT t.*, u.firstName, u.lastName 
      FROM tasks t LEFT JOIN users u ON t.assignedTo = u.id
      WHERE t.projectId = ? AND t.status = 'in_progress'
      ORDER BY t.priority DESC, t.dueDate ASC
    `).all(req.params.projectId);

    const done = db.prepare(`
      SELECT t.*, u.firstName, u.lastName 
      FROM tasks t LEFT JOIN users u ON t.assignedTo = u.id
      WHERE t.projectId = ? AND t.status = 'done'
      ORDER BY t.updatedAt DESC
    `).all(req.params.projectId);

    res.json({
      columns: {
        todo: { title: 'À faire', tasks: todo },
        in_progress: { title: 'En cours', tasks: inProgress },
        done: { title: 'Terminé', tasks: done }
      }
    });
  } catch (error) {
    console.error('Get kanban error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Create task
router.post('/project/:projectId', authMiddleware, [
  body('title').notEmpty().withMessage('Le titre est requis')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const access = checkProjectAccess(req.user.userId, req.params.projectId, ['owner', 'admin', 'member']);
    if (!access.hasAccess) {
      return res.status(404).json({ message: 'Projet non trouvé ou accès refusé' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const result = db.prepare(`
      INSERT INTO tasks (projectId, title, description, status, priority, dueDate, assignedTo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.projectId,
      title,
      description || null,
      status || 'todo',
      priority || 'medium',
      dueDate || null,
      assignedTo || null
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Tâche créée', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update task
router.put('/:id', authMiddleware, (req, res) => {
  try {
    // Get task first
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    
    const access = checkProjectAccess(req.user.userId, task.projectId, ['owner', 'admin', 'member']);
    if (!access.hasAccess) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    db.prepare(`
      UPDATE tasks SET
        title = ?, description = ?, status = ?, priority = ?,
        dueDate = ?, assignedTo = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || task.title,
      description !== undefined ? description : task.description,
      status || task.status,
      priority || task.priority,
      dueDate !== undefined ? dueDate : task.dueDate,
      assignedTo !== undefined ? assignedTo : task.assignedTo,
      req.params.id
    );

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json({ message: 'Tâche mise à jour', task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update task status (quick update)
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    
    const access = checkProjectAccess(req.user.userId, task.projectId, ['owner', 'admin', 'member']);
    if (!access.hasAccess) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { status } = req.body;
    const validStatuses = ['todo', 'in_progress', 'done'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    db.prepare('UPDATE tasks SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.params.id);

    res.json({ message: 'Statut mis à jour', status });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete task (owner/admin/member can delete tasks)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    
    const access = checkProjectAccess(req.user.userId, task.projectId, ['owner', 'admin', 'member']);
    if (!access.hasAccess) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Team members management
router.get('/project/:projectId/team', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const members = db.prepare(`
      SELECT tm.*, u.firstName, u.lastName
      FROM team_members tm
      LEFT JOIN users u ON tm.userId = u.id
      WHERE tm.projectId = ?
    `).all(req.params.projectId);

    res.json({ members });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Add team member
router.post('/project/:projectId/team', authMiddleware, [
  body('email').isEmail().withMessage('Email invalide')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const { email, role } = req.body;

    // Check if already member
    const existing = db.prepare('SELECT id FROM team_members WHERE projectId = ? AND email = ?')
      .get(req.params.projectId, email);

    if (existing) {
      return res.status(400).json({ message: 'Ce membre existe déjà' });
    }

    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    const result = db.prepare(`
      INSERT INTO team_members (projectId, userId, email, role)
      VALUES (?, ?, ?, ?)
    `).run(req.params.projectId, user?.id || null, email, role || 'member');

    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Membre ajouté', member });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Remove team member
router.delete('/project/:projectId/team/:memberId', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(req.params.projectId, req.user.userId);

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    db.prepare('DELETE FROM team_members WHERE id = ? AND projectId = ?')
      .run(req.params.memberId, req.params.projectId);

    res.json({ message: 'Membre supprimé' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
