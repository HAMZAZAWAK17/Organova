'use strict';
const { pool } = require('../config/db');

// ── LIST ───────────────────────────────────────────────────
async function listCategories(req, res, next) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, name, color, icon, created_at FROM categories WHERE user_id = ? ORDER BY name',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) { next(err); }
}

// ── CREATE ─────────────────────────────────────────────────
async function createCategory(req, res, next) {
    try {
        const { name, color, icon } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)',
            [req.user.id, name, color || '#6C63FF', icon || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Category created' });
    } catch (err) { next(err); }
}

// ── UPDATE ─────────────────────────────────────────────────
async function updateCategory(req, res, next) {
    try {
        const { name, color, icon } = req.body;
        const [result] = await pool.execute(
            'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?',
            [name, color || '#6C63FF', icon || null, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category updated' });
    } catch (err) { next(err); }
}

// ── DELETE ─────────────────────────────────────────────────
async function deleteCategory(req, res, next) {
    try {
        const [result] = await pool.execute(
            'DELETE FROM categories WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (err) { next(err); }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
