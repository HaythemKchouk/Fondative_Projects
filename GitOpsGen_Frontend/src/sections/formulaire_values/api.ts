/* eslint-disable perfectionist/sort-imports */
// api.ts
import { GitlabGroup, GitlabProject, ApiGroupWrapper } from './types';


export async function fetchGitlabGroups(): Promise<ApiGroupWrapper[]> {
  const res = await fetch('/api/gitlab/groups');
  if (!res.ok) throw new Error('Erreur lors de la récupération des groupes');
  return res.json();
}

// api.ts
export async function fetchSubgroups(groupId: string): Promise<GitlabGroup[]> {
  console.log(`[API] Fetching subgroups for groupId: ${groupId}`);
  const res = await fetch(`/api/gitlab/helmcharts/groups/${groupId}/subgroups`);
  console.log(`[API] Status: ${res.status}`);

  if (!res.ok) {
    const errText = await res.text();
    console.error('[API] Erreur réponse brut:', errText);
    throw new Error(res.statusText);
  }

  const json = await res.json();
  console.log('[API] Subgroups JSON:', json);
  return json;
}


export async function fetchProjects(groupId: number): Promise<GitlabProject[]> {
  const res = await fetch(`/api/gitlab/groups/${groupId}/projects`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des projets CI‑CD');
  return res.json();
}
