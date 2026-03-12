const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  authController.registerAdmin,
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  authController.loginAdmin,
);

// Public/member login (button click on public site)
router.post(
  '/public-login',
  [
    body('email').optional().isEmail(),
    body('phone').optional(),
    body('password').notEmpty(),
  ],
  authController.publicLogin,
);

module.exports = router;
