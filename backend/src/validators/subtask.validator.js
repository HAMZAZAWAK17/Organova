'use strict';
const { body, param } = require('express-validator');

const createSubtaskRules = [
    body('task_id').isInt({ min: 1 }).withMessage('Valid task_id is required'),
    body('title')
        .trim().escape()
        .notEmpty().withMessage('Subtask title is required')
        .isLength({ max: 255 }).withMessage('Title max 255 chars'),
];

const updateSubtaskRules = [
    param('id').isInt({ min: 1 }).withMessage('Valid subtask ID is required'),
    body('title')
        .optional()
        .trim().escape()
        .notEmpty().withMessage('Subtask title cannot be empty')
        .isLength({ max: 255 }).withMessage('Title max 255 chars'),
    body('is_completed')
        .optional()
        .isBoolean().withMessage('is_completed must be a boolean'),
];

module.exports = { createSubtaskRules, updateSubtaskRules };
