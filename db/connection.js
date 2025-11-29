
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config/.env' }); 

let pool; 

async function initializeDatabase() { // Renamed back to initializeDatabase
    try {
        // Create a MySQL connection pool using environment variables
        pool = mysql.createPool({
            host: process.env.DB_HOST ,
            user: process.env.DB_USER ,
            password: process.env.DB_PASSWORD , // Use empty string if password is not set
            database: process.env.DB_NAME , // Ensure this matches your existing DB name
            waitForConnections: true, // Wait for connections to become available
            connectionLimit: 10,      // Max number of connections in the pool
            queueLimit: 0   ,
            timezone: '+05:30'          // No limit on queueing requests
        });

        await pool.getConnection().then(conn => conn.release());
        console.log('Successfully connected to MySQL database: ' + process.env.DB_NAME);

    } catch (error) {
        console.error('Failed to connect to the database:', error.message);
        throw error; // Re-throw the error so server.js can catch it and exit
    }
}

/**
 * Returns the initialized MySQL connection pool.
 * Throws an error if the pool has not been initialized yet.
 * @returns {mysql.Pool} The MySQL connection pool.
 */
function getDb() {
    if (!pool) {
        throw new Error('Database connection pool not initialized. Call initializeDatabase first.');
    }
    return pool;
}

module.exports = {
    initializeDatabase, // Export the renamed function
    getDb
};
