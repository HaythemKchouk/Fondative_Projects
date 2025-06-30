// src/controllers/auth.controller.js
const authService = require('../services/authService');

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser(email, password);
        const { password: _, ...safeUser } = user;
        res.json({ message: 'Connexion réussie', user: safeUser, token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

module.exports = { login };
