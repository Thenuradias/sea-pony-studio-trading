const prisma = require('../config/db');

class Trade {
    static async create(buyOrderId, sellOrderId, stockId, price, quantity) {
        return await prisma.trade.create({
            data: {
                buy_order_id: buyOrderId,
                sell_order_id: sellOrderId,
                stock_id: stockId,
                price,
                quantity
            }
        });
    }

    static async getTradesByStock(stockId) {
        return await prisma.trade.findMany({
            where: { stock_id: stockId },
            orderBy: { executed_at: 'desc' },
            take: 50
        });
    }

    static async getUserTrades(userId) {
        return await prisma.trade.findMany({
            where: {
                OR: [
                    { buyOrder: { user_id: userId } },
                    { sellOrder: { user_id: userId } }
                ]
            },
            include: {
                stock: {
                    select: { symbol: true, name: true }
                }
            },
            orderBy: { executed_at: 'desc' }
        });
    }
}

module.exports = Trade;