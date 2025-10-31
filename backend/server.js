/**
 * Noor Islamic App - Backend Server
 * 
 * Main entry point for the Node.js/Express server
 * Handles authentication, adhkar, duas, prayer times, and other Islamic features
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const zikrRoutes = require('./routes/zikrRoutes');
const duaRoutes = require('./routes/duaRoutes');
const prayerRoutes = require('./routes/prayerRoutes');
const qiblaRoutes = require('./routes/qiblaRoutes');
const reminderRoutes = require('./routes/reminderRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['exp://localhost:19000', 'exp://192.168.*:19000', 'http://localhost:19006'], // Expo development URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Noor API is running successfully',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/zikr', zikrRoutes);
app.use('/api/v1/dua', duaRoutes);
app.use('/api/v1/prayer', prayerRoutes);
app.use('/api/v1/qibla', qiblaRoutes);
app.use('/api/v1/reminder', reminderRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Noor Islamic App API',
    version: '1.0.0',
    endpoints: [
      '/api/v1/auth',
      '/api/v1/zikr',
      '/api/v1/dua',
      '/api/v1/prayer',
      '/api/v1/qibla',
      '/api/v1/reminder'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🕌 Noor API Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;




