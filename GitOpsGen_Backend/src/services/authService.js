// src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

async function loginUser(email, password) {
    const user = await userModel.findUserByEmail(email);
    if (!user) throw new Error('Identifiants incorrects');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Identifiants incorrects');

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return { user, token };
}

module.exports = { loginUser };
