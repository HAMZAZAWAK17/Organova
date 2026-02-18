'use strict';
const mysql = require('mysql2/promise');

// ── Connection pool (OWASP Rule 5 – parameterized queries enforced via pool) ──
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'organova_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
});

/**
 * Test the DB connection on startup.
 */
async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('[DB] MySQL connected successfully');
        conn.release();
    } catch (err) {
        console.error('[DB] Connection failed:', err.message);
        process.exit(1);
    }
}

module.exports = { pool, testConnection };
