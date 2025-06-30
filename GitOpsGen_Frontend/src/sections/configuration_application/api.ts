/* eslint-disable perfectionist/sort-imports */
import { ApiGroupWrapper, GitlabProject } from './types';

export async function fetchGitlabGroups(): Promise<ApiGroupWrapper[]> {
  const res = await fetch('/api/gitlab/groups');
  if (!res.ok) throw new Error('Erreur lors de la récupération des groupes');
  return res.json();
}

export async function fetchSubgroups(groupId: string) {
  const res = await fetch(`/api/gitlab/helmcharts/groups/${groupId}/subgroups`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchProjects(groupId: number): Promise<GitlabProject[]> {
  const res = await fetch(`/api/gitlab/groups/${groupId}/projects`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des projets CI‑CD');
  return res.json();
}

export async function createApp(name: string, namespaceId: number) {
  const res = await fetch('/api/gitlab/apps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, namespace_id: namespaceId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createCICDFolder(projectId: number, folderName: string) {
  const res = await fetch('/api/gitlab/cicd-folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, folderName }),
  });
  if (!res.ok) throw new Error(await res.text());
}
