import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    return (
        <Router>
            <Toaster position="top-right" />
            {token && <Navbar setToken={setToken} />}
            <Routes>
                <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
                <Route path="/register" element={!token ? <Register setToken={setToken} /> : <Navigate to="/" />} />
                <Route path="/" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;