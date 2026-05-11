const prisma = require('../config/db');

class Portfolio {
    static async updateHoldings(userId, stockId, quantityChange) {
        const existing = await prisma.portfolio.findUnique({
            where: {
                user_id_stock_id: {
                    user_id: userId,
                    stock_id: stockId
                }
            }
        });
        
        if (!existing) {
            if (quantityChange > 0) {
                return await prisma.portfolio.create({
                    data: {
                        user_id: userId,
                        stock_id: stockId,
                        quantity: quantityChange
                    }
                });
            }
            return null;
        } else {
            const newQuantity = existing.quantity + quantityChange;
            if (newQuantity <= 0) {
                await prisma.portfolio.delete({
                    where: {
                        user_id_stock_id: {
                            user_id: userId,
                            stock_id: stockId
                        }
                    }
                });
                return null;
            } else {
                return await prisma.portfolio.update({
                    where: {
                        user_id_stock_id: {
                            user_id: userId,
                            stock_id: stockId
                        }
                    },
                    data: {
                        quantity: newQuantity,
                        updated_at: new Date()
                    }
                });
            }
        }
    }

    static async getUserPortfolio(userId) {
        return await prisma.portfolio.findMany({
            where: {
                user_id: userId,
                quantity: { gt: 0 }
            },
            include: {
                stock: {
                    select: { symbol: true, name: true, current_price: true }
                }
            }
        });
    }

    static async getHolding(userId, stockId) {
        return await prisma.portfolio.findUnique({
            where: {
                user_id_stock_id: {
                    user_id: userId,
                    stock_id: stockId
                }
            }
        });
    }
}

module.exports = Portfolio;