const pool = require('../config/db');

class User {
    static async create(email, hashedPassword) {
        const result = await pool.query(
            'INSERT INTO users (id, email, password_hash) VALUES (gen_random_uuid(), $1, $2) RETURNING id, email',
            [email, hashedPassword]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT id, email, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = User;