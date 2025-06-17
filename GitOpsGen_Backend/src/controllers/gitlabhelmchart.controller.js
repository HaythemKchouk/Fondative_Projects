const gitlabService = require('../services/gitlabhelmchart.service');

exports.getGroups = async (req, res) => {
    try {
        const data = await gitlabService.getGroups();
        res.json(data);
    } catch (err) {
        return res.status(401).json({ error: 'Non autorisé – vérifiez votre token GitLab' });
    }
};

exports.getSubgroups = async (req, res) => {
    try {
        const data = await gitlabService.getSubgroups(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des sous-groupes' });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const data = await gitlabService.getProjects(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
    }
};

exports.getTree = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { path } = req.query;
        const data = await gitlabService.getRepositoryTree(projectId, path);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors du chargement des dossiers' });
    }
};
// controllers/gitlabhelmchart.controller.js

exports.commitFiles = async (req, res) => {
    try {
        const { projectId, branch = 'main', message = 'Upload via UI', currentPath } = req.body;
        const files = req.files; // fichiers binaires
        let paths = req.body.paths; // chemins relatifs

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'Aucun fichier reçu.' });
        }

        // Si un seul fichier, paths peut être string au lieu de tableau
        if (typeof paths === 'string') {
            paths = [paths];
        }

        // Construire les actions avec le chemin complet
        const actions = files.map((file, i) => {
            // Construire chemin complet dans GitLab = currentPath + chemin relatif
            const relativePath = paths[i].replace(/\\/g, '/'); // uniformiser slash
            const filePath = `${currentPath}/${relativePath}`;

            return {
                action: 'create', // ou 'update' si tu veux écraser
                file_path: filePath,
                content: file.buffer.toString('utf8'),
                encoding: 'text',
            };
        });

        const data = await gitlabService.commitFiles(projectId, branch, message, actions);
        res.json(data);
    } catch (err) {
        console.error('Erreur backend lors du commit :', err.response?.data || err.message);
        res.status(500).json({ error: 'Erreur lors du commit' });
    }
};

