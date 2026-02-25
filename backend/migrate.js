'use strict';
require('dotenv').config();
const { pool } = require('./src/config/db');

async function migrate() {
    try {
        console.log('Running migrations...');

        // Add is_pinned to tasks
        await pool.execute(`
            ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_pinned TINYINT(1) NOT NULL DEFAULT 0
        `);
        console.log('[OK] tasks.is_pinned added/verified');

        // Create subtasks table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS subtasks (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                task_id INT UNSIGNED NOT NULL,
                title VARCHAR(255) NOT NULL,
                is_completed TINYINT(1) NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('[OK] subtasks table created/verified');

        // Create notes table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS notes (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                user_id INT UNSIGNED NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NULL,
                type ENUM('note', 'meeting', 'idea', 'journal') DEFAULT 'note',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('[OK] notes table created/verified');

        // Add avatar_url to users
        await pool.execute(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL AFTER name
        `);
        console.log('[OK] users.avatar_url added/verified');

        // Create events table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS events (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                user_id INT UNSIGNED NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NULL,
                start_date DATETIME NOT NULL,
                end_date DATETIME NULL,
                color VARCHAR(20) DEFAULT '#6C63FF',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('[OK] events table created/verified');

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
