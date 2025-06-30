// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
// **Le require ci-dessous doit pointer vers le fichier auth.middleware.js**
const { authenticateJWT } = require('../middlewares/authMiddleware');

// Debug des routes
console.log('🔍 [User Routes] Routes enregistrées:');
router.get('/debug', (req, res) => {
    const routes = router.stack
        .filter(l => l.route)
        .map(l => ({
            method: Object.keys(l.route.methods)[0].toUpperCase(),
            path: l.route.path
        }));
    res.json({ routes });
});

// Création utilisateur (publique)
router.post('/', userController.createUser);

// Protection JWT pour toutes les routes suivantes
router.use(authenticateJWT);

router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);
router.get('/:userId/projets', userController.getUserProjects);

module.exports = router;
