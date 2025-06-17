const fetch = require('node-fetch');
const GITLAB_TOKEN = 'glpat-SDBni-qYtBM1xP_6czHo';
const API_BASE = 'https://gitlab.com/api/v4';

function gitlabFetch(url, opts = {}) {
    return fetch(url, {
        headers: {
            Authorization: `Bearer ${GITLAB_TOKEN}`,
            ...opts.headers,
        },
        ...opts,
    }).then(async (res) => {
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`GitLab API error ${res.status}: ${errorText}`);
        }
        return res.json();
    });
}

exports.fetchTopGroups = () =>
    gitlabFetch(`${API_BASE}/groups?top_level_only=true&per_page=100`);

exports.fetchSubGroups = groupId =>
    gitlabFetch(`${API_BASE}/groups/${groupId}/subgroups?per_page=100`);

exports.fetchProjects = async (groupId) => {
    try {
        const data = await gitlabFetch(`${API_BASE}/groups/${groupId}/projects?per_page=100`);
        return data;
    } catch (error) {
        console.error(`GitLab Projects Fetch Error: ${error.message}`);
        throw error;
    }
};
exports.fetchRepoTree = (projectId, path) =>
    gitlabFetch(
        `${API_BASE}/projects/${projectId}/repository/tree?per_page=100&path=${encodeURIComponent(path)}`
    );

exports.fetchFileContent = (projectId, filePath) =>
    fetch(
        `${API_BASE}/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}/raw?ref=main`,
        { headers: { Authorization: `Bearer ${GITLAB_TOKEN}` } }
    ).then(res => {
        if (!res.ok) throw new Error(`GitLab file error ${res.status}`);
        return res.text();
    });

// Correction du payload pour correspondre à l'API GitLab
exports.commitFile = (projectId, payload) => {
    const gitlabPayload = {
        branch: payload.branch || "main",
        commit_message: payload.commitMessage || "Mise à jour automatique",
        actions: [
            {
                action: "update",
                file_path: payload.path,
                content: payload.content,
            },
        ],
    };

    return fetch(`${API_BASE}/projects/${projectId}/repository/commits`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${GITLAB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(gitlabPayload),
    }).then(async (res) => {
        if (!res.ok) {
            const errorText = await res.text(); // Capture d'erreurs détaillées
            throw new Error(`GitLab commit error ${res.status}: ${errorText}`);
        }
        return res.json();
    });
};