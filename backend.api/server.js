// backend-api/server.js
// Load environment variables for local testing (Vercel handles them directly)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import the DB connection function

// --- Connect to MongoDB ---
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes'); // Will create later
// const globalRoutes = require('./routes/globalRoutes'); // Will create later

// --- Basic Route for testing API status ---
app.get('/', (req, res) => {
    res.send('Backend API is running on Vercel!');
});

// --- API Route Mounting ---
app.use('/api/auth', authRoutes); // e.g., /api/auth/register, /api/auth/login
// app.use('/api/users', userRoutes); // Mount User routes here later
// app.use('/api/global', globalRoutes); // Mount Global routes here later

// Export the Express app for Vercel's Serverless Functions
module.exports = app;
