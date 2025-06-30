/* eslint-disable perfectionist/sort-imports */
// Désactive la règle ESLint qui vérifie l'ordre des imports

import { token } from './constants';  // Import du token d'authentification pour l'API GitLab

import type { GroupWithChildren } from './types';  // Import du type TypeScript décrivant un groupe avec ses sous-groupes

// Fonction asynchrone pour récupérer les groupes GitLab avec leurs sous-groupes récursivement
export async function fetchGroupsWithSubgroups(parentId?: number): Promise<GroupWithChildren[]> {
  // Si un parentId est fourni, on récupère les sous-groupes de ce groupe,
  // sinon on récupère les groupes de premier niveau avec un niveau d'accès minimum de 20
  const url = parentId
    ? `https://gitlab.com/api/v4/groups/${parentId}/subgroups?per_page=100`
    : `https://gitlab.com/api/v4/groups?min_access_level=20&per_page=100`;

  // Appel API GET avec le token privé dans les headers pour s'authentifier
  const res = await fetch(url, { headers: { 'PRIVATE-TOKEN': token } });

  // Si la réponse n'est pas OK (ex : erreur 4xx/5xx), on retourne un tableau vide
  if (!res.ok) return [];

  // On parse la réponse JSON qui contient un tableau de groupes
  const groups = await res.json();

  // Pour chaque groupe reçu, on construit un objet GroupWithChildren,
  // et on appelle récursivement la fonction pour récupérer ses sous-groupes
  return Promise.all(
    groups.map(async (group: any) => ({
      id: group.id,
      name: group.name,
      fullPath: group.full_path,   // chemin complet du groupe
      pipelineCount: 0,            // initialisation des compteurs pour pipelines et états
      successCount: 0,
      failureCount: 0,
      canceledCount: 0,
      averageDuration: 0,
      children: await fetchGroupsWithSubgroups(group.id),  // sous-groupes (récursion)
    }))
  );
}

// Fonction asynchrone qui récupère les projets d'un groupe donné par son ID
export async function fetchProjectsFromGroup(groupId: number): Promise<number[]> {
  // Appel API pour récupérer les projets liés à un groupe (max 100 par page)
  const res = await fetch(
    `https://gitlab.com/api/v4/groups/${groupId}/projects?per_page=100`,
    { headers: { 'PRIVATE-TOKEN': token } }
  );

  // Si erreur HTTP, retourne tableau vide
  if (!res.ok) return [];

  // Parse JSON réponse contenant la liste des projets
  const projects = await res.json();

  // Retourne un tableau d'IDs des projets
  return projects.map((p: any) => p.id);
}

// Fonction qui vérifie si un groupe contient un sous-groupe dont le nom figure dans une liste donnée
export function containsSubgroupWithNames(
  group: GroupWithChildren,
  included: string[]
): boolean {
  // Parcours récursif des enfants (sous-groupes)
  for (const child of group.children) {
    // Si le nom du sous-groupe est dans la liste, retourne true
    if (included.includes(child.name)) return true;
    // Sinon on vérifie récursivement ses enfants
    if (containsSubgroupWithNames(child, included)) return true;
  }
  // Si aucun sous-groupe ne correspond, retourne false
  return false;
}

// Fonction qui aplatit une hiérarchie de groupes en un tableau simple de tous les groupes et sous-groupes
export function flattenGroups(groups: GroupWithChildren[]): GroupWithChildren[] {
  // Reduce concatène chaque groupe avec la liste aplatie de ses enfants (récursivement)
  return groups.reduce(
    (acc, g) => acc.concat(g, flattenGroups(g.children)),
    [] as GroupWithChildren[]  // type initial : tableau vide
  );
}
