const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');

const getPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.getUserPortfolio(req.userId);
        
        const portfolioWithValues = portfolio.map(item => ({
            stock_id: item.stock_id,
            symbol: item.symbol,
            name: item.name,
            quantity: parseFloat(item.quantity),
            current_price: parseFloat(item.current_price),
            value: parseFloat(item.quantity * item.current_price)
        }));
        
        // Calculate total portfolio value
        const totalValue = portfolioWithValues.reduce((sum, item) => sum + item.value, 0);
        
        // Get available balance
        const Balance = require('../models/Balance');
        const balance = await Balance.findByUserId(req.userId);
        
        res.json({
            portfolio: portfolioWithValues,
            total_stock_value: totalValue,
            available_balance: balance ? parseFloat(balance.available_balance) : 0,
            total_value: totalValue + (balance ? parseFloat(balance.available_balance) : 0)
        });
    } catch (err) {
        console.error('Get portfolio error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getPortfolio };