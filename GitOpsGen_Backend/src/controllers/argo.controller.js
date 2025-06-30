const argoService = require('../services/argo.service');

exports.getArgoApplications = async (req, res) => {
    try {
        const applications = await getApplications();
        res.json(applications);
    } catch (error) {
        console.error('ArgoCD error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getApplicationByName = async (req, res) => {
    try {
        const app = await argoService.fetchApplicationDetails(req.params.name);
        res.json(app);
    } catch (err) {
        console.error('Controller:error getApplicationByName', err);
        res.status(500).json({ error: err.message });
    }
};
