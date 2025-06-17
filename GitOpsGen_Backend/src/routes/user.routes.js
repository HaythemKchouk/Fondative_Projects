const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Debug: affiche les routes enregistrées
console.log('🔍 [User Routes] Routes enregistrées:');
router.get('/debug', (req, res) => {
    const routes = router.stack
        .filter(layer => layer.route)
        .map(layer => ({
            method: Object.keys(layer.route.methods)[0].toUpperCase(),
            path: layer.route.path
        }));
    res.json({ routes });
});

// Route spécifique
router.get('/:userId/projets', userController.getUserProjects);

// Routes standards
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

module.exports = router;