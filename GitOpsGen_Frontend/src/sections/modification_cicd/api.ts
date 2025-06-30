// api.ts
import { GitlabGroup, GitlabProject, GitlabFile, ApiGroupWrapper } from './types';

// Cette fonction retourne les groupes avec leur parent
export async function fetchGroups(token: string): Promise<ApiGroupWrapper[]> {
  const res = await fetch('https://gitlab.com/api/v4/groups?top_level_only=true&per_page=100', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data: GitlabGroup[] = await res.json();
  const result: ApiGroupWrapper[] = [];

  for (const parentGroup of data) {
    const subRes = await fetch(
      `https://gitlab.com/api/v4/groups/${parentGroup.id}/subgroups?per_page=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const subData: GitlabGroup[] = await subRes.json();

    result.push({
      parent: parentGroup,
      subgroups: subData.filter((sg) => sg.name === 'CI-CD'),
    });
  }

  return result;
}

export async function fetchProjects(groupId: string, token: string): Promise<GitlabProject[]> {
  const res = await fetch(
    `https://gitlab.com/api/v4/groups/${groupId}/projects?per_page=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return await res.json();
}

export async function fetchYamlFiles(projectId: string, token: string): Promise<GitlabFile[]> {
  const tokenHeader = { Authorization: `Bearer ${token}` };
  const branches = ['main'];  // uniquement main
  const paths = [''];          // uniquement racine

  for (const branch of branches) {
    for (const dir of paths) {
      const params = new URLSearchParams({
        ref: branch,
        per_page: '100',
        ...(dir ? { path: dir } : {}),
      });

      const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/tree?${params}`;
      console.log(`Fetching YAML files from: ${url}`);

      const res = await fetch(url, { headers: tokenHeader });

      if (!res.ok) {
        console.warn(`Fetch failed for ${url}: ${res.status} ${res.statusText}`);
        continue;
      }

      const data: GitlabFile[] = await res.json();
      const yamls = data.filter((f) => f.type === 'blob' && /\.ya?ml$/i.test(f.name));

      if (yamls.length) {
        console.log(`YAML files found: ${yamls.map(f => f.name).join(', ')}`);
        return yamls;
      }
    }
  }

  throw new Error('Aucun fichier YAML trouvé.');
}


export async function fetchYamlContent(projectId: string, filePath: string, token: string): Promise<string> {
  const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}/raw?ref=main`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Impossible de lire le fichier YAML');
  return await res.text();
}

export async function commitChanges(
  projectId: string,
  filePath: string,
  newContent: string,
  token: string
): Promise<void> {
  const payload = {
    branch: 'main',
    commit_message: `Mise à jour de ${filePath} : commentaires des stages`,
    actions: [{ action: 'update', file_path: filePath, content: newContent }],
  };

  const res = await fetch(
    `https://gitlab.com/api/v4/projects/${projectId}/repository/commits`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }
}
