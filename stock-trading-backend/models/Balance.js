const pool = require('../config/db');

class Balance {
    static async create(userId) {
        const result = await pool.query(
            'INSERT INTO balances (user_id, lkr_balance, available_balance, locked_balance) VALUES ($1, 10000, 10000, 0) RETURNING *',
            [userId]
        );
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const result = await pool.query(
            'SELECT * FROM balances WHERE user_id = $1',
            [userId]
        );
        return result.rows[0];
    }

    static async updateBalances(userId, availableBalance, lockedBalance) {
        const result = await pool.query(
            'UPDATE balances SET available_balance = $1, locked_balance = $2, updated_at = NOW() WHERE user_id = $3 RETURNING *',
            [availableBalance, lockedBalance, userId]
        );
        return result.rows[0];
    }

    static async lockFunds(userId, amount) {
        const result = await pool.query(
            'UPDATE balances SET available_balance = available_balance - $1, locked_balance = locked_balance + $1 WHERE user_id = $2 AND available_balance >= $1 RETURNING *',
            [amount, userId]
        );
        return result.rows[0];
    }

    static async unlockFunds(userId, amount) {
        const result = await pool.query(
            'UPDATE balances SET available_balance = available_balance + $1, locked_balance = locked_balance - $1 WHERE user_id = $2 RETURNING *',
            [amount, userId]
        );
        return result.rows[0];
    }

    static async releaseLockedFunds(userId, amount) {
        const result = await pool.query(
            'UPDATE balances SET locked_balance = locked_balance - $1 WHERE user_id = $2 RETURNING *',
            [amount, userId]
        );
        return result.rows[0];
    }
}

module.exports = Balance;