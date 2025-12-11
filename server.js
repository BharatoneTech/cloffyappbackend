// server.js
const app = require('./app');
const { initializeDatabase } = require('./db/connection');
require('dotenv').config({ path: './config/.env' });

const PORT = process.env.PORT || 5000;

initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Node.js Backend Server is running on port ${PORT}`);
            console.log(`Access API at http://localhost:${PORT}`);
            console.log('Ensure your MySQL server is running and database "cloffy_app" exists.');
        });
    })
    .catch(err => {
        console.error('Failed to initialize database and start server:', err);
        process.exit(1);
    });
