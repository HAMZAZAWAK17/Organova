'use strict';
const { pool } = require('../config/db');

async function listNotes(req, res, next) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

async function createNote(req, res, next) {
    try {
        const { title, content, type } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO notes (user_id, title, content, type) VALUES (?, ?, ?, ?)',
            [req.user.id, title, content || null, type || 'note']
        );
        res.status(201).json({ id: result.insertId, message: 'Note created' });
    } catch (err) {
        next(err);
    }
}

async function updateNote(req, res, next) {
    try {
        const { id } = req.params;
        const { title, content, type } = req.body;

        const [result] = await pool.execute(
            'UPDATE notes SET title = ?, content = ?, type = ? WHERE id = ? AND user_id = ?',
            [title, content || null, type || 'note', id, req.user.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Note not found' });
        res.json({ message: 'Note updated' });
    } catch (err) {
        next(err);
    }
}

async function deleteNote(req, res, next) {
    try {
        const [result] = await pool.execute(
            'DELETE FROM notes WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch (err) {
        next(err);
    }
}

module.exports = { listNotes, createNote, updateNote, deleteNote };
