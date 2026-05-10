const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting (temporarily disabled for testing)
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', authMiddleware, getMe);

module.exports = router;