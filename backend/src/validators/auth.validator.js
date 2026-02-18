'use strict';
const { body } = require('express-validator');

/**
 * OWASP Rules 1 & 2 – sanitize + validate auth inputs
 */
const registerRules = [
    body('name')
        .trim().escape()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

    body('email')
        .trim().normalizeEmail()
        .isEmail().withMessage('Valid email required'),

    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
];

const loginRules = [
    body('email').trim().normalizeEmail().isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerRules, loginRules };
