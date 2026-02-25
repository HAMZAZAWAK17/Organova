'use strict';
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { pool } = require('../config/db');

// ── GET PROFILE ────────────────────────────────────────────
async function getProfile(req, res, next) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, name, email, avatar_url, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) { next(err); }
}

// ── UPDATE PROFILE ─────────────────────────────────────────
async function updateProfile(req, res, next) {
    try {
        const { name, avatar_url } = req.body;
        await pool.execute(
            'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?',
            [name, avatar_url || null, req.user.id]
        );
        res.json({ message: 'Profile updated' });
    } catch (err) { next(err); }
}

// ── CHANGE PASSWORD ────────────────────────────────────────
async function changePassword(req, res, next) {
    try {
        const { current_password, new_password } = req.body;

        const [rows] = await pool.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const match = await bcrypt.compare(current_password, rows[0].password_hash);
        if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

        const hash = await bcrypt.hash(new_password, 12);
        await pool.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hash, req.user.id]
        );
        res.json({ message: 'Password changed successfully' });
    } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, changePassword };
