'use strict';
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { body, param } = require('express-validator');
const {
    listTasks, getTask, createTask, updateTask, deleteTask,
} = require('../controllers/task.controller');
const {
    createTaskRules, updateTaskRules, taskIdRule, listTasksRules,
} = require('../validators/task.validator');

// All task routes require authentication
router.use(authenticate);

router.get('/', listTasksRules, validate, listTasks);
router.get('/:id', taskIdRule, validate, getTask);
router.post('/', createTaskRules, validate, createTask);
router.put('/:id', updateTaskRules, validate, updateTask);
router.delete('/:id', taskIdRule, validate, deleteTask);

module.exports = router;
