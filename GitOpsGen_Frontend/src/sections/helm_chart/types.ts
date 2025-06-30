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

export interface GitlabTreeItem {
  id: string;
  name: string;
  type: 'tree' | 'blob';
  path: string;
}
