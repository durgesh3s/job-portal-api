const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'src/uploads/' });

const authController = require('../controllers/auth.controller');

router.post('/signup', upload.single('avatar'), authController.signup);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
