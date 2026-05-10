const Order = require('../models/Order');
const Balance = require('../models/Balance');
const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const Trade = require('../models/Trade');
const MatchingEngine = require('./matchingEngine');

const createOrder = async (req, res) => {
    const { stock_id, side, type, price, quantity } = req.body;
    
    // Validation
    if (!stock_id || !side || !type || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['BUY', 'SELL'].includes(side)) {
        return res.status(400).json({ error: 'Side must be BUY or SELL' });
    }
    
    if (!['MARKET', 'LIMIT'].includes(type)) {
        return res.status(400).json({ error: 'Type must be MARKET or LIMIT' });
    }
    
    if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be positive' });
    }
    
    if (type === 'LIMIT' && (!price || price <= 0)) {
        return res.status(400).json({ error: 'Limit price required and must be positive' });
    }
    
    try {
        // Get stock details
        const stock = await Stock.findById(stock_id);
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        
        const orderPrice = type === 'MARKET' ? null : price;
        let totalCost = quantity * (price || stock.current_price);
        
        if (side === 'BUY') {
            // Check and lock funds
            const balance = await Balance.findByUserId(req.userId);
            if (!balance || balance.available_balance < totalCost) {
                return res.status(400).json({ error: 'Insufficient funds' });
            }
            
            // Lock funds
            await Balance.lockFunds(req.userId, totalCost);
        } else {
            // SELL - check if user owns enough shares
            const holding = await Portfolio.getHolding(req.userId, stock_id);
            if (!holding || holding.quantity < quantity) {
                return res.status(400).json({ error: 'Insufficient shares' });
            }
        }
        
        // Create order
        const order = await Order.create({
            userId: req.userId,
            stockId: stock_id,
            side,
            type,
            price: orderPrice,
            quantity,
            remainingQuantity: quantity
        });
        
        // Try to match the order
        const matches = await MatchingEngine.matchOrder(order);
        
        res.status(201).json({
            success: true,
            order,
            matches_executed: matches.length,
            order_status: order.status
        });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const cancelOrder = async (req, res) => {
    const { orderId } = req.params;
    
    try {
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        if (order.user_id !== req.userId) {
            return res.status(403).json({ error: 'Not your order' });
        }
        
        if (order.status !== 'OPEN' && order.status !== 'PARTIALLY_FILLED') {
            return res.status(400).json({ error: 'Order cannot be cancelled' });
        }
        
        // Unlock funds if BUY order
        if (order.side === 'BUY') {
            const lockedAmount = order.remaining_quantity * (order.price || 0);
            if (lockedAmount > 0) {
                await Balance.unlockFunds(req.userId, lockedAmount);
            }
        }
        
        // Update order status
        const updatedOrder = await Order.updateOrder(order.id, order.remaining_quantity, 'CANCELLED');
        
        res.json({
            success: true,
            message: 'Order cancelled',
            order: updatedOrder
        });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.getUserOrders(req.userId);
        
        const formattedOrders = orders.map(order => ({
            id: order.id,
            stock_symbol: order.symbol,
            stock_name: order.name,
            side: order.side,
            type: order.type,
            price: order.price ? parseFloat(order.price) : null,
            quantity: parseFloat(order.quantity),
            remaining_quantity: parseFloat(order.remaining_quantity),
            status: order.status,
            created_at: order.created_at
        }));
        
        res.json(formattedOrders);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getOrderBook = async (req, res) => {
    const { stockId } = req.params;
    
    try {
        const { buyOrders, sellOrders } = await Order.findOpenOrdersByStock(stockId);
        
        const bids = buyOrders.map(order => ({
            price: parseFloat(order.price),
            quantity: parseFloat(order.remaining_quantity),
            order_id: order.id
        }));
        
        const asks = sellOrders.map(order => ({
            price: parseFloat(order.price),
            quantity: parseFloat(order.remaining_quantity),
            order_id: order.id
        }));
        
        res.json({ stock_id: stockId, bids, asks });
    } catch (err) {
        console.error('Get order book error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { createOrder, cancelOrder, getOrders, getOrderBook };