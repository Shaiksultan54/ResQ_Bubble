import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.routes.js';
import agencyRoutes from './routes/agency.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import messageRoutes from './routes/message.routes.js';
import alertRoutes from './routes/alert.routes.js';
import borrowRoutes from './routes/borrow.routes.js';
import userRoutes from './routes/user.routes.js';
import transferRoutes from './routes/transfer.routes.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: join(__dirname, '.env') });

// Log environment variables (excluding sensitive data)
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? 'MongoDB URI is set' : 'MongoDB URI is not set'
});

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4 // Use IPv4, skip trying IPv6
};

// Connect to MongoDB with detailed error handling
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rescueconnect', mongoOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Connection state:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', {
      name: err.name,
      message: err.message,
      code: err.code,
      reason: err.reason
    });
    console.error('Connection details:', {
      uri: process.env.MONGODB_URI ? 'URI is set' : 'URI is not set',
      options: mongoOptions
    });
    process.exit(1);
  });

// Monitor MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transfers', transferRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('RescueConnect API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});