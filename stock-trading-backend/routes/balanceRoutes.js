const express = require('express');
const router = express.Router();
const { getBalance } = require('../controllers/balanceController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getBalance);

module.exports = router;