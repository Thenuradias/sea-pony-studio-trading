import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Balance({ refresh }) {
    const [balance, setBalance] = useState({ lkr_balance: 0, available_balance: 0 });

    useEffect(() => {
        fetchBalance();
    }, [refresh]);

    const fetchBalance = async () => {
        try {
            const res = await api.get('/balance');
            setBalance(res.data);
        } catch (err) {
            console.error('Failed to fetch balance');
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">💰 Balance</h2>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-400">Total LKR:</span>
                    <span className="text-white font-bold">Rs. {balance.lkr_balance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-green-400 font-bold">Rs. {balance.available_balance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Locked:</span>
                    <span className="text-yellow-400 font-bold">Rs. {balance.locked_balance?.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

export default Balance;