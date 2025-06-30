// Interface représentant un groupe GitLab
export interface GitlabGroup {
  id: number;           // Identifiant unique du groupe
  name: string;         // Nom court du groupe (ex. : "APPS", "CI-CD")
  full_path: string;    // Chemin complet du groupe dans GitLab (ex. : "organisation/ci-cd")
  full_name: string;    // Nom complet affiché dans l'interface (ex. : "Organisation / CI-CD")
}

// Interface représentant un wrapper contenant un groupe parent et ses sous-groupes
export interface ApiGroupWrapper {
  parent: GitlabGroup;         // Groupe racine (ex. : "Organisation")
  subgroups: GitlabGroup[];    // Liste des sous-groupes associés (ex. : ["CI-CD", "APPS"])
}

// Interface représentant un projet GitLab
export interface GitlabProject {
  id: number;                    // Identifiant unique du projet
  name: string;                  // Nom du projet (ex. : "cd-config")
  path_with_namespace: string;  // Chemin complet du projet dans GitLab (ex. : "org/ci-cd/cd-config")
}
