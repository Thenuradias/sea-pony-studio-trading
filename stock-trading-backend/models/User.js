const pool = require('../config/database');

class User {
    static async create(email, hashedPassword) {
        console.log('[User.create] Called with email:', email);
        const client = await pool.connect();
        try {
            console.log('[User.create] Client connected');
            await client.query('BEGIN');
            console.log('[User.create] Transaction begun');
            
            // Create user
            const userResult = await client.query(
                'INSERT INTO "User" (email, password_hash) VALUES ($1, $2) RETURNING id, email',
                [email, hashedPassword]
            );
            console.log('[User.create] User inserted:', userResult.rows[0]);
            const user = userResult.rows[0];
            
            // Create balance for user (10,000 LKR starting balance)
            const balanceResult = await client.query(
                'INSERT INTO "Balance" (user_id, lkr_balance, available_balance, locked_balance) VALUES ($1, $2, $3, $4)',
                [user.id, 10000, 10000, 0]
            );
            console.log('[User.create] Balance created');
            
            await client.query('COMMIT');
            console.log('[User.create] Transaction committed');
            return user;
        } catch (err) {
            console.error('[User.create] Error caught:', err.message);
            console.error('[User.create] Stack:', err.stack);
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
            console.log('[User.create] Client released');
        }
    }

    static async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM "User" WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT id, email, created_at FROM "User" WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }
}

module.exports = User;