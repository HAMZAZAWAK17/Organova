'use strict';
const { pool } = require('../config/db');

async function listNotifications(req, res, next) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, type, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) { next(err); }
}

async function markAsRead(req, res, next) {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (err) { next(err); }
}

async function markAllAsRead(req, res, next) {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [req.user.id]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) { next(err); }
}

module.exports = { listNotifications, markAsRead, markAllAsRead };
