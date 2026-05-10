const jwt = require('jsonwebtoken');

const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
};

const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (err) {
        return null;
    }
};

module.exports = { generateToken, verifyToken, decodeToken };