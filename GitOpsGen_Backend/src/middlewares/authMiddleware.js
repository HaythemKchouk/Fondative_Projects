// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant' });
    }
    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Token invalide ou expiré' });
    }
}

module.exports = { authenticateJWT };
