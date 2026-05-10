const pool = require('../config/database');

class Balance {
    static async create(userId) {
        const result = await pool.query(
            'INSERT INTO "Balance" (user_id, lkr_balance, available_balance, locked_balance) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, 10000, 10000, 0]
        );
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const result = await pool.query(
            'SELECT * FROM "Balance" WHERE user_id = $1',
            [userId]
        );
        return result.rows[0] || null;
    }

    static async lockFunds(userId, amount) {
        // First check if there's enough available balance
        const balance = await this.findByUserId(userId);
        
        if (!balance || balance.available_balance < amount) {
            return null;
        }
        
        // Lock the funds
        const result = await pool.query(
            'UPDATE "Balance" SET available_balance = available_balance - $1, locked_balance = locked_balance + $1 WHERE user_id = $2 RETURNING *',
            [amount, userId]
        );
        return result.rows[0];
    }

    static async unlockFunds(userId, amount) {
        const result = await pool.query(
            'UPDATE "Balance" SET available_balance = available_balance + $1, locked_balance = locked_balance - $1 WHERE user_id = $2 RETURNING *',
            [amount, userId]
        );
        return result.rows[0];
    }

    static async releaseLockedFunds(userId, amount) {
        const result = await pool.query(
            'UPDATE "Balance" SET locked_balance = locked_balance - $1 WHERE user_id = $2 RETURNING *',
            [amount, userId]
        );
        return result.rows[0];
    }
}

module.exports = Balance;