'use strict';
const router = require('express').Router({ mergeParams: true });
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { body, param } = require('express-validator');
const { listComments, addComment, deleteComment } = require('../controllers/comment.controller');

router.use(authenticate);

// GET  /api/tasks/:taskId/comments
// POST /api/tasks/:taskId/comments
const taskIdRule = param('taskId').isInt({ min: 1 });
const contentRule = body('content').trim().escape().notEmpty().isLength({ max: 2000 });
const commentIdRule = param('id').isInt({ min: 1 });

router.get('/', [taskIdRule], validate, listComments);
router.post('/', [taskIdRule, contentRule], validate, addComment);
router.delete('/:id', [commentIdRule], validate, deleteComment);

module.exports = router;
