const axios = require('axios');

const GITLAB_API_URL = 'https://gitlab.com/api/v4';
const GITLAB_TOKEN = process.env.GITLAB_TOKEN; // ton token

// 1️⃣ Récupère les groupes GitLab
async function fetchGitlabGroups() {
    const res = await axios.get(`${GITLAB_API_URL}/groups?per_page=100`, {
        headers: { Authorization: `Bearer ${GITLAB_TOKEN}` },
    });
    return res.data;
}

// 2️⃣ Crée un groupe GitLab
async function createGitlabGroup(name, parentId) {
    const payload = {
        name,
        path: name.toLowerCase().replace(/\s+/g, '-'),
        visibility: 'private',
        ...(parentId ? { parent_id: parentId } : {}),
    };
    const res = await axios.post(`${GITLAB_API_URL}/groups`, payload, {
        headers: { Authorization: `Bearer ${GITLAB_TOKEN}` },
    });
    return res.data;
}

// 3️⃣ Crée les projets CI/CD dans un groupe
async function createProjectsInGroup(groupId) {
    const projects = ['ci-config', 'cd-config'];
    const directories = {
        'ci-config': [
            'Dockerfiles/backup/Dockerfile',
            'Dockerfiles/php/Dockerfile',
        ],
        'cd-config': [
            'applications/manifests/production',
            'applications/resources',
            'infrastructure/manifests/cluster-prod/common',
            'infrastructure/resources/cluster-prod/common/argocd',
            'infrastructure/resources/cluster-prod/common/backups/templates',
            'infrastructure/resources/cluster-prod/production/registry-credentials',
        ],
    };

    for (const projectName of projects) {
        // a) création du projet
        const proj = await axios.post(
            `${GITLAB_API_URL}/projects`,
            {
                name: projectName,
                path: projectName.toLowerCase(),
                namespace_id: groupId,
                visibility: 'private',
                initialize_with_readme: true, // pour créer la branche main
            },
            { headers: { Authorization: `Bearer ${GITLAB_TOKEN}` } }
        );
        const projectId = proj.data.id;

        // b) création des fichiers / répertoires
        for (const dir of directories[projectName]) {
            const isDocker = dir.endsWith('Dockerfile');
            const isProductionManifest = dir === 'applications/manifests/production';

            let filePath, content;
            if (isDocker) {
                filePath = dir;
                content = dir.includes('backup')
                    ? `FROM alpine:latest
RUN apk add --no-cache bash curl rsync
CMD ["echo","Backup prêt"]`
                    : `FROM php:8.2-apache
COPY src/ /var/www/html/
EXPOSE 80`;
            } else if (isProductionManifest) {
                filePath = `${dir}/main.yaml`; // fichier vide
                content = 'apiVersion: argoproj.io/v1alpha1\n' +
                    'kind: AppProject\n' +
                    'metadata:\n' +
                    '  name: applications\n' +
                    '  namespace: argocd\n' +
                    'spec:\n' +
                    '  sourceRepos:\n' +
                    '  - \'*\'\n' +
                    '  destinations:\n' +
                    '  - server: https://kubernetes.default.svc\n' +
                    '    name: in-cluster\n' +
                    '    namespace: \'*\'\n' +
                    '  clusterResourceWhitelist:\n' +
                    '  - group: \'*\'\n' +
                    '    kind: \'*\'\n' +
                    '\n' +
                    '---\n' +
                    '\n' +
                    'apiVersion: argoproj.io/v1alpha1\n' +
                    'kind: Application\n' +
                    'metadata:\n' +
                    '  name: applications\n' +
                    '  namespace: argocd\n' +
                    'spec:\n' +
                    '  project: applications\n' +
                    '  source:\n' +
                    '    repoURL: \n' +
                    '    path: argocd/applications\n' +
                    '    targetRevision: HEAD\n' +
                    '  destination:\n' +
                    '    server: \'https://kubernetes.default.svc\'\n' +
                    '    namespace: argocd\n' +
                    '  syncPolicy:\n' +
                    '    automated: {}\n' +
                    '    syncOptions:\n' +
                    '      - CreateNamespace=true';
            } else {
                filePath = `${dir}/.gitkeep`; // placeholder
                content = '';
            }

            await axios.post(
                `${GITLAB_API_URL}/projects/${projectId}/repository/commits`,
                {
                    branch: 'main',
                    commit_message: `Ajout de ${filePath}`,
                    actions: [
                        {
                            action: 'create',
                            file_path: filePath,
                            content: Buffer.from(content).toString('base64'),
                            encoding: 'base64',
                        },
                    ],
                },
                { headers: { Authorization: `Bearer ${GITLAB_TOKEN}` } }
            );
        }
    }
}

module.exports = {
    fetchGitlabGroups,
    createGitlabGroup,
    createProjectsInGroup,
};
