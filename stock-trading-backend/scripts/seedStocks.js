const pool = require('../config/db');
require('dotenv').config();

const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.25 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 330.80 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.90 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 240.50 },
    { symbol: 'LK', name: 'Lanka Sugar', price: 25.00 },
    { symbol: 'COMB', name: 'Commercial Bank', price: 85.50 },
    { symbol: 'NDB', name: 'NDB Bank', price: 75.25 }
];

const seedStocks = async () => {
    try {
        console.log('🌱 Seeding stocks...');
        
        for (const stock of stocks) {
            await pool.query(
                `INSERT INTO stocks (id, symbol, name, current_price) 
                 VALUES (gen_random_uuid(), $1, $2, $3) 
                 ON CONFLICT (symbol) DO UPDATE 
                 SET name = EXCLUDED.name, current_price = EXCLUDED.current_price`,
                [stock.symbol, stock.name, stock.price]
            );
            console.log(`✅ Added ${stock.symbol} - $${stock.price}`);
        }
        
        console.log('✅ Stock seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding stocks:', err);
        process.exit(1);
    }
};

seedStocks();