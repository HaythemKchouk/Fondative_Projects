const fetch = require('node-fetch');

const headers = {
    'Private-Token': process.env.GITLAB_TOKEN,
};

if (!process.env.GITLAB_TOKEN) {
    console.error("Erreur: la variable d'environnement GITLAB_TOKEN n'est pas définie.");
}

// --- 1. Récupération des groupes filtrés ---
exports.fetchFilteredGroups = async () => {
    try {
        const res = await fetch('https://gitlab.com/api/v4/groups?top_level_only=true&per_page=100', { headers });
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`GitLab API error: ${res.status} ${res.statusText} - ${errorText}`);
            throw new Error(`Erreur lors de la récupération des groupes: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();

        const result = [];
        for (const g of data) {
            const subRes = await fetch(`https://gitlab.com/api/v4/groups/${g.id}/subgroups?per_page=100`, { headers });
            if (!subRes.ok) {
                const subErrorText = await subRes.text();
                console.error(`GitLab API subgroups error: ${subRes.status} ${subRes.statusText} - ${subErrorText}`);
                throw new Error('Erreur lors de la récupération des sous-groupes');
            }
            const subs = await subRes.json();
            const filteredSubs = subs.filter(s => ['APPS', 'CI-CD'].includes(s.name));

            // On ajoute le parent et ses sous-groupes filtrés
            result.push({
                parent: g,
                subgroups: filteredSubs
            });
        }

        return result;
    } catch (error) {
        console.error('fetchFilteredGroups error:', error);
        throw new Error('Impossible de récupérer les groupes filtrés');
    }
};


// --- 2. Récupération des projets ---
exports.fetchProjects = async (groupId) => {
    if (!process.env.GITLAB_TOKEN) {
        throw new Error('Token GitLab manquant (GITLAB_TOKEN non défini)');
    }

    try {
        const res = await fetch(`https://gitlab.com/api/v4/groups/${groupId}/projects?per_page=100`, { headers });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Erreur récupération projets: ${res.status} ${res.statusText} - ${text}`);
        }
        return await res.json();
    } catch (error) {
        console.error('fetchProjects error:', error);
        throw new Error('Impossible de récupérer les projets');
    }
};

// --- 3. Création d’un projet GitLab ---
exports.createAppProject = async ({ name, namespace_id }) => {
    if (!process.env.GITLAB_TOKEN) {
        throw new Error('Token GitLab manquant (GITLAB_TOKEN non défini)');
    }

    const body = {
        name,
        path: name.toLowerCase().replace(/\s+/g, '-'),
        namespace_id,
        visibility: 'private',
    };

    try {
        const res = await fetch('https://gitlab.com/api/v4/projects', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Erreur création projet: ${res.status} ${res.statusText} - ${text}`);
        }
        return await res.json();
    } catch (error) {
        console.error('createAppProject error:', error);
        throw new Error('Erreur lors de la création du projet');
    }
};

// --- 4. Création d’un dossier CI-CD (avec .gitkeep) ---
exports.createCiCdFolder = async ({ projectId, folderName }) => {
    if (!process.env.GITLAB_TOKEN) {
        throw new Error('Token GitLab manquant (GITLAB_TOKEN non défini)');
    }

    const body = {
        branch: 'main',
        commit_message: `Création du dossier ${folderName}`,
        actions: [
            {
                action: 'create',
                file_path: `applications/resources/${folderName}/.gitkeep`,
                content: '',
            },
        ],
    };

    try {
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Erreur création dossier CI-CD: ${res.status} ${res.statusText} - ${text}`);
        }
        return await res.json();
    } catch (error) {
        console.error('createCiCdFolder error:', error);
        throw new Error('Erreur lors de la création du dossier CI-CD');
    }
};

// --- 5. Fonction générique pour commit de fichier (création / mise à jour) ---
exports.commitFile = async (projectId, { branch = 'main', commitMessage, path, content, action = 'create' }) => {
    if (!process.env.GITLAB_TOKEN) {
        throw new Error('Token GitLab manquant (GITLAB_TOKEN non défini)');
    }

    const body = {
        branch,
        commit_message: commitMessage,
        actions: [
            {
                action,  // 'create', 'update', 'delete'
                file_path: path,
                content,
            },
        ],
    };

    try {
        const res = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Erreur commit fichier: ${res.status} ${res.statusText} - ${text}`);
        }

        return await res.json();
    } catch (error) {
        console.error('commitFile error:', error);
        throw new Error('Erreur lors du commit du fichier');
    }
};

// --- 6. Création d’un fichier YAML dans manifests/production ---
exports.createCiCdYamlFile = async ({ projectId, folderName }) => {
    // Fichier YAML directement sous manifests/production sans dossier supplémentaire
    const yamlFilePath = `applications/manifests/production/${folderName}.yaml`;
    const fileContent = `# Fichier YAML pour ${folderName}\n`;

    try {
        return await exports.commitFile(projectId, {
            path: yamlFilePath,
            content: fileContent,
            commitMessage: `Création du fichier YAML ${folderName}.yaml dans manifests/production`,
            action: 'create',
        });
    } catch (error) {
        console.error('createCiCdYamlFile error:', error);
        throw error;
    }
};
