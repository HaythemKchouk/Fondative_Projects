const bcrypt = require('bcrypt');
const userModel = require('../models/parametreModel');

const updateUser = async (req, res) => {
    const { id, email, password } = req.body;

    if (!id || !email || !password) {
        return res.status(400).json({ message: 'id, email et password sont obligatoires' });
    }

    try {
        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await userModel.updateUser(id, email, hashedPassword);

        res.status(200).json({ message: 'Utilisateur mis à jour.', user: updatedUser });
    } catch (err) {
        console.error('Erreur lors de la mise à jour:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = {
    updateUser,
};
