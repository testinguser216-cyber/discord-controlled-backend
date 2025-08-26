// backend-api/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// We will create a webhook service later for notifications
// const webhookService = require('../services/webhookService');

// --- Helper function to generate JWT token ---
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// @desc    Register a new user (Admin only for initial setup)
// @route   POST /api/auth/register
// @access  Public (will add admin middleware later)
const registerUser = async (req, res) => {
    const { username, password, userID_display, name, role } = req.body;

    // Basic validation
    if (!username || !password || !userID_display || !name) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ username }, { userID_display }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with that username or ID already exists' });
        }

        // Create new user
        const user = await User.create({
            username,
            password,
            userID_display,
            name,
            role: role || 'standard', // Default to standard if role not provided
        });

        // Generate token (though not needed for registration itself, useful if auto-logging in)
        const token = generateToken(user._id, user.role);

        // For a real system, you might not return the token here for registration,
        // but rather have them log in after. For our purposes, it's fine.
        res.status(201).json({
            _id: user._id,
            username: user.username,
            userID_display: user.userID_display,
            name: user.name,
            role: user.role,
            token,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { username, password, userID_display } = req.body;

    // Basic validation
    if (!username || !password || !userID_display) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Find user by username or userID_display
        const user = await User.findOne({
            $or: [
                { username: username.toLowerCase() }, // Ensure case-insensitive check
                { userID_display }
            ]
        });

        // Check for user existence and if account is locked
        if (!user) {
            // We don't want to give hints if username/ID doesn't exist.
            // Just say invalid credentials and log a failed attempt.
            // Log failed attempt (even if user not found, to deter probing)
            // await webhookService.logLoginAttempt({ username, userID_display, success: false, reason: 'User not found' });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.locked_until && user.locked_until > new Date()) {
            const timeLeft = Math.ceil((user.locked_until - new Date()) / (1000 * 60)); // minutes
            // await webhookService.logLoginAttempt({ username: user.username, userID_display: user.userID_display, success: false, reason: 'Account locked' });
            return res.status(403).json({ message: `Account locked. Try again in ${timeLeft} minutes.` });
        }

        // Compare password and user ID display
        const isPasswordMatch = await user.matchPassword(password);
        const isUserIDMatch = user.userID_display === userID_display; // Assuming userID_display is exact match

        if (isPasswordMatch && isUserIDMatch) {
            // Reset login attempts on successful login
            user.login_attempts = 0;
            user.locked_until = null; // Ensure unlocked
            await user.save();

            const token = generateToken(user._id, user.role);

            // Log successful login
            // await webhookService.logLoginAttempt({ username: user.username, userID_display: user.userID_display, success: true });
            // await webhookService.sendWebhook(webhookService.webhooks.correctInformation, { /* embed data */ });


            res.json({
                _id: user._id,
                username: user.username,
                userID_display: user.userID_display,
                name: user.name,
                role: user.role,
                settings: user.settings,
                stats: user.stats,
                click_count: user.click_count,
                token,
            });
        } else {
            // Increment login attempts for this user
            user.login_attempts += 1;
            let errorMessage = 'Invalid credentials';

            // If max attempts reached, lock account
            const MAX_LOGIN_ATTEMPTS = 5; // Define your max attempts
            if (user.login_attempts >= MAX_LOGIN_ATTEMPTS) {
                user.locked_until = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
                errorMessage = `Invalid credentials. Account locked for 10 minutes due to too many failed attempts. Attempts left: 0`;
                // await webhookService.sendWebhook(webhookService.webhooks.attemptExceededInformation, { /* embed data */ });
            } else {
                errorMessage = `Invalid credentials. Attempts left: ${MAX_LOGIN_ATTEMPTS - user.login_attempts}`;
                // await webhookService.sendWebhook(webhookService.webhooks.incorrectInformation, { /* embed data */ });
            }
            await user.save();

            // Log failed attempt
            // await webhookService.logLoginAttempt({ username: user.username, userID_display: user.userID_display, success: false, reason: 'Invalid credentials', attempts_left: MAX_LOGIN_ATTEMPTS - user.login_attempts });

            res.status(401).json({ message: errorMessage });
        }

    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Export the controller functions
module.exports = {
    registerUser,
    loginUser,
    generateToken // Helper, might not be exported in final design
};
