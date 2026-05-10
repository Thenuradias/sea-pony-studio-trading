const pool = require('../config/db');

class Trade {
    static async create(buyOrderId, sellOrderId, stockId, price, quantity) {
        const result = await pool.query(
            `INSERT INTO trades (id, buy_order_id, sell_order_id, stock_id, price, quantity) 
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) 
             RETURNING *`,
            [buyOrderId, sellOrderId, stockId, price, quantity]
        );
        return result.rows[0];
    }

    static async getTradesByStock(stockId) {
        const result = await pool.query(
            `SELECT * FROM trades 
             WHERE stock_id = $1 
             ORDER BY executed_at DESC 
             LIMIT 50`,
            [stockId]
        );
        return result.rows;
    }

    static async getUserTrades(userId) {
        const result = await pool.query(
            `SELECT t.*, s.symbol, s.name 
             FROM trades t 
             JOIN stocks s ON t.stock_id = s.id 
             WHERE t.buy_order_id IN (SELECT id FROM orders WHERE user_id = $1)
                OR t.sell_order_id IN (SELECT id FROM orders WHERE user_id = $1)
             ORDER BY t.executed_at DESC`,
            [userId]
        );
        return result.rows;
    }
}

module.exports = Trade;