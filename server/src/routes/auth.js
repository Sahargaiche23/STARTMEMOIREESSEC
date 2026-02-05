const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../database/init');
const { authMiddleware } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
router.post('/register', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, company } = req.body;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = db.prepare(`
      INSERT INTO users (email, password, firstName, lastName, phone, company)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(email, hashedPassword, firstName, lastName, phone || null, company || null);

    // Create default subscription
    db.prepare('INSERT INTO subscriptions (userId, plan) VALUES (?, ?)').run(result.lastInsertRowid, 'free');

    // Generate token
    const token = jwt.sign(
      { userId: result.lastInsertRowid, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        firstName,
        lastName,
        phone: phone || null,
        company: company || null,
        avatarUrl: null,
        subscription: 'free'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        company: user.company,
        avatarUrl: user.avatarUrl,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT u.id, u.email, u.firstName, u.lastName, u.phone, u.company, u.subscription, u.avatarUrl, u.role,
             s.plan, s.startDate, s.endDate, s.isActive
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.userId
      WHERE u.id = ?
    `).get(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { firstName, lastName, phone, company } = req.body;

    db.prepare(`
      UPDATE users SET firstName = ?, lastName = ?, phone = ?, company = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(firstName, lastName, phone, company, req.user.userId);

    const updatedUser = db.prepare('SELECT id, email, firstName, lastName, phone, company, avatarUrl, subscription FROM users WHERE id = ?')
      .get(req.user.userId);

    res.json({ message: 'Profil mis à jour avec succès', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Upload avatar
router.post('/avatar', authMiddleware, (req, res) => {
  try {
    const { avatarUrl } = req.body;
    
    db.prepare('UPDATE users SET avatarUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(avatarUrl, req.user.userId);

    res.json({ message: 'Avatar mis à jour', avatarUrl });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Change password
router.put('/password', authMiddleware, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, req.user.userId);

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Google OAuth Callback (Authorization Code Flow)
router.post('/google/callback', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      console.error('Token error:', tokens);
      return res.status(401).json({ message: 'Erreur d\'authentification Google' });
    }
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const googleUser = await userInfoResponse.json();
    const { id: googleId, email, given_name, family_name, picture } = googleUser;

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE googleId = ? OR email = ?').get(googleId, email);

    if (user) {
      if (!user.googleId) {
        db.prepare('UPDATE users SET googleId = ?, avatarUrl = ?, authProvider = ? WHERE id = ?')
          .run(googleId, picture, 'google', user.id);
      }
    } else {
      // Generate random password for Google users
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const result = db.prepare(`
        INSERT INTO users (email, password, firstName, lastName, googleId, avatarUrl, authProvider)
        VALUES (?, ?, ?, ?, ?, ?, 'google')
      `).run(email, hashedPassword, given_name || 'User', family_name || '', googleId, picture);
      
      db.prepare('INSERT INTO subscriptions (userId, plan) VALUES (?, ?)').run(result.lastInsertRowid, 'free');
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion Google réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        company: user.company,
        avatarUrl: user.avatarUrl || picture,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(401).json({ message: 'Authentification Google échouée' });
  }
});

// Google OAuth Login (ID Token Flow - legacy)
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture } = payload;

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE googleId = ? OR email = ?').get(googleId, email);

    if (user) {
      // Update Google info if needed
      if (!user.googleId) {
        db.prepare('UPDATE users SET googleId = ?, avatarUrl = ?, authProvider = ? WHERE id = ?')
          .run(googleId, picture, 'google', user.id);
      }
    } else {
      // Create new user
      const result = db.prepare(`
        INSERT INTO users (email, firstName, lastName, googleId, avatarUrl, authProvider)
        VALUES (?, ?, ?, ?, ?, 'google')
      `).run(email, given_name, family_name, googleId, picture);
      
      db.prepare('INSERT INTO subscriptions (userId, plan) VALUES (?, ?)').run(result.lastInsertRowid, 'free');
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion Google réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Authentification Google échouée' });
  }
});

// Save face descriptor for facial recognition
router.post('/face/register', authMiddleware, async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ message: 'Descripteur facial invalide' });
    }

    db.prepare('UPDATE users SET faceDescriptor = ? WHERE id = ?')
      .run(JSON.stringify(faceDescriptor), req.user.userId);

    res.json({ message: 'Reconnaissance faciale configurée avec succès' });
  } catch (error) {
    console.error('Face register error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Login with facial recognition
router.post('/face/login', async (req, res) => {
  try {
    const { faceDescriptor, email } = req.body;
    
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ message: 'Descripteur facial invalide' });
    }

    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !user.faceDescriptor) {
      return res.status(401).json({ message: 'Reconnaissance faciale non configurée pour cet utilisateur' });
    }

    const storedDescriptor = JSON.parse(user.faceDescriptor);
    
    // Calculate Euclidean distance between face descriptors
    const distance = Math.sqrt(
      faceDescriptor.reduce((sum, val, i) => sum + Math.pow(val - storedDescriptor[i], 2), 0)
    );

    // Threshold for face matching (lower = stricter)
    if (distance > 0.6) {
      return res.status(401).json({ message: 'Visage non reconnu' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion par reconnaissance faciale réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Face login error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Check if user has face registered
router.get('/face/status', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT faceDescriptor FROM users WHERE id = ?').get(req.user.userId);
    res.json({ hasFaceRegistered: !!user?.faceDescriptor });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Verify invitation token
router.get('/invite/:token', (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = db.prepare(`
      SELECT tm.*, p.name as projectName, p.id as projectId
      FROM team_members tm
      JOIN projects p ON tm.projectId = p.id
      WHERE tm.inviteToken = ? AND tm.status = 'pending'
    `).get(token);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation invalide ou expirée' });
    }
    
    res.json({
      email: invitation.email,
      projectName: invitation.projectName,
      role: invitation.role
    });
  } catch (error) {
    console.error('Verify invite error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Register via invitation
router.post('/invite/:token/register', [
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password, firstName, lastName } = req.body;
    
    // Find invitation
    const invitation = db.prepare(`
      SELECT tm.*, p.name as projectName
      FROM team_members tm
      JOIN projects p ON tm.projectId = p.id
      WHERE tm.inviteToken = ? AND tm.status = 'pending'
    `).get(token);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation invalide ou expirée' });
    }
    
    // Check if email already registered
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(invitation.email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé. Connectez-vous.' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = db.prepare(`
      INSERT INTO users (email, password, firstName, lastName)
      VALUES (?, ?, ?, ?)
    `).run(invitation.email, hashedPassword, firstName, lastName);
    
    const userId = result.lastInsertRowid;
    
    // Create subscription
    db.prepare('INSERT INTO subscriptions (userId, plan) VALUES (?, ?)').run(userId, 'free');
    
    // Update team member with userId and activate
    db.prepare(`
      UPDATE team_members SET userId = ?, status = 'active', inviteToken = NULL
      WHERE id = ?
    `).run(userId, invitation.id);
    
    // Generate token
    const jwtToken = jwt.sign(
      { userId, email: invitation.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Compte créé avec succès',
      token: jwtToken,
      user: {
        id: userId,
        email: invitation.email,
        firstName,
        lastName,
        subscription: 'free'
      },
      projectId: invitation.projectId
    });
  } catch (error) {
    console.error('Invite register error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
