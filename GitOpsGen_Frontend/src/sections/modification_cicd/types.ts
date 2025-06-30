export interface GitlabGroup {
  id: number;
  name: string;
  full_name: string;
}

export interface GitlabProject {
  id: number;
  name: string;
  path_with_namespace: string;
}

export interface GitlabFile {
  path: string;
  name: string;
  type: 'blob' | 'tree';
}

export type StageEntry = {
  name: string;
  enabled: boolean;
};
export interface ApiGroupWrapper {
  parent: GitlabGroup;
  subgroups: GitlabGroup[];
}
