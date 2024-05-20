// server.js
require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const urlRoutes = require('./routes/urlRoutes');
const rateLimit = require('express-rate-limit');
const { startCleanupScheduler } = require('./helpers/scheduler');

const app = express();
const port = process.env.PORT || 3000;  // Use the port from the .env file, or default to 3000

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 3, // limit each IP to 3 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
});

app.use(limiter);

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Handle preflight request
  }
  next();
});

// Use URL routes
app.use('/api', urlRoutes);
// Use redirect routes
app.use('/', urlRoutes);

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(timeZone);

startCleanupScheduler();

app.listen(port, () => {
  console.log(`Node.js server is running on http://localhost:${port}`);
});
