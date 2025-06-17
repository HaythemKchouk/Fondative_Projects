const service = require('../services/gitlabApplication.service');

exports.getFilteredSubGroups = async (req, res) => {
    try {
        const groups = await service.fetchFilteredGroups();
        res.json(groups);
    } catch (err) {
        console.error('getFilteredSubGroups error:', err);
        res.status(500).json({ error: err.message });
    }
};
const { Gitlab } = require('@gitbeaker/node');

// Configure GitLab API
const api = new Gitlab({
    host: process.env.GITLAB_URL,
    token: process.env.GITLAB_TOKEN
});

exports.getSubGroups = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const subgroups = await api.Groups.subgroups(groupId);

        // Map to expected format
        const formatted = subgroups.map(g => ({
            id: g.id,
            name: g.name,
            full_path: g.full_path,
            full_name: g.full_name,
            parent_id: g.parent_id
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching subgroups:', error);
        res.status(500).json({
            message: error.message || 'Erreur lors de la récupération des sous-groupes'
        });
    }
};
exports.getProjects = async (req, res) => {
    try {
        const { groupId } = req.params;
        const projects = await service.fetchProjects(groupId);
        res.json(projects);
    } catch (err) {
        console.error('getProjects error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createAppProject = async (req, res) => {
    try {
        const result = await service.createAppProject(req.body);
        res.json(result);
    } catch (err) {
        console.error('createAppProject error:', err);
        res.status(500).json({ error: err.message });
    }
};
exports.createCiCdFolder = async (req, res) => {
    try {
        const folderResult = await service.createCiCdFolder(req.body);
        const yamlResult = await service.createCiCdYamlFile(req.body);

        res.status(200).json({
            message: `Dossier créé et fichier YAML généré pour ${req.body.folderName}`,
            folder: folderResult,
            yaml: yamlResult,
        });
    } catch (err) {
        console.error('createCiCdFolder error:', err);
        res.status(500).json({ error: err.message });
    }
};
