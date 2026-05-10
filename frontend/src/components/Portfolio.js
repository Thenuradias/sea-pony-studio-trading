import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Portfolio({ refresh }) {
    const [portfolio, setPortfolio] = useState([]);

    useEffect(() => {
        fetchPortfolio();
    }, [refresh]);

    const fetchPortfolio = async () => {
        try {
            const res = await api.get('/portfolio');
            setPortfolio(res.data.portfolio || []);
        } catch (err) {
            console.error('Failed to fetch portfolio');
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">📊 Portfolio</h2>
            {portfolio.length === 0 ? (
                <p className="text-gray-400">No stocks owned yet</p>
            ) : (
                <div className="space-y-3">
                    {portfolio.map((item, idx) => (
                        <div key={idx} className="border-b border-gray-700 pb-2">
                            <div className="flex justify-between">
                                <span className="text-white font-bold">{item.symbol}</span>
                                <span className="text-white">{item.quantity} shares</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">{item.name}</span>
                                <span className="text-green-400">Rs. {item.value?.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Portfolio;