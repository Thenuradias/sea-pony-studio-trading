const Balance = require('../models/Balance');

const getBalance = async (req, res) => {
    try {
        const balance = await Balance.findByUserId(req.userId);
        
        if (!balance) {
            return res.status(404).json({ error: 'Balance not found' });
        }
        
        res.json({
            lkr_balance: parseFloat(balance.lkr_balance),
            available_balance: parseFloat(balance.available_balance),
            locked_balance: parseFloat(balance.locked_balance)
        });
    } catch (err) {
        console.error('Get balance error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getBalance };