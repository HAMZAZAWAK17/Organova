'use strict';
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { listEvents, createEvent, deleteEvent } = require('../controllers/event.controller');

// All event routes require authentication
router.use(authenticate);

router.get('/', listEvents);
router.post('/', createEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
