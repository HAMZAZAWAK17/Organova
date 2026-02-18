'use strict';
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { param } = require('express-validator');
const { listNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');

router.use(authenticate);

router.get('/', listNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', [param('id').isInt({ min: 1 })], validate, markAsRead);

module.exports = router;
