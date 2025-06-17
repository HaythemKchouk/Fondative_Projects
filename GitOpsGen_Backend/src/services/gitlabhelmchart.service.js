const axios = require('axios');

const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
if (!GITLAB_TOKEN) {
    throw new Error('Le token GitLab est introuvable dans process.env.GITLAB_TOKEN');
}

// On crée l’instance une seule fois, avec le bon header
const axiosInstance = axios.create({
    baseURL: 'https://gitlab.com/api/v4',
    headers: { Authorization: `Bearer ${GITLAB_TOKEN}` },
    maxRedirects: 0,
    validateStatus: status => status < 400
});

const getGroups = async () => {
    const res = await axiosInstance.get('/groups', {
        params: { top_level_only: true, per_page: 100 }
    });
    return res.data;
};

const getSubgroups = async groupId => {
    const res = await axiosInstance.get(`/groups/${groupId}/subgroups`, {
        params: { per_page: 100 }
    });
    return res.data;
};

const getProjects = async groupId => {
    const res = await axiosInstance.get(`/groups/${groupId}/projects`, {
        params: { search: 'cd-config', per_page: 100 }
    });
    return res.data;
};

const getRepositoryTree = async (projectId, path) => {
    const res = await axiosInstance.get(`/projects/${projectId}/repository/tree`, {
        params: { path, ref: 'main' }
    });
    return res.data;
};

const commitFiles = async (projectId, branch, message, actions) => {
    const payload = { branch, commit_message: message, actions };
    const res = await axiosInstance.post(`/projects/${projectId}/repository/commits`, payload);
    return res.data;
};

module.exports = {
    getGroups,
    getSubgroups,
    getProjects,
    getRepositoryTree,
    commitFiles
};
