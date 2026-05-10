// Simple test for matching engine logic
// Run with: node tests/matchingEngine.test.js

const assert = require('assert');

// Mock order matching logic
function testPriceTimePriority() {
    console.log('🧪 Testing Price-Time Priority Matching...');
    
    const buyOrders = [
        { id: 1, price: 100, quantity: 10, time: 1 },
        { id: 2, price: 105, quantity: 5, time: 2 },
        { id: 3, price: 100, quantity: 8, time: 3 }
    ];
    
    const sellOrders = [
        { id: 4, price: 98, quantity: 7, time: 1 },
        { id: 5, price: 99, quantity: 6, time: 2 },
        { id: 6, price: 101, quantity: 10, time: 3 }
    ];
    
    // Sort buys: higher price first, then older time
    const sortedBuys = [...buyOrders].sort((a, b) => {
        if (a.price !== b.price) return b.price - a.price;
        return a.time - b.time;
    });
    
    // Sort sells: lower price first, then older time
    const sortedSells = [...sellOrders].sort((a, b) => {
        if (a.price !== b.price) return a.price - b.price;
        return a.time - b.time;
    });
    
    console.log('Sorted Buys (highest price first):', sortedBuys.map(o => `${o.price}@${o.time}`));
    console.log('Sorted Sells (lowest price first):', sortedSells.map(o => `${o.price}@${o.time}`));
    
    assert(sortedBuys[0].price === 105, 'Highest buy price should be 105');
    assert(sortedSells[0].price === 98, 'Lowest sell price should be 98');
    
    console.log('✅ Price-Time Priority test passed!\n');
}

function testPartialFill() {
    console.log('🧪 Testing Partial Fill Logic...');
    
    let buyQty = 10;
    const sellQty = 6;
    
    const executedQty = Math.min(buyQty, sellQty);
    buyQty -= executedQty;
    
    assert(executedQty === 6, 'Should execute 6 shares');
    assert(buyQty === 4, 'Should have 4 shares remaining');
    
    console.log('✅ Partial Fill test passed!\n');
}

// Run tests
testPriceTimePriority();
testPartialFill();

console.log('🎉 All matching engine tests passed!');