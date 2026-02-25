'use strict';
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
    listSubtasks, createSubtask, updateSubtask, deleteSubtask
} = require('../controllers/subtask.controller');
const {
    createSubtaskRules, updateSubtaskRules
} = require('../validators/subtask.validator');

router.use(authenticate);

router.get('/task/:taskId', listSubtasks);
router.post('/', createSubtaskRules, validate, createSubtask);
router.put('/:id', updateSubtaskRules, validate, updateSubtask);
router.delete('/:id', deleteSubtask);

module.exports = router;
