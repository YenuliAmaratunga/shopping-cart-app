import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ DB connection error:', err.message);
    if (err.message.includes('Authentication failed')) {
      console.error('Hint: MongoDB username/password is incorrect.');
    }
    if (err.message.includes('IP') || err.message.includes('not allowed')) {
      console.error('Hint: Add your current IP in Atlas Network Access.');
    }
    process.exit(1);
  });

// Routes
import productRoutes from './routes/products.js';
app.use('/api/products', productRoutes);

import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

// Basic route to test
app.get('/', (req, res) => {
  res.send('FreshCart Backend Service is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
