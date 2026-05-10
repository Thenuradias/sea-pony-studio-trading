const pool = require('../config/db');

class Portfolio {
    static async updateHoldings(userId, stockId, quantityChange) {
        const existing = await pool.query(
            'SELECT * FROM portfolios WHERE user_id = $1 AND stock_id = $2',
            [userId, stockId]
        );
        
        if (existing.rows.length === 0) {
            if (quantityChange > 0) {
                const result = await pool.query(
                    'INSERT INTO portfolios (user_id, stock_id, quantity) VALUES ($1, $2, $3) RETURNING *',
                    [userId, stockId, quantityChange]
                );
                return result.rows[0];
            }
        } else {
            const newQuantity = existing.rows[0].quantity + quantityChange;
            if (newQuantity <= 0) {
                await pool.query(
                    'DELETE FROM portfolios WHERE user_id = $1 AND stock_id = $2',
                    [userId, stockId]
                );
                return null;
            } else {
                const result = await pool.query(
                    'UPDATE portfolios SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND stock_id = $3 RETURNING *',
                    [newQuantity, userId, stockId]
                );
                return result.rows[0];
            }
        }
    }

    static async getUserPortfolio(userId) {
        const result = await pool.query(
            `SELECT p.*, s.symbol, s.name, s.current_price 
             FROM portfolios p 
             JOIN stocks s ON p.stock_id = s.id 
             WHERE p.user_id = $1 AND p.quantity > 0`,
            [userId]
        );
        return result.rows;
    }

    static async getHolding(userId, stockId) {
        const result = await pool.query(
            'SELECT * FROM portfolios WHERE user_id = $1 AND stock_id = $2',
            [userId, stockId]
        );
        return result.rows[0];
    }
}

module.exports = Portfolio;