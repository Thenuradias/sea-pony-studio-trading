import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

function Trading({ stocks, onTrade }) {
    const [selectedStock, setSelectedStock] = useState('');
    const [side, setSide] = useState('BUY');
    const [type, setType] = useState('LIMIT');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedStock) {
            toast.error('Select a stock');
            return;
        }
        
        if (!quantity || quantity <= 0) {
            toast.error('Enter valid quantity');
            return;
        }
        
        if (type === 'LIMIT' && (!price || price <= 0)) {
            toast.error('Enter valid limit price');
            return;
        }
        
        try {
            const orderData = {
                stock_id: selectedStock,
                side,
                type,
                quantity: parseFloat(quantity)
            };
            
            if (type === 'LIMIT') {
                orderData.price = parseFloat(price);
            }
            
            const res = await api.post('/orders', orderData);
            toast.success(`Order placed! ${res.data.matches_executed || 0} matches executed`);
            onTrade();
            setQuantity('');
            setPrice('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Order failed');
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">📝 Place Order</h2>
            <form onSubmit={handleSubmit}>
                <select
                    className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    required
                >
                    <option value="">Select Stock</option>
                    <option value="1a2b3c4d-1234-5678-9abc-def123456789">AAPL - Apple</option>
                    <option value="2b3c4d5e-2345-6789-abcd-ef2345678901">GOOGL - Google</option>
                    <option value="3c4d5e6f-3456-7890-bcde-fg3456789012">MSFT - Microsoft</option>
                </select>
                
                <div className="flex gap-4 mb-4">
                    <button
                        type="button"
                        className={`flex-1 p-2 rounded ${side === 'BUY' ? 'bg-green-600' : 'bg-gray-700'}`}
                        onClick={() => setSide('BUY')}
                    >
                        BUY
                    </button>
                    <button
                        type="button"
                        className={`flex-1 p-2 rounded ${side === 'SELL' ? 'bg-red-600' : 'bg-gray-700'}`}
                        onClick={() => setSide('SELL')}
                    >
                        SELL
                    </button>
                </div>
                
                <div className="flex gap-4 mb-4">
                    <button
                        type="button"
                        className={`flex-1 p-2 rounded ${type === 'MARKET' ? 'bg-blue-600' : 'bg-gray-700'}`}
                        onClick={() => setType('MARKET')}
                    >
                        MARKET
                    </button>
                    <button
                        type="button"
                        className={`flex-1 p-2 rounded ${type === 'LIMIT' ? 'bg-blue-600' : 'bg-gray-700'}`}
                        onClick={() => setType('LIMIT')}
                    >
                        LIMIT
                    </button>
                </div>
                
                {type === 'LIMIT' && (
                    <input
                        type="number"
                        placeholder="Limit Price (LKR)"
                        className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        step="0.01"
                    />
                )}
                
                <input
                    type="number"
                    placeholder="Quantity"
                    className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    step="1"
                    required
                />
                
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
                    Place Order
                </button>
            </form>
        </div>
    );
}

export default Trading;