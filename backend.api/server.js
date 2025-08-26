// backend-api/server.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic Route for testing API status
app.get('/', (req, res) => {
    res.send('Backend API is running on Vercel!');
});

// Export the Express app for Vercel's Serverless Functions
module.exports = app;
