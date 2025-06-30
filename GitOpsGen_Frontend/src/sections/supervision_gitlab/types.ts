export interface Group {
  id: number;
  name: string;
  full_path: string;
  parent_id?: number | null;
}

export interface Project {
  id: number;
  name: string;
}

export interface Pipeline {
  id: number;
  status: string;
  ref: string;
  updated_at: string;
}

export interface Job {
  id: number;
  name: string;
  stage: string;
  status: 'success' | 'failed' | 'running' | 'pending' | 'canceled' | 'skipped';
}

export interface ArgoApp {
  metadata: { name: string };
  status: { health: { status: string }; sync: { status: string } };
  spec?: {
    source?: { repoURL?: string };
    sources?: { repoURL?: string }[];
  };
}
