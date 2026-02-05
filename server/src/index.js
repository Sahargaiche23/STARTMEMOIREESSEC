const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const ideaRoutes = require('./routes/ideas');
const businessModelRoutes = require('./routes/businessModel');
const brandingRoutes = require('./routes/branding');
const businessPlanRoutes = require('./routes/businessPlan');
const pitchDeckRoutes = require('./routes/pitchDeck');
const taskRoutes = require('./routes/tasks');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/business-model', businessModelRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/business-plan', businessPlanRoutes);
app.use('/api/pitch-deck', pitchDeckRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'StartUpLab API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 StartUpLab server running on port ${PORT}`);
});
