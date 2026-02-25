'use strict';
const { body } = require('express-validator');

/**
 * OWASP Rules 1 & 2 – sanitize + validate auth inputs
 * NOTE: We do NOT use .escape() on string fields because:
 *   - It encodes HTML entities which get stored raw in DB (corrupts names)
 *   - SQL injection is already prevented by parameterized queries
 * NOTE: We do NOT use .normalizeEmail() because it transforms emails in
 *   unexpected ways (gmail dot removal, etc.) causing login mismatches.
 *   We instead do a simple trim + lowercase ourselves.
 */
const registerRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters')
        .matches(/^[a-zA-ZÀ-ÿ0-9 '_\-\.]+$/).withMessage('Name contains invalid characters'),

    body('email')
        .trim()
        .toLowerCase()
        .isEmail().withMessage('Valid email required')
        .isLength({ max: 255 }),

    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
];

const loginRules = [
    body('email')
        .trim()
        .toLowerCase()
        .isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerRules, loginRules };
