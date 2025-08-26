// backend-api/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // `process.env.MONGO_URI` will be available in Vercel's environment
        // and also if you're testing locally with a .env file.
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options are recommended by Mongoose for new connections
            // and help prevent deprecation warnings.
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // If you face issues, you might temporarily remove these for
            // broader compatibility, but they are good practice.
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // In a Vercel serverless function, exiting the process isn't strictly
        // necessary for subsequent requests, but good for local dev.
        // For Vercel, this would likely log an error and then the function would terminate.
        process.exit(1);
    }
};

module.exports = connectDB;
