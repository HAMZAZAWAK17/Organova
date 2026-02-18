'use strict';
const rateLimit = require('express-rate-limit');

/**
 * OWASP Rule 3 – Rate Limiting
 * Global limiter: 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

/**
 * Strict limiter for auth endpoints (brute-force protection)
 * 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later.' },
});

module.exports = { globalLimiter, authLimiter };
