import React, { useState, useEffect } from 'react';
import Balance from './Balance';
import Portfolio from './Portfolio';
import Trading from './Trading';
import api from '../utils/api';

function Dashboard({ token }) {
    const [stocks, setStocks] = useState([]);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const res = await api.get('/stocks');
            setStocks(res.data);
        } catch (err) {
            console.error('Failed to fetch stocks');
        }
    };

    const triggerRefresh = () => setRefresh(prev => prev + 1);

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">Trading Dashboard</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <Balance refresh={refresh} />
                        <Portfolio refresh={refresh} />
                    </div>
                    <div>
                        <Trading stocks={stocks} onTrade={triggerRefresh} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;