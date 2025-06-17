const authService = require('../services/authService');

async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await authService.loginUser(email, password);

        // Supprimer le mot de passe du retour pour plus de sécurité
        const { password: _, ...safeUser } = user;

        res.json({ message: 'Connexion réussie', user: safeUser });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

module.exports = {
    login,
};
