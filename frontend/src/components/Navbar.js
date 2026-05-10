import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Navbar({ setToken }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        setToken(null);
        toast.success('Logged out');
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-xl font-bold">📈 Stock Trading</Link>
                <div className="space-x-4">
                    <Link to="/" className="text-gray-300 hover:text-white">Dashboard</Link>
                    <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;