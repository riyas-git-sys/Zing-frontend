import express from 'express';
import authRoutes from './routes/auth.routes';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // This is crucial

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;