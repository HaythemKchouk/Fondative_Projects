const gitlabService = require('../services/gitlabService');

const getGitlabGroups = async (req, res) => {
    try {
        const groups = await gitlabService.fetchGitlabGroups();
        res.json(groups);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur récupération groupes');
    }
};

const addGroup = async (req, res) => {
    const { name, parentId } = req.body;
    try {
        const group = await gitlabService.createGitlabGroup(name, parentId);
        // si c'est CI-CD, on crée aussi les sous-projets
        if (name === 'CI-CD') {
            await gitlabService.createProjectsInGroup(group.id);
        }
        res.status(201).json(group);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data || err.message });
    }
};

module.exports = { getGitlabGroups, addGroup };
