'use strict';
const router = require('express').Router();
const { authLimiter } = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerRules, loginRules } = require('../validators/auth.validator');
const { register, login, getMe } = require('../controllers/auth.controller');

// POST /api/auth/register  – strict rate limit (OWASP Rule 3)
router.post('/register', authLimiter, registerRules, validate, register);

// POST /api/auth/login     – strict rate limit (brute-force protection)
router.post('/login', authLimiter, loginRules, validate, login);

// GET  /api/auth/me        – requires valid JWT
router.get('/me', authenticate, getMe);

module.exports = router;
