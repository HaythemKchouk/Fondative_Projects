const fs = require('fs');
const path = require('path');

const updateGitlabToken = (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token GitLab manquant.' });
    }

    const envPath = path.join(process.cwd(), '.env'); // point vers la racine du projet

    try {
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf-8');
        }

        const updatedContent = envContent.includes('GITLAB_TOKEN=')
            ? envContent.replace(/GITLAB_TOKEN=.*/g, `GITLAB_TOKEN=${token}`)
            : `${envContent}\nGITLAB_TOKEN=${token}`;

        fs.writeFileSync(envPath, updatedContent.trim() + '\n');
        return res.status(200).json({ message: 'Token GitLab mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du token :', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du token.' });
    }
};

module.exports = { updateGitlabToken };
