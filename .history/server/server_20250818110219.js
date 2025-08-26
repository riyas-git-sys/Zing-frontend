const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rizchat'; // Fixed default URI

// Verify environment variables
console.log('Environment Variables:');
console.log(`PORT: ${PORT}`);
console.log(`MONGO_URI: ${MONGO_URI ? '***** (hidden for security)' : 'Not set'}`);
console.log(`CLIENT_URL: ${process.env.CLIENT_URL}`);

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log(`Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Try these test endpoints:`);
  console.log(`- http://localhost:${PORT}/api/test`);
  console.log(`- http://localhost:${PORT}/api/auth/register`);
});