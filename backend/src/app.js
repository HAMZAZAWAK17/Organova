'use strict';
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { globalLimiter } = require('./middlewares/rateLimiter');

// ── Route imports ──────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');
const categoryRoutes = require('./routes/category.routes');
const commentRoutes = require('./routes/comment.routes');
const notificationRoutes = require('./routes/notification.routes');
const subtaskRoutes = require('./routes/subtask.routes');

const app = express();

// ── Security headers (OWASP) ───────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));       // prevent large payload attacks
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Global rate limiter (OWASP Rule 3) ────────────────────
app.use(globalLimiter);

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subtasks', subtaskRoutes);

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404 handler ────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ───────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('[Error]', err.message);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
