'use strict';
const { body, param, query } = require('express-validator');

const createTaskRules = [
    body('title')
        .trim().escape()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 255 }).withMessage('Title max 255 chars'),

    body('description')
        .optional({ nullable: true }).trim().escape()
        .isLength({ max: 5000 }).withMessage('Description max 5000 chars'),

    body('status')
        .optional({ nullable: true })
        .isIn(['todo', 'in_progress', 'done', 'archived']).withMessage('Invalid status'),

    body('priority')
        .optional({ nullable: true })
        .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),

    body('due_date')
        .optional({ nullable: true })
        .isISO8601().withMessage('due_date must be a valid ISO 8601 date'),

    body('category_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('category_id must be a positive integer'),

    body('is_pinned')
        .optional()
        .isBoolean().withMessage('is_pinned must be a boolean'),
];

const updateTaskRules = [
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    ...createTaskRules.map(r => r.optional ? r : r),
];

const taskIdRule = [
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
];

const listTasksRules = [
    query('status').optional().isIn(['todo', 'in_progress', 'done', 'archived']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = { createTaskRules, updateTaskRules, taskIdRule, listTasksRules };
