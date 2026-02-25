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
        const { status, priority, search, page = 1, limit = 20 } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        const params = [userId];
        let where = 'WHERE t.user_id = ?';

        if (status) { where += ' AND t.status = ?'; params.push(status); }
        if (priority) { where += ' AND t.priority = ?'; params.push(priority); }
        if (search) {
            where += ' AND (t.title LIKE ? OR t.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const countParams = [...params];
        params.push(Number(limit), offset);

        const [tasks] = await pool.execute(
            `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.is_pinned,
              t.created_at, t.updated_at,
              c.name AS category_name, c.color AS category_color
       FROM tasks t
       LEFT JOIN categories c ON c.id = t.category_id
       ${where}
       ORDER BY t.is_pinned DESC, t.updated_at DESC
       LIMIT ? OFFSET ?`,
            params
        );

        const [[{ total }]] = await pool.execute(
            `SELECT COUNT(*) AS total FROM tasks t ${where}`,
            countParams
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

        const task = rows[0];
        // Fetch subtasks
        const [subtasks] = await pool.execute(
            'SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC',
            [task.id]
        );
        task.subtasks = subtasks;

        res.json(task);
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
        const { title, description, status, priority, due_date, category_id, is_pinned } = req.body;
        const [result] = await pool.execute(
            `INSERT INTO tasks (user_id, category_id, title, description, status, priority, due_date, is_pinned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, category_id || null, title, description || null,
            status || 'todo', priority || 'medium', due_date || null, is_pinned ? 1 : 0]
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
        const { title, description, status, priority, due_date, category_id, is_pinned } = req.body;
        const [result] = await pool.execute(
            `UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, category_id = ?, is_pinned = ?
       WHERE id = ? AND user_id = ?`,
            [title, description || null, status, priority, due_date || null,
                category_id || null, is_pinned ? 1 : 0, req.params.id, req.user.id]
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

async function getStats(req, res, next) {
    try {
        const userId = req.user.id;

        // Count by status
        const [statusCounts] = await pool.execute(
            'SELECT status, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY status',
            [userId]
        );

        // Count by priority
        const [priorityCounts] = await pool.execute(
            'SELECT priority, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY priority',
            [userId]
        );

        // Completion rate (done vs total)
        const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM tasks WHERE user_id = ?', [userId]);
        const [[{ done }]] = await pool.execute('SELECT COUNT(*) as done FROM tasks WHERE user_id = ? AND status = "done"', [userId]);

        res.json({
            statusCounts,
            priorityCounts,
            completionRate: total > 0 ? (done / total) * 100 : 0,
            totalTasks: total
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask, getStats };
