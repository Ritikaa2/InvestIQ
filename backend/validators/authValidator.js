const { body } = require('express-validator');
const { PASSWORD_POLICY_MESSAGE, isStrongPassword } = require('../utils/passwordPolicy');

module.exports = {
  registerValidator: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email address is required')
      .isEmail().withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .custom((value) => isStrongPassword(value)).withMessage(PASSWORD_POLICY_MESSAGE)
  ],

  loginValidator: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email address is required')
      .isEmail().withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty().withMessage('Password is required')
  ],

  forgotPasswordValidator: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email address is required')
      .isEmail().withMessage('Please provide a valid email address')
      .normalizeEmail()
  ],

  verifyResetOtpValidator: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email address is required')
      .isEmail().withMessage('Please provide a valid email address')
      .normalizeEmail(),

    body('otp')
      .trim()
      .notEmpty().withMessage('OTP is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
      .isNumeric().withMessage('OTP must contain only numbers')
  ],

  resetPasswordValidator: [
    body('password')
      .notEmpty().withMessage('New password is required')
      .custom((value) => isStrongPassword(value)).withMessage(PASSWORD_POLICY_MESSAGE),

    body('email')
      .if(body('token').not().exists())
      .trim()
      .notEmpty().withMessage('Email address is required')
      .isEmail().withMessage('Please provide a valid email address')
      .normalizeEmail(),

    body('otp')
      .if(body('token').not().exists())
      .trim()
      .notEmpty().withMessage('OTP is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
      .isNumeric().withMessage('OTP must contain only numbers')
  ]
};

