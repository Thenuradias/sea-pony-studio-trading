const prisma = require('../config/db');

class Stock {
    static async findAll() {
        return await prisma.stock.findMany({
            orderBy: { symbol: 'asc' }
        });
    }

    static async findBySymbol(symbol) {
        return await prisma.stock.findUnique({
            where: { symbol }
        });
    }

    static async findById(id) {
        return await prisma.stock.findUnique({
            where: { id }
        });
    }

    static async updatePrice(stockId, newPrice) {
        return await prisma.stock.update({
            where: { id: stockId },
            data: {
                current_price: newPrice,
                last_price_updated: new Date()
            }
        });
    }
}

module.exports = Stock;