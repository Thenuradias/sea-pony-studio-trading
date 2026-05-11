const Order = require('../models/Order');
const Balance = require('../models/Balance');
const Portfolio = require('../models/Portfolio');
const Trade = require('../models/Trade');
const Stock = require('../models/Stock');

class MatchingEngine {
    static async matchOrder(newOrder) {
        const matches = [];
        
        // Get opposite orders
        const oppositeSide = newOrder.side === 'BUY' ? 'SELL' : 'BUY';
        const orders = await this.getOppositeOrders(newOrder.stock_id, oppositeSide);
        
        for (const existingOrder of orders) {
            if (newOrder.remaining_quantity <= 0) break;
            
            // Check if prices match
            let priceMatch = false;
            let executionPrice = 0;
            
            if (newOrder.type === 'MARKET') {
                priceMatch = true;
                executionPrice = existingOrder.price;
            } else if (existingOrder.type === 'MARKET') {
                priceMatch = true;
                executionPrice = newOrder.price;
            } else {
                // Both LIMIT orders
                if (newOrder.side === 'BUY' && newOrder.price >= existingOrder.price) {
                    priceMatch = true;
                    executionPrice = existingOrder.price;
                } else if (newOrder.side === 'SELL' && newOrder.price <= existingOrder.price) {
                    priceMatch = true;
                    executionPrice = existingOrder.price;
                }
            }
            
            if (!priceMatch) break;
            
            // Calculate execution quantity
            const executeQty = Math.min(newOrder.remaining_quantity, existingOrder.remaining_quantity);
            
            // Execute trade
            await this.executeTrade(newOrder, existingOrder, executeQty, executionPrice);
            
            matches.push({
                order_id: existingOrder.id,
                quantity: executeQty,
                price: executionPrice
            });
            
            // Update remaining quantities
            newOrder.remaining_quantity -= executeQty;
            existingOrder.remaining_quantity -= executeQty;
            
            // Update orders in database
            await Order.updateOrder(newOrder.id, newOrder.remaining_quantity, 
                newOrder.remaining_quantity === 0 ? 'FILLED' : 'PARTIALLY_FILLED');
            await Order.updateOrder(existingOrder.id, existingOrder.remaining_quantity,
                existingOrder.remaining_quantity === 0 ? 'FILLED' : 'PARTIALLY_FILLED');
        }
        
        return matches;
    }
    
    static async getOppositeOrders(stockId, side) {
        const orderQuery = side === 'BUY' 
            ? `SELECT * FROM orders 
               WHERE stock_id = $1 AND side = 'BUY' AND status IN ('OPEN', 'PARTIALLY_FILLED') 
               ORDER BY price DESC, created_at ASC`
            : `SELECT * FROM orders 
               WHERE stock_id = $1 AND side = 'SELL' AND status IN ('OPEN', 'PARTIALLY_FILLED') 
               ORDER BY price ASC, created_at ASC`;
        
        const result = await Order.pool.query(orderQuery, [stockId]);
        return result.rows;
    }
    
    static async executeTrade(buyOrder, sellOrder, quantity, price) {
    const buyOrderObj = buyOrder.side === 'BUY' ? buyOrder : sellOrder;
    const sellOrderObj = buyOrder.side === 'SELL' ? buyOrder : sellOrder;
    
    // Create trade record
    await Trade.create(buyOrderObj.id, sellOrderObj.id, buyOrderObj.stock_id, price, quantity);
    
    // Update buyer's portfolio
    await Portfolio.updateHoldings(buyOrderObj.user_id, buyOrderObj.stock_id, quantity);
    
    // Update seller's portfolio
    await Portfolio.updateHoldings(sellOrderObj.user_id, sellOrderObj.stock_id, -quantity);
    
    // Update balances
    const totalCost = quantity * price;
    
    // Buyer: release locked funds
    await Balance.releaseLockedFunds(buyOrderObj.user_id, totalCost);
    
    // Seller: add funds
    const prisma = require('../config/db');
    await prisma.balance.update({
        where: { user_id: sellOrderObj.user_id },
        data: {
            lkr_balance: { increment: totalCost },
            available_balance: { increment: totalCost }
        }
    });
    
    // Update stock price
    await Stock.updatePrice(buyOrderObj.stock_id, price);
}
}

// Add pool to Order model for queries
Order.pool = require('../config/db');

module.exports = MatchingEngine;