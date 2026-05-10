const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
// Temporarily disable routes that use unmigrated models
// const balanceRoutes = require('./routes/balanceRoutes');
// const portfolioRoutes = require('./routes/portfolioRoutes');
// const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/balance', balanceRoutes);
// app.use('/api/portfolio', portfolioRoutes);
// app.use('/api/orders', orderRoutes);

// Get all stocks endpoint
app.get('/api/stocks', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM "Stock" ORDER BY symbol ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching stocks:', err);
        res.status(500).json({ error: 'Failed to fetch stocks' });
    }
});

// Get single stock by ID
app.get('/api/stocks/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM "Stock" WHERE id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching stock:', err);
        res.status(500).json({ error: 'Failed to fetch stock' });
    }
});

// Get order book for a specific stock
app.get('/api/orderbook/:stockId', async (req, res) => {
    try {
        const { stockId } = req.params;
        
        // Get buy orders (bids)
        const buyOrdersResult = await pool.query(
            'SELECT * FROM "Order" WHERE stock_id = $1 AND side = $2 AND status IN ($3, $4) ORDER BY price DESC, created_at ASC LIMIT 20',
            [stockId, 'BUY', 'OPEN', 'PARTIALLY_FILLED']
        );
        
        // Get sell orders (asks)
        const sellOrdersResult = await pool.query(
            'SELECT * FROM "Order" WHERE stock_id = $1 AND side = $2 AND status IN ($3, $4) ORDER BY price ASC, created_at ASC LIMIT 20',
            [stockId, 'SELL', 'OPEN', 'PARTIALLY_FILLED']
        );
        
        const bids = buyOrdersResult.rows.map(order => ({
            price: order.price,
            quantity: order.remaining_quantity,
            order_id: order.id
        }));
        
        const asks = sellOrdersResult.rows.map(order => ({
            price: order.price,
            quantity: order.remaining_quantity,
            order_id: order.id
        }));
        
        res.json({
            stock_id: stockId,
            bids,
            asks
        });
    } catch (err) {
        console.error('Error fetching order book:', err);
        res.status(500).json({ error: 'Failed to fetch order book' });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await pool.query('SELECT 1');
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: err.message
        });
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});