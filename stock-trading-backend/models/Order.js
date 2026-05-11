const prisma = require('../config/db');

class Order {
    static async create(orderData) {
        const { userId, stockId, side, type, price, quantity, remainingQuantity } = orderData;
        
        return await prisma.order.create({
            data: {
                user_id: userId,
                stock_id: stockId,
                side,
                type,
                price: price || null,
                quantity,
                remaining_quantity: remainingQuantity || quantity,
                status: 'OPEN'
            }
        });
    }

    static async findOpenOrdersByStock(stockId) {
        const buyOrders = await prisma.order.findMany({
            where: {
                stock_id: stockId,
                side: 'BUY',
                status: { in: ['OPEN', 'PARTIALLY_FILLED'] }
            },
            orderBy: [
                { price: 'desc' },
                { created_at: 'asc' }
            ]
        });
        
        const sellOrders = await prisma.order.findMany({
            where: {
                stock_id: stockId,
                side: 'SELL',
                status: { in: ['OPEN', 'PARTIALLY_FILLED'] }
            },
            orderBy: [
                { price: 'asc' },
                { created_at: 'asc' }
            ]
        });
        
        return { buyOrders, sellOrders };
    }

    static async updateOrder(orderId, remainingQuantity, status) {
        return await prisma.order.update({
            where: { id: orderId },
            data: {
                remaining_quantity: remainingQuantity,
                status,
                updated_at: new Date()
            }
        });
    }

    static async findById(orderId) {
        return await prisma.order.findUnique({
            where: { id: orderId }
        });
    }

    static async getUserOrders(userId) {
        return await prisma.order.findMany({
            where: { user_id: userId },
            include: {
                stock: {
                    select: { symbol: true, name: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }
}

module.exports = Order;