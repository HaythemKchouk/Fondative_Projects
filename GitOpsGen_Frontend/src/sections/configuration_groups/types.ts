export interface Groupe {
  id: number;
  nom: string;
  gitlabId?: number;
}

export interface GitlabGroup {
  id: number;
  name: string;
  full_path: string;
}
