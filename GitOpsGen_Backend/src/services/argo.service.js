const fetch = require('node-fetch');
const ARGO_TOKEN = process.env.ARGO_TOKEN;
const ARGO_URL = process.env.ARGO_URL || 'https://your-argo-instance.com';

async function getApplications() {
    const response = await fetch(`${ARGO_URL}/api/v1/applications`, {
        headers: { Authorization: `Bearer ${ARGO_TOKEN}` }
    });

    if (!response.ok) throw new Error(`ArgoCD error: ${response.statusText}`);

    const data = await response.json();
    return data.items || [];
}

module.exports = {
    getApplications,
};
