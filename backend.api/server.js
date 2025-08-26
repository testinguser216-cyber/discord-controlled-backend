// backend-api/server.js
// Load environment variables for local testing (Vercel handles them directly)
// This 'if' block ensures dotenv is only loaded if not in a Vercel production environment.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import the DB connection function

// --- Connect to MongoDB ---
connectDB(); // Call the function to connect to the database

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic Route for testing API status
app.get('/', (req, res) => {
    // Note: The `console.log` from connectDB will appear in Vercel logs.
    res.send('Backend API is running on Vercel and attempting MongoDB connection!');
});

// Placeholder for future API routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/global', require('./routes/globalRoutes'));

// Export the Express app for Vercel's Serverless Functions
module.exports = app;
