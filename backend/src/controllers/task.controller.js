'use strict';
const { pool } = require('../config/db');

// ── LIST TASKS ─────────────────────────────────────────────
/**
 * GET /api/tasks
 * Returns paginated tasks for the authenticated user.
 * Supports filters: status, priority.
 * OWASP Rule 5: all values injected via parameterized placeholders.
 */
async function listTasks(req, res, next) {
    try {
        const userId = req.user.id;
        const { status, priority, page = 1, limit = 20 } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        const params = [userId];
        let where = 'WHERE t.user_id = ?';

        if (status) { where += ' AND t.status = ?'; params.push(status); }
        if (priority) { where += ' AND t.priority = ?'; params.push(priority); }

        params.push(Number(limit), offset);

        const [tasks] = await pool.execute(
            `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
              t.created_at, t.updated_at,
              c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON c.id = t.category_id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
            params
        );

        const [[{ total }]] = await pool.execute(
            `SELECT COUNT(*) AS total FROM tasks t ${where.replace('LIMIT ? OFFSET ?', '')}`,
            params.slice(0, -2)
        );

        res.json({ data: tasks, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        next(err);
    }
}

// ── GET TASK ───────────────────────────────────────────────
/**
 * GET /api/tasks/:id
 * Returns a single task (must belong to the authenticated user).
 */
async function getTask(req, res, next) {
    try {
        const [rows] = await pool.execute(
            `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.id = ? AND t.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
}

// ── CREATE TASK ────────────────────────────────────────────
/**
 * POST /api/tasks
 */
async function createTask(req, res, next) {
    try {
        const { title, description, status, priority, due_date, category_id } = req.body;
        const [result] = await pool.execute(
            `INSERT INTO tasks (user_id, category_id, title, description, status, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, category_id || null, title, description || null,
            status || 'todo', priority || 'medium', due_date || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Task created' });
    } catch (err) {
        next(err);
    }
}

// ── UPDATE TASK ────────────────────────────────────────────
/**
 * PUT /api/tasks/:id
 */
async function updateTask(req, res, next) {
    try {
        const { title, description, status, priority, due_date, category_id } = req.body;
        const [result] = await pool.execute(
            `UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, category_id = ?
       WHERE id = ? AND user_id = ?`,
            [title, description || null, status, priority, due_date || null,
                category_id || null, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task updated' });
    } catch (err) {
        next(err);
    }
}

// ── DELETE TASK ────────────────────────────────────────────
/**
 * DELETE /api/tasks/:id
 */
async function deleteTask(req, res, next) {
    try {
        const [result] = await pool.execute(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        next(err);
    }
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
