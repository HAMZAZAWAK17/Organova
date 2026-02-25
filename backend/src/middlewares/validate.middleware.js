'use strict';
const { validationResult } = require('express-validator');

/**
 * OWASP Rules 1 & 2 – Input Sanitization & Validation
 * Runs after express-validator chains.
 * Returns 422 with error details if validation fails.
 */
function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('[Validation Error]', errors.array());
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}

module.exports = { validate };
