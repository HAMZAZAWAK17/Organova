'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// ── Helpers ────────────────────────────────────────────────
function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
}

// ── REGISTER ───────────────────────────────────────────────
/**
 * POST /api/auth/register
 * Creates a new user account.
 * OWASP: password hashed with bcrypt (cost 12), parameterized INSERT.
 */
async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        // Check duplicate email (parameterized query – OWASP Rule 5)
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        const hash = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hash]
        );

        const token = signToken({ id: result.insertId, email, role: 'user' });
        res.status(201).json({ token, user: { id: result.insertId, name, email, role: 'user' } });
    } catch (err) {
        next(err);
    }
}

// ── LOGIN ──────────────────────────────────────────────────
/**
 * POST /api/auth/login
 * Authenticates user and returns JWT.
 * OWASP: timing-safe bcrypt compare, generic error message.
 */
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.execute(
            'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ?',
            [email]
        );

        // Generic message prevents user enumeration (OWASP A07)
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is disabled' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken({ id: user.id, email: user.email, role: user.role });
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        next(err);
    }
}

// ── GET ME ─────────────────────────────────────────────────
/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
async function getMe(req, res, next) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login, getMe };
