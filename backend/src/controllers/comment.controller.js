'use strict';
const { pool } = require('../config/db');

// ── LIST COMMENTS FOR A TASK ───────────────────────────────
async function listComments(req, res, next) {
    try {
        // Verify task belongs to user first
        const [task] = await pool.execute(
            'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
            [req.params.taskId, req.user.id]
        );
        if (task.length === 0) return res.status(404).json({ error: 'Task not found' });

        const [rows] = await pool.execute(
            `SELECT c.id, c.content, c.created_at, c.updated_at,
              u.id AS author_id, u.name AS author_name
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
            [req.params.taskId]
        );
        res.json(rows);
    } catch (err) { next(err); }
}

// ── ADD COMMENT ────────────────────────────────────────────
async function addComment(req, res, next) {
    try {
        const [task] = await pool.execute(
            'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
            [req.params.taskId, req.user.id]
        );
        if (task.length === 0) return res.status(404).json({ error: 'Task not found' });

        const [result] = await pool.execute(
            'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
            [req.params.taskId, req.user.id, req.body.content]
        );
        res.status(201).json({ id: result.insertId, message: 'Comment added' });
    } catch (err) { next(err); }
}

// ── DELETE COMMENT ─────────────────────────────────────────
async function deleteComment(req, res, next) {
    try {
        const [result] = await pool.execute(
            'DELETE FROM comments WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Comment not found' });
        res.json({ message: 'Comment deleted' });
    } catch (err) { next(err); }
}

module.exports = { listComments, addComment, deleteComment };
