// backend-api/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Removes whitespace from both ends of a string
        lowercase: true // Stores usernames in lowercase
    },
    password: { // Storing hashed password
        type: String,
        required: true
    },
    userID_display: { // Your original 'userID' input
        type: String,
        required: true,
        unique: true, // Assuming this is also a unique identifier
        trim: true
    },
    name: { // Display name for the dashboard
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'standard', 'guest', 'locked'], // Define roles
        default: 'standard'
    },
    settings: { // For user-specific dashboard settings (e.g., dark mode, auto-save)
        type: mongoose.Schema.Types.Mixed, // Stores as a flexible object
        default: {
            darkMode: true,
            autoSaveNotes: true,
            soundNotifications: false,
            autoRefreshData: true,
            compactView: false,
            showAnimations: true,
            highContrast: false,
            autoBackup: true,
            securityMode: true,
            advancedLogging: false,
            performanceMode: false,
            developerMode: false,
            experimentalFeatures: false,
            dataCompression: true,
            realtimeSync: false,
            accentTheme: 'orange', // Default accent theme
            // Keybinds will be more complex; may need a separate structure or simpler JSON
        }
    },
    stats: { // For user-specific usage statistics
        type: mongoose.Schema.Types.Mixed,
        default: {
            buttonPresses: 0,
            toggleSwitches: 0,
            panelsOpened: 0,
            panelsClosed: 0,
            searchQueries: 0,
            sessionTime: 0, // In seconds
        }
    },
    click_count: { // For the mouse clicker panel
        type: Number,
        default: 0
    },
    login_attempts: {
        type: Number,
        default: 0
    },
    locked_until: { // Timestamp when the account is locked until
        type: Date,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// --- Middleware to hash password before saving ---
userSchema.pre('save', async function(next) {
    // Only hash if the password has been modified (or is new)
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Method to compare entered password with hashed password ---
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
