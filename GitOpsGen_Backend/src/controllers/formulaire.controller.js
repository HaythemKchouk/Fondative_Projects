const services = require('../services/formulaire.service');

exports.getTopGroups = async (req, res) => {
    try {
        const data = await services.fetchTopGroups();
        res.json(data);
    } catch {
        res.status(500).json({ message: "Impossible de récupérer les groupes top-level" });
    }
};

exports.getSubGroups = async (req, res) => {
    try {
        const data = await services.fetchSubGroups(req.params.groupId);
        res.json(data);
    } catch {
        res.status(500).json({ message: "Impossible de récupérer les sous-groupes" });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const data = await services.fetchProjects(req.params.groupId);
        res.json(data);
    } catch {
        res.status(500).json({ message: "Impossible de récupérer les projets" });
    }
};

exports.getRepoTree = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { path = '' } = req.query;
        const data = await services.fetchRepoTree(projectId, path);
        res.json(data);
    } catch {
        res.status(500).json({ message: "Impossible de récupérer l'arborescence" });
    }
};

exports.getFileContent = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { path } = req.query;
        const text = await services.fetchFileContent(projectId, path);
        res.send(text);
    } catch {
        res.status(500).json({ message: "Impossible de charger values.yaml" });
    }
};

exports.commitFile = async (req, res) => {
    try {
        const { projectId } = req.params;
        const payload = req.body;
        await services.commitFile(projectId, payload);
        res.json({ message: 'values.yaml mis à jour ✅' });
    } catch (error) {
        console.error("Erreur serveur:", error.message);
        res.status(500).json({
            message: 'Échec de la mise à jour',
            details: error.message
        });
    }
};