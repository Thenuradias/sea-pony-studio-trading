require('dotenv').config();
const pool = require('./database');

// Create a mock Prisma-like object that delegates to the pool
const prismaStub = {
  user: {
    create: async (data) => {
      try {
        const { email, password_hash } = data.data;
        const result = await pool.query(
          'INSERT INTO "User" (email, password_hash) VALUES ($1, $2) RETURNING id, email',
          [email, password_hash]
        );
        return result.rows[0];
      } catch (err) {
        throw new Error(`Failed to create user: ${err.message}`);
      }
    },
    findUnique: async (query) => {
      try {
        if (query.where.email) {
          const result = await pool.query(
            'SELECT * FROM "User" WHERE email = $1',
            [query.where.email]
          );
          return result.rows[0] || null;
        } else if (query.where.id) {
          const result = await pool.query(
            'SELECT * FROM "User" WHERE id = $1',
            [query.where.id]
          );
          return result.rows[0] || null;
        }
      } catch (err) {
        throw new Error(`Failed to find user: ${err.message}`);
      }
    },
    findMany: async () => {
      try {
        const result = await pool.query('SELECT * FROM "User"');
        return result.rows;
      } catch (err) {
        throw new Error(`Failed to find users: ${err.message}`);
      }
    }
  },
  stock: {
    findMany: async () => {
      try {
        const result = await pool.query('SELECT * FROM "Stock"');
        return result.rows;
      } catch (err) {
        throw new Error(`Failed to find stocks: ${err.message}`);
      }
    },
    findUnique: async (query) => {
      try {
        const result = await pool.query(
          'SELECT * FROM "Stock" WHERE id = $1',
          [query.where.id]
        );
        return result.rows[0] || null;
      } catch (err) {
        throw new Error(`Failed to find stock: ${err.message}`);
      }
    }
  },
  $queryRaw: async (query) => {
    try {
      const result = await pool.query('SELECT 1');
      return result.rows;
    } catch (err) {
      throw new Error(`Database query failed: ${err.message}`);
    }
  }
};

module.exports = prismaStub;