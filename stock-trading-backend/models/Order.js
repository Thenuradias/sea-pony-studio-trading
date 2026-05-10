const pool = require('../config/db');

class Order {
    static async create(orderData) {
        const { userId, stockId, side, type, price, quantity, remainingQuantity } = orderData;
        
        const result = await pool.query(
            `INSERT INTO orders (id, user_id, stock_id, side, type, price, quantity, remaining_quantity, status) 
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'OPEN') 
             RETURNING *`,
            [userId, stockId, side, type, price, quantity, remainingQuantity || quantity]
        );
        return result.rows[0];
    }

    static async findOpenOrdersByStock(stockId) {
        const buyOrders = await pool.query(
            `SELECT * FROM orders 
             WHERE stock_id = $1 AND side = 'BUY' AND status IN ('OPEN', 'PARTIALLY_FILLED') 
             ORDER BY price DESC, created_at ASC`,
            [stockId]
        );
        
        const sellOrders = await pool.query(
            `SELECT * FROM orders 
             WHERE stock_id = $1 AND side = 'SELL' AND status IN ('OPEN', 'PARTIALLY_FILLED') 
             ORDER BY price ASC, created_at ASC`,
            [stockId]
        );
        
        return { buyOrders: buyOrders.rows, sellOrders: sellOrders.rows };
    }

    static async updateOrder(orderId, remainingQuantity, status) {
        const result = await pool.query(
            `UPDATE orders 
             SET remaining_quantity = $1, status = $2, updated_at = NOW() 
             WHERE id = $3 
             RETURNING *`,
            [remainingQuantity, status, orderId]
        );
        return result.rows[0];
    }

    static async findById(orderId) {
        const result = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [orderId]
        );
        return result.rows[0];
    }

    static async getUserOrders(userId) {
        const result = await pool.query(
            `SELECT o.*, s.symbol, s.name 
             FROM orders o 
             JOIN stocks s ON o.stock_id = s.id 
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [userId]
        );
        return result.rows;
    }
}

module.exports = Order;