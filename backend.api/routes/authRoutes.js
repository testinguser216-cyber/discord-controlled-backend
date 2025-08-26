// backend-api/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
// We will create an admin middleware later
// const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Registration route (initially public for first admin, then protect with admin middleware)
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

module.exports = router;
