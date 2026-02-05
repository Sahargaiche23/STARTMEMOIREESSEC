const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');
const { sendInvitationEmail } = require('../utils/email');
const { checkProjectAccess } = require('../middleware/projectAccess');

const router = express.Router();

// Get team members for a project
router.get('/:projectId', authMiddleware, (req, res) => {
  try {
    const { projectId } = req.params;
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.userId);
    
    // Check if owner
    let project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
      .get(projectId, req.user.userId);
    
    // Check if team member
    if (!project) {
      const teamMember = db.prepare(`
        SELECT tm.role FROM team_members tm
        WHERE tm.projectId = ? AND (tm.userId = ? OR tm.email = ?) AND tm.status = 'active'
      `).get(projectId, req.user.userId, user?.email);
      
      if (teamMember) {
        project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
      }
    }
    
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const members = db.prepare(`
      SELECT tm.*, u.firstName, u.lastName, u.avatarUrl
      FROM team_members tm
      LEFT JOIN users u ON tm.userId = u.id
      WHERE tm.projectId = ?
      ORDER BY tm.createdAt DESC
    `).all(projectId);

    res.json({ members });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Add team member by email (only owner/admin can add members)
router.post('/:projectId', authMiddleware, [
  body('email').isEmail().withMessage('Email invalide'),
  body('role').optional().isIn(['admin', 'member', 'viewer']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { email, role = 'member' } = req.body;

    // Only owner and admin can add members
    const access = checkProjectAccess(req.user.userId, projectId, ['owner', 'admin']);
    if (!access.hasAccess) {
      return res.status(403).json({ message: 'Seul le propriétaire ou un admin peut ajouter des membres' });
    }
    const project = access.project;

    // Get inviter info
    const inviter = db.prepare('SELECT firstName, lastName, email FROM users WHERE id = ?')
      .get(req.user.userId);
    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : 'Un utilisateur';

    // Check if member already exists
    const existingMember = db.prepare('SELECT * FROM team_members WHERE projectId = ? AND email = ?')
      .get(projectId, email);
    
    if (existingMember) {
      return res.status(400).json({ message: 'Ce membre existe déjà dans le projet' });
    }

    // Check if user exists
    const user = db.prepare('SELECT id, firstName, lastName FROM users WHERE email = ?').get(email);

    // Generate invite token for new users
    const inviteToken = !user ? crypto.randomBytes(32).toString('hex') : null;

    // Add team member
    const result = db.prepare(`
      INSERT INTO team_members (projectId, userId, email, role, status, inviteToken)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(projectId, user?.id || null, email, role, user ? 'active' : 'pending', inviteToken);

    // Create notification for invited user if they exist
    if (user) {
      db.prepare(`
        INSERT INTO notifications (userId, type, title, message)
        VALUES (?, 'team_invite', 'Invitation à un projet', ?)
      `).run(user.id, `Vous avez été invité au projet "${project.name}"`);
    }

    // Send invitation email with token link for new users
    const emailResult = await sendInvitationEmail(email, project.name, inviterName, role, inviteToken);
    
    const newMember = db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ 
      message: user ? 'Membre ajouté avec succès' : 'Invitation envoyée par email',
      emailSent: emailResult.success,
      member: { ...newMember, firstName: user?.firstName, lastName: user?.lastName }
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update team member role
router.put('/:projectId/:memberId', authMiddleware, [
  body('role').isIn(['admin', 'member', 'viewer']).withMessage('Rôle invalide')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, memberId } = req.params;
    const { role } = req.body;

    // Only owner can modify roles
    const access = checkProjectAccess(req.user.userId, projectId, ['owner']);
    if (!access.hasAccess) {
      return res.status(403).json({ message: 'Seul le propriétaire peut modifier les rôles' });
    }

    db.prepare('UPDATE team_members SET role = ? WHERE id = ? AND projectId = ?')
      .run(role, memberId, projectId);

    res.json({ message: 'Rôle mis à jour' });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Remove team member (only owner can remove)
router.delete('/:projectId/:memberId', authMiddleware, (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    // Only owner can remove members
    const access = checkProjectAccess(req.user.userId, projectId, ['owner']);
    if (!access.hasAccess) {
      return res.status(403).json({ message: 'Seul le propriétaire peut supprimer des membres' });
    }

    db.prepare('DELETE FROM team_members WHERE id = ? AND projectId = ?')
      .run(memberId, projectId);

    res.json({ message: 'Membre supprimé' });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get projects where user is a team member (for access)
router.get('/my/invitations', authMiddleware, (req, res) => {
  try {
    const members = db.prepare(`
      SELECT tm.*, p.name as projectName, p.description as projectDescription,
             u.firstName as ownerFirstName, u.lastName as ownerLastName
      FROM team_members tm
      JOIN projects p ON tm.projectId = p.id
      JOIN users u ON p.userId = u.id
      WHERE tm.email = (SELECT email FROM users WHERE id = ?)
      ORDER BY tm.createdAt DESC
    `).all(req.user.userId);

    res.json({ invitations: members });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Accept/Reject invitation
router.put('/invitation/:memberId', authMiddleware, [
  body('action').isIn(['accept', 'reject']).withMessage('Action invalide')
], (req, res) => {
  try {
    const { memberId } = req.params;
    const { action } = req.body;

    const member = db.prepare(`
      SELECT tm.* FROM team_members tm
      WHERE tm.id = ? AND tm.email = (SELECT email FROM users WHERE id = ?)
    `).get(memberId, req.user.userId);

    if (!member) {
      return res.status(404).json({ message: 'Invitation non trouvée' });
    }

    if (action === 'accept') {
      db.prepare('UPDATE team_members SET status = ?, userId = ? WHERE id = ?')
        .run('active', req.user.userId, memberId);
      res.json({ message: 'Invitation acceptée' });
    } else {
      db.prepare('DELETE FROM team_members WHERE id = ?').run(memberId);
      res.json({ message: 'Invitation refusée' });
    }
  } catch (error) {
    console.error('Handle invitation error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
