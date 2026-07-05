const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator, forgotPasswordValidator, verifyResetOtpValidator, resetPasswordValidator } = require('../validators/authValidator');
const validate = require('../middlewares/validationMiddleware');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// Public routes
router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/verify', authController.verifyEmail);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/verify-reset-otp', verifyResetOtpValidator, validate, authController.verifyResetOtp);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, upload.single('avatar'), authController.updateProfile);

module.exports = router;


