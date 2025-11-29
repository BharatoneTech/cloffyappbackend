// server.js
const app = require('./app'); // Import the configured Express app
const { initializeDatabase } = require('./db/connection'); // Import database initialization function
require('dotenv').config({ path: './config/.env' }); // Load environment variables from config/.env

const PORT = process.env.PORT || 5000; // Get port from .env or default to 5000

// Initialize database and then start the server
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Node.js Backend Server is running on port ${PORT}`);
            console.log(`Access API at http://localhost:${PORT}`);
            console.log('Ensure your MySQL server is running and database "cloffy_app" exists.');
            // Removed the admin user creation message as that logic is now removed from db/connection.js
        });
    })
    .catch(err => {
        console.error('Failed to initialize database and start server:', err);
        process.exit(1); // Exit the process if database connection fails
    });