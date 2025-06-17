const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

async function loginUser(email, password) {
    const user = await userModel.findUserByEmail(email);

    if (!user) {
        throw new Error('Identifiants incorrects');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Identifiants incorrects');
    }

    return user;
}

module.exports = {
    loginUser,
};
