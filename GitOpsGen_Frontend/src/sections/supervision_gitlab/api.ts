import { Group, Project, Pipeline, Job, ArgoApp } from './types';

const gitlabToken = 'glpat-SDBni-qYtBM1xP_6czHo';
const argoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.spIndGSeNEmURn9vn6Pvxn-l2ZsJy-YPSWhoyKoyRcs';

export async function fetchGroups(): Promise<Group[]> {
  const res = await fetch('https://gitlab.com/api/v4/groups?min_access_level=20&per_page=100', {
    headers: { 'PRIVATE-TOKEN': gitlabToken },
  });
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();
  return data.map((g: any) => ({
    id: g.id,
    name: g.name,
    full_path: g.full_path,
    parent_id: g.parent_id,
  }));
}

export async function fetchSubgroups(id: number): Promise<Group[]> {
  const res = await fetch(`https://gitlab.com/api/v4/groups/${id}/subgroups?per_page=100`, {
    headers: { 'PRIVATE-TOKEN': gitlabToken },
  });
  if (!res.ok) throw new Error(res.statusText);
  return await res.json();
}

export async function fetchProjects(id: number): Promise<Project[]> {
  const res = await fetch(`https://gitlab.com/api/v4/groups/${id}/projects?per_page=100`, {
    headers: { 'PRIVATE-TOKEN': gitlabToken },
  });
  if (!res.ok) throw new Error(res.statusText);
  return await res.json();
}

export async function fetchPipelines(id: number): Promise<Pipeline[]> {
  const res = await fetch(`https://gitlab.com/api/v4/projects/${id}/pipelines?per_page=20`, {
    headers: { 'PRIVATE-TOKEN': gitlabToken },
  });
  if (!res.ok) throw new Error(res.statusText);
  const data: Pipeline[] = await res.json();
  data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  return data;
}

export async function fetchPipelineJobs(projId: number, pipeId: number): Promise<Job[]> {
  const res = await fetch(
    `https://gitlab.com/api/v4/projects/${projId}/pipelines/${pipeId}/jobs?${Date.now()}`,
    { headers: { 'PRIVATE-TOKEN': gitlabToken }, cache: 'no-cache' }
  );
  if (!res.ok) throw new Error(res.statusText);
  return await res.json();
}

export async function fetchArgoApps(): Promise<ArgoApp[]> {
  const res = await fetch('/argo/api/v1/applications', {
    headers: { Authorization: `Bearer ${argoToken}` },
  });
  if (!res.ok) throw new Error(`ArgoCD ${res.status}`);
  const data = await res.json();
  return data.items || [];
}
