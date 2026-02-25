'use strict';
const { pool } = require('../config/db');

// ── LIST EVENTS ─────────────────────────────────────────────
async function listEvents(req, res, next) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM events WHERE user_id = ? ORDER BY start_date ASC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) { next(err); }
}

// ── CREATE EVENT ───────────────────────────────────────────
async function createEvent(req, res, next) {
    try {
        const { title, description, start_date, end_date, color } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO events (user_id, title, description, start_date, end_date, color) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, title, description, start_date, end_date || null, color || '#6C63FF']
        );
        res.status(201).json({ id: result.insertId, message: 'Event created' });
    } catch (err) { next(err); }
}

// ── DELETE EVENT ───────────────────────────────────────────
async function deleteEvent(req, res, next) {
    try {
        await pool.execute(
            'DELETE FROM events WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Event deleted' });
    } catch (err) { next(err); }
}

module.exports = { listEvents, createEvent, deleteEvent };
