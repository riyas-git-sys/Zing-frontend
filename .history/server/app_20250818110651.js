const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL // http://localhost:5173
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debugging middleware - log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Chat API Server');
});

app.get('/api/test', (req, res) => {
  res.send('API is working');
});

// Add these lines to mount your routes
const authRoutes = require('./routes/auth.routes');
const messageRoutes = require('./routes/message.routes');
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found',
    requestedUrl: req.originalUrl
  });
});

module.exports = app;