// Interface représentant un groupe GitLab avec ses sous-groupes et statistiques de pipelines
export interface GroupWithChildren {
  id: number;                  // Identifiant unique du groupe
  name: string;                // Nom du groupe
  fullPath?: string;           // Chemin complet du groupe (optionnel), utilisé notamment pour faire le lien avec ArgoCD
  pipelineCount: number;       // Nombre total de pipelines dans ce groupe (incluant ses projets)
  successCount: number;        // Nombre de pipelines réussis
  failureCount: number;        // Nombre de pipelines échoués
  canceledCount: number;       // Nombre de pipelines annulés
  averageDuration?: number;    // Durée moyenne des pipelines (en secondes), optionnel car peut ne pas être calculé
  children: GroupWithChildren[]; // Liste des sous-groupes de ce groupe, même structure récursive
}

// Interface représentant une application ArgoCD
export interface ArgoApplication {
  metadata: { 
    name: string;              // Nom de l'application ArgoCD
    namespace: string;         // Namespace Kubernetes où l'application est déployée
  };
  status: { 
    health: { status: string };  // État de santé de l'application (ex : Healthy, Degraded, etc.)
    sync: { status: string };    // État de synchronisation avec le repository Git (ex : Synced, OutOfSync)
  };
  spec?: {                     // Spécification de la source Git de l'application (optionnelle)
    source?: { 
      repoURL: string;         // URL du dépôt Git source (si unique)
    };
    sources?: Array<{ 
      repoURL: string;         // Liste des URLs des dépôts Git si l'application en utilise plusieurs
    }>;
  };
  group?: string;              // Nom du groupe GitLab associé à cette application ArgoCD (ajouté dynamiquement)
}
