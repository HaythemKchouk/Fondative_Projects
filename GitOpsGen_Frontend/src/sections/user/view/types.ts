export type GitLabGroup = { id: number; name: string; path: string; };

export type User = { 
  id: number; 
  name: string; 
  mail: string; 
  role: string; 
  projets: string[]; 
  password: string; 
};
