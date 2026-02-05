const db = require('../database/init');

// Check if user has access to project (owner or team member)
const checkProjectAccess = (userId, projectId, requiredRoles = null) => {
  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId);
  
  // Check if owner
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?')
    .get(projectId, userId);
  
  if (project) {
    return { hasAccess: true, role: 'owner', project };
  }
  
  // Check if team member
  const teamMember = db.prepare(`
    SELECT tm.role FROM team_members tm
    WHERE tm.projectId = ? AND (tm.userId = ? OR tm.email = ?) AND tm.status = 'active'
  `).get(projectId, userId, user?.email);
  
  if (teamMember) {
    // Check if role is allowed
    if (requiredRoles && !requiredRoles.includes(teamMember.role)) {
      return { hasAccess: false, role: teamMember.role, reason: 'insufficient_permissions' };
    }
    
    const projectData = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    return { hasAccess: true, role: teamMember.role, project: projectData };
  }
  
  return { hasAccess: false, role: null, reason: 'not_found' };
};

// Middleware to check project access
const projectAccessMiddleware = (requiredRoles = null) => {
  return (req, res, next) => {
    const projectId = req.params.projectId || req.params.id;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID required' });
    }
    
    const access = checkProjectAccess(req.user.userId, projectId, requiredRoles);
    
    if (!access.hasAccess) {
      if (access.reason === 'insufficient_permissions') {
        return res.status(403).json({ message: 'Permissions insuffisantes' });
      }
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    req.projectAccess = access;
    req.project = access.project;
    next();
  };
};

module.exports = { checkProjectAccess, projectAccessMiddleware };
