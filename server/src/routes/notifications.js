const express = require('express');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', authMiddleware, (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT 20
    `).all(req.user.userId);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE userId = ? AND isRead = 0
    `).get(req.user.userId).count;

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?')
      .run(req.params.id, req.user.userId);
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?')
      .run(req.user.userId);
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
