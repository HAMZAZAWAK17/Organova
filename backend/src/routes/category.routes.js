'use strict';
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { body, param } = require('express-validator');
const {
    listCategories, createCategory, updateCategory, deleteCategory,
} = require('../controllers/category.controller');

router.use(authenticate);

const nameRule = body('name').trim().escape().notEmpty().isLength({ max: 100 });
const colorRule = body('color').optional().trim().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid hex color');
const idRule = param('id').isInt({ min: 1 });

router.get('/', listCategories);
router.post('/', [nameRule, colorRule], validate, createCategory);
router.put('/:id', [idRule, nameRule, colorRule], validate, updateCategory);
router.delete('/:id', [idRule], validate, deleteCategory);

module.exports = router;
