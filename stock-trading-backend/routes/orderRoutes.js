const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    cancelOrder, 
    getOrders, 
    getOrderBook 
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const { tradingLimiter } = require('../middleware/rateLimiter');

// Protected routes with trading rate limiting
router.post('/', authMiddleware, tradingLimiter, createOrder);
router.delete('/:orderId', authMiddleware, cancelOrder);
router.get('/', authMiddleware, getOrders);
router.get('/book/:stockId', authMiddleware, getOrderBook);

module.exports = router;