const { pool } = require('../../db');  // <-- CORRECTION ici

const getUserById = async (id) => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
};

const updateUser = async (id, email, hashedPassword) => {
    const res = await pool.query(
        'UPDATE users SET email = $1, password = $2 WHERE id = $3 RETURNING *',
        [email, hashedPassword, id]
    );
    return res.rows[0];
};

module.exports = {
    getUserById,
    updateUser,
};
