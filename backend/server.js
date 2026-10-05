const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection (Serverless Pattern)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/campfix';
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
};

// Middleware to ensure DB connection before handling routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Diagnostic route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongoUriExists: !!process.env.MONGO_URI,
    dbConnected: isConnected 
  });
});


// Routes
app.get('/', (req, res) => {
  res.send('CampFIX API is running...');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
