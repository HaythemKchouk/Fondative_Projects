const API = import.meta.env.VITE_API_URL || '/api';

export async function fetchGroups() {
  const res = await fetch(`${API}/gitlab/helmcharts/groups`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchSubgroups(groupId: string) {
  const res = await fetch(`${API}/gitlab/helmcharts/groups/${groupId}/subgroups`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchProjects(subgroupId: string) {
  const res = await fetch(`${API}/gitlab/helmcharts/groups/${subgroupId}/projects?search=cd-config`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchFolders(projectId: number, path: string) {
  const res = await fetch(
    `${API}/gitlab/helmcharts/projects/${projectId}/repository/tree?path=${encodeURIComponent(path)}`
  );
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function uploadFiles(projectId: number, currentPath: string, files: File[]) {
  // Ne pas redéclarer API ici !
  const fd = new FormData();
  files.forEach(f => {
    fd.append('files', f);
    fd.append('paths', f.webkitRelativePath || f.name);
  });
  fd.append('projectId', projectId.toString());
  fd.append('currentPath', currentPath);

  const res = await fetch(`${API}/gitlab/helmcharts/upload`, {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
}
