const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin
} = require('../middleware/validator');

// Registration is disabled - only admins can create users
router.post('/register', (req, res) => {
  res.status(403).json({
    success: false,
    message: 'User registration is disabled. Please contact an administrator to create an account.'
  });
});

router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

module.exports = router;
