'use strict';
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { body } = require('express-validator');
const { getProfile, updateProfile, changePassword } = require('../controllers/user.controller');

router.use(authenticate);

router.get('/profile', getProfile);

router.put('/profile',
    [body('name').trim().escape().notEmpty().isLength({ min: 2, max: 100 })],
    validate,
    updateProfile
);

router.put('/change-password',
    [
        body('current_password').notEmpty(),
        body('new_password')
            .isLength({ min: 8 })
            .matches(/[A-Z]/).withMessage('Must contain uppercase')
            .matches(/[0-9]/).withMessage('Must contain a number')
            .matches(/[^A-Za-z0-9]/).withMessage('Must contain a special character'),
    ],
    validate,
    changePassword
);

module.exports = router;
