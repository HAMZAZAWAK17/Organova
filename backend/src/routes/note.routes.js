'use strict';
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { noteRules } = require('../validators/note.validator');
const { listNotes, createNote, updateNote, deleteNote } = require('../controllers/note.controller');

router.use(authenticate);

router.get('/', listNotes);
router.post('/', noteRules, validate, createNote);
router.put('/:id', noteRules, validate, updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
