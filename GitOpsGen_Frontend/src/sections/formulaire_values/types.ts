export interface GitlabGroup {
  id: number;
  name: string;
  full_path: string;
  full_name: string;
}

export interface GitlabProject {
  id: number;
  name: string;
  path_with_namespace: string;
}

export interface RepoItem {
  id: string;
  name: string;
  type: 'tree' | 'blob';
  path: string;
}

// ✅ Ajouter cette interface pour corriger l’erreur TS2305
export interface ApiGroupWrapper {
  parent: GitlabGroup;
  subgroups: GitlabGroup[];
}
