const userService = require('../services/user.service');
const { pool } = require('../../db');

async function createUser(req, res) {
    const { email, password, name, role, projets } = req.body;

    if (!email || !password || !name || !role || !projets) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    try {
        const user = await userService.addUser({ email, password, name, role, projets });
        res.status(201).json({ message: 'Utilisateur créé', user });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Email déjà utilisé.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
}

async function getUserById(req, res) {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'userId invalide' });
    }
    try {
        const { rows } = await pool.query(
            'SELECT id, mail, name, role, projets FROM users WHERE id = $1',
            [userId]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Erreur getUserById:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function updateUser(req, res) {
    const userId = parseInt(req.params.userId, 10);
    const { email, password, name, role, projets } = req.body;

    if (!email || !name || !role || !projets) {
        return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
    }

    try {
        const user = await userService.updateUser(userId, { email, password, name, role, projets });
        res.json({ message: 'Utilisateur mis à jour', user });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Email déjà utilisé.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
}

async function deleteUser(req, res) {
    const userId = parseInt(req.params.userId, 10);
    try {
        await userService.deleteUser(userId);
        res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
}

async function getUserProjects(req, res) {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID utilisateur invalide' });
    }

    try {
        const { rows } = await pool.query(
            'SELECT id, projets FROM users WHERE id = $1',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const row = rows[0];
        let projetsArray = [];

        if (Array.isArray(row.projets)) {
            projetsArray = row.projets;
        } else if (typeof row.projets === 'string') {
            projetsArray = row.projets
                .slice(1, -1)
                .split(',')
                .map(item => item.replace(/"/g, '').trim());
        }

        res.json([{ userId: row.id, projets: projetsArray }]);
    } catch (err) {
        console.error('Erreur getUserProjects:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}




module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserProjects
};