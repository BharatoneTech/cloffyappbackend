const mysql = require("mysql2/promise");
require("dotenv").config({ path: "./config/.env" });

let pool = null;

// Initialize the MySQL pool
async function initializeDatabase() {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            timezone: "+05:30"
        });

        await pool.getConnection().then(conn => conn.release());

        console.log("Successfully connected to MySQL database:", process.env.DB_NAME);
    } catch (err) {
        console.error("Failed to connect to the database:", err.message);
        throw err;
    }
}

// Return active pool
function getDb() {
    if (!pool) {
        throw new Error("DB not initialized! Call initializeDatabase() first.");
    }
    return pool;
}

module.exports = {
    initializeDatabase,
    getDb
};
