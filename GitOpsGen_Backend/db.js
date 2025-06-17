require('dotenv').config();
const { Client, Pool } = require('pg');
const bcrypt = require('bcrypt');

// Connexion au pool (pour les requêtes dans l'app)
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Fonction pour créer la base de données si elle n'existe pas
const createDatabase = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_INIT_DB || 'postgres', // généralement "postgres"
    });

    try {
        await client.connect();

        // On crée la DB seulement si elle n'existe pas (catch si erreur)
        await client.query(`
      CREATE DATABASE "${process.env.DB_NAME}"
      WITH OWNER = '${process.env.DB_USER}'
      LC_COLLATE = 'en_US.utf8'
      LC_CTYPE = 'en_US.utf8'
      TEMPLATE = template0;
    `);
        console.log('✅ Base de données créée.');
    } catch (err) {
        if (err.message.includes('already exists')) {
            console.log('⚠️ Base de données déjà existante.');
        } else {
            console.error('❌ Erreur lors de la création de la base :', err.message);
        }
    } finally {
        await client.end();
    }
};

// Fonction pour initialiser la table users avec un utilisateur de test
const initTables = async () => {
    const client = await pool.connect();

    try {
        // Création table users si inexistante
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id SERIAL PRIMARY KEY,
                                                 email TEXT UNIQUE NOT NULL,
                                                 password TEXT NOT NULL,
                                                 name TEXT NOT NULL,
                                                 role TEXT NOT NULL,
                                                 projets TEXT NOT NULL
            );
        `);

        // Hacher le mot de passe avant insertion
        const hashedPassword = await bcrypt.hash('haythem', 10);

        // Insertion utilisateur test avec ON CONFLICT pour éviter doublons
        await client.query(
            `
                INSERT INTO users (email, password, name, role, projets)
                VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (email) DO NOTHING;
            `,
            ['haythem@gmail.com', hashedPassword, 'Haythem', 'admin', 'ProjetA,ProjetB']
        );

        console.log('✅ Table users créée et utilisateur inséré (mot de passe haché).');
    } catch (err) {
        console.error('❌ Erreur création des tables :', err.message);
    } finally {
        client.release();
    }
};

// Initialisation complète (DB + tables)
const initDb = async () => {
    await createDatabase();
    await initTables();
};

// Exécuter automatiquement si appelé directement
if (require.main === module) {
    initDb();
}

// Exporter pool et fonctions
module.exports = {
    pool,
    initDb,
    createDatabase,
    initTables,
};
