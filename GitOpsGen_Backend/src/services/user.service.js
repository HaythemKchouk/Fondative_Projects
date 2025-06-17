const bcrypt = require('bcrypt');
const { pool } = require('../../db');


async function addUser({ email, password, name, role, projets }) {
    const client = await pool.connect();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.query(
            `INSERT INTO users (email, password, name, role, projets)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, projets`,
            [email, hashedPassword, name, role, projets]
        );

        return result.rows[0]; // user créé sans mot de passe
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}
async function getAllUsers() {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT id, email AS mail, name, role, projets, password 
       FROM users ORDER BY name`
        );
        return result.rows;
    } finally {
        client.release();
    }
}
async function updateUser(id, { email, password, name, role, projets }) {
    const client = await pool.connect();
    try {
        let query;
        let params;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = `
                UPDATE users 
                SET email = $1, password = $2, name = $3, role = $4, projets = $5 
                WHERE id = $6 
                RETURNING id, email AS mail, name, role, projets
            `;
            params = [email, hashedPassword, name, role, projets, id];
        } else {
            query = `
                UPDATE users 
                SET email = $1, name = $2, role = $3, projets = $4 
                WHERE id = $5 
                RETURNING id, email AS mail, name, role, projets
            `;
            params = [email, name, role, projets, id];
        }

        const result = await client.query(query, params);
        if (result.rows.length === 0) throw new Error('Utilisateur non trouvé');
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function deleteUser(id) {
    const client = await pool.connect();
    try {
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) throw new Error('Utilisateur non trouvé');
    } finally {
        client.release();
    }
}
module.exports = {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser,
};
