import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/message.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Test route
app.get('/api', (req, res) => {
  res.json({ 
    status: 'API is working',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

app.get('/api/db-status', (req, res) => {
  res.json({
    dbState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    dbHost: mongoose.connection.host
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

export default app;