'use strict';
const { pool } = require('../config/db');

/**
 * Helper to check if task belongs to user
 */
async function checkTaskOwnership(taskId, userId) {
    const [rows] = await pool.execute(
        'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
        [taskId, userId]
    );
    return rows.length > 0;
}

async function listSubtasks(req, res, next) {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;

        if (!await checkTaskOwnership(taskId, userId)) {
            return res.status(403).json({ error: 'Access denied to this task' });
        }

        const [rows] = await pool.execute(
            'SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC',
            [taskId]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

async function createSubtask(req, res, next) {
    try {
        const { task_id, title } = req.body;
        const userId = req.user.id;

        if (!await checkTaskOwnership(task_id, userId)) {
            return res.status(403).json({ error: 'Access denied to this task' });
        }

        const [result] = await pool.execute(
            'INSERT INTO subtasks (task_id, title) VALUES (?, ?)',
            [task_id, title]
        );
        res.status(201).json({ id: result.insertId, message: 'Subtask created' });
    } catch (err) {
        next(err);
    }
}

async function updateSubtask(req, res, next) {
    try {
        const { id } = req.params;
        const { title, is_completed } = req.body;
        const userId = req.user.id;

        // Verify ownership via join
        const [rows] = await pool.execute(
            `SELECT s.id FROM subtasks s 
             JOIN tasks t ON s.task_id = t.id 
             WHERE s.id = ? AND t.user_id = ?`,
            [id, userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Subtask not found' });

        const updates = [];
        const params = [];
        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (is_completed !== undefined) { updates.push('is_completed = ?'); params.push(is_completed ? 1 : 0); }

        if (updates.length === 0) return res.json({ message: 'No changes' });

        params.push(id);
        await pool.execute(
            `UPDATE subtasks SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        res.json({ message: 'Subtask updated' });
    } catch (err) {
        next(err);
    }
}

async function deleteSubtask(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [rows] = await pool.execute(
            `SELECT s.id FROM subtasks s 
             JOIN tasks t ON s.task_id = t.id 
             WHERE s.id = ? AND t.user_id = ?`,
            [id, userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Subtask not found' });

        await pool.execute('DELETE FROM subtasks WHERE id = ?', [id]);
        res.json({ message: 'Subtask deleted' });
    } catch (err) {
        next(err);
    }
}

module.exports = { listSubtasks, createSubtask, updateSubtask, deleteSubtask };
