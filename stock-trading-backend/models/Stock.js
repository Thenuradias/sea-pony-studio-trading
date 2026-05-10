const pool = require('../config/db');

class Stock {
    static async findAll() {
        const result = await pool.query(
            'SELECT * FROM stocks ORDER BY symbol'
        );
        return result.rows;
    }

    static async findBySymbol(symbol) {
        const result = await pool.query(
            'SELECT * FROM stocks WHERE symbol = $1',
            [symbol]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM stocks WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async updatePrice(stockId, newPrice) {
        const result = await pool.query(
            'UPDATE stocks SET current_price = $1, last_price_updated = NOW() WHERE id = $2 RETURNING *',
            [newPrice, stockId]
        );
        return result.rows[0];
    }
}

module.exports = Stock;