const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateOrder = (order) => {
    const errors = [];
    
    if (!order.stock_id) {
        errors.push('Stock ID is required');
    }
    
    if (!order.side || !['BUY', 'SELL'].includes(order.side)) {
        errors.push('Side must be BUY or SELL');
    }
    
    if (!order.type || !['MARKET', 'LIMIT'].includes(order.type)) {
        errors.push('Type must be MARKET or LIMIT');
    }
    
    if (!order.quantity || order.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
    }
    
    if (order.type === 'LIMIT' && (!order.price || order.price <= 0)) {
        errors.push('Limit price must be greater than 0');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

const validatePrice = (price) => {
    return price && price > 0 && !isNaN(price);
};

const validateQuantity = (quantity) => {
    return quantity && quantity > 0 && !isNaN(quantity);
};

module.exports = {
    validateEmail,
    validatePassword,
    validateOrder,
    validatePrice,
    validateQuantity
};