'use strict';
const { body, param } = require('express-validator');

const noteRules = [
    body('title')
        .trim().escape()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 255 }).withMessage('Title max 255 chars'),
    body('content')
        .optional().trim().escape()
        .isLength({ max: 10000 }).withMessage('Content max 10000 chars'),
    body('type')
        .optional()
        .isIn(['note', 'meeting', 'idea', 'journal']).withMessage('Invalid note type'),
];

module.exports = { noteRules };
