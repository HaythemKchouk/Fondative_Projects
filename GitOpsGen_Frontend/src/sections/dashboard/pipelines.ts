/* eslint-disable perfectionist/sort-imports */
// Désactive la règle ESLint concernant l'ordre des imports

import { token, BATCH_SIZE, PIPELINE_FETCH_LIMIT } from './constants';
// Import des constantes : token d'authentification, taille des batchs et limite de pipelines à récupérer

import type { GroupWithChildren } from './types';
// Import du type décrivant un groupe avec ses sous-groupes

// Fonction qui vérifie si une date de création est dans la période filtrée (jour, semaine, ou tout)
function isWithinFilterDate(createdAt: string, dateFilter: 'all' | 'day' | 'week'): boolean {
  const createdDate = new Date(createdAt);
  const now = new Date();

  // Filtrer uniquement sur la date du jour
  if (dateFilter === 'day') {
    return createdDate.toDateString() === now.toDateString();
  }

  // Filtrer sur la dernière semaine (7 jours)
  if (dateFilter === 'week') {
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    return createdDate >= oneWeekAgo && createdDate <= now;
  }

  // Par défaut, on accepte toutes les dates
  return true;
}

// Fonction asynchrone qui récupère les stats des pipelines d'un projet donné
async function fetchPipelineStats(
  projectId: number,
  dateFilter: 'all' | 'day' | 'week',
  statusFilter: 'all' | 'success' | 'failed' | 'canceled'
) {
  // Appel API GitLab pour récupérer la liste des pipelines (limitée à PIPELINE_FETCH_LIMIT)
  const res = await fetch(
    `https://gitlab.com/api/v4/projects/${projectId}/pipelines?per_page=${PIPELINE_FETCH_LIMIT}`,
    { headers: { 'PRIVATE-TOKEN': token } }
  );

  // Si erreur HTTP, on retourne un objet vide avec compteurs à zéro
  if (!res.ok) return { total: 0, success: 0, failed: 0, canceled: 0, averageDuration: 0 };

  // Parse la réponse JSON contenant la liste des pipelines
  const pipelines = await res.json();

  // Variables pour compter le nombre de pipelines selon leur statut et la durée moyenne
  let total = 0, success = 0, failed = 0, canceled = 0;
  let totalDuration = 0, counted = 0; // totalDuration en secondes, counted = nombre de pipelines avec durée valide

  // Parcours de chaque pipeline récupéré
  for (const p of pipelines) {
    // Si la date de création n'existe pas ou ne correspond pas au filtre, on ignore
    if (!p.created_at || !isWithinFilterDate(p.created_at, dateFilter)) continue;

    // Si on filtre sur un statut précis différent de "all", on ignore ceux qui ne correspondent pas
    if (statusFilter !== 'all' && p.status !== statusFilter) continue;

    total++; // compteur total

    // Incrémente le compteur selon le statut
    if (p.status === 'success') success++;
    else if (p.status === 'failed') failed++;
    else if (p.status === 'canceled') canceled++;

    // On récupère les détails du pipeline pour calculer la durée
    const detailRes = await fetch(
      `https://gitlab.com/api/v4/projects/${projectId}/pipelines/${p.id}`,
      { headers: { 'PRIVATE-TOKEN': token } }
    );

    // Si la réponse est OK, on parse la durée entre début et fin
    if (detailRes.ok) {
      const detail = await detailRes.json();
      const start = detail.started_at ? new Date(detail.started_at) : null;
      const end = detail.finished_at ? new Date(detail.finished_at) : null;

      // Si dates valides et cohérentes, on ajoute la durée en secondes
      if (start && end && end > start) {
        totalDuration += (end.getTime() - start.getTime()) / 1000;
        counted++;
      }
    }
  }

  // Retourne un objet avec les statistiques calculées
  return {
    total,
    success,
    failed,
    canceled,
    // Durée moyenne : somme des durées divisée par le nombre de pipelines avec durée valide
    averageDuration: counted > 0 ? totalDuration / counted : 0,
  };
}

// Fonction générique pour exécuter des promesses par lot (batch) pour éviter d'envoyer trop de requêtes simultanément
async function batchPromises<T>(
  items: T[],                 // tableau d'éléments à traiter
  batchSize: number,          // taille du batch (nombre de requêtes en parallèle)
  fn: (item: T) => Promise<any> // fonction asynchrone à appliquer sur chaque élément
) {
  let results: any[] = [];

  // On découpe les items en tranche de batchSize
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Exécution parallèle des promesses pour ce batch
    const batchResults = await Promise.all(batch.map(fn));

    // On concatène les résultats obtenus
    results = results.concat(batchResults);
  }

  // Retourne la liste complète des résultats
  return results;
}

// Fonction principale pour calculer les compteurs des pipelines pour chaque groupe et ses sous-groupes
export async function calculatePipelineCounts(
  groups: GroupWithChildren[],                      // groupes à traiter (arborescence)
  dateFilter: 'all' | 'day' | 'week',               // filtre sur la date des pipelines
  statusFilter: 'all' | 'success' | 'failed' | 'canceled' // filtre sur le statut des pipelines
): Promise<void> {
  // On parcourt chaque groupe en parallèle
  await Promise.all(
    groups.map(async (group) => {
      // Import dynamique pour éviter import circulaire
      const projectIds = await import('./groups').then(({ fetchProjectsFromGroup }) =>
        fetchProjectsFromGroup(group.id) // récupère les IDs des projets GitLab du groupe
      );

      // Récupère les stats des pipelines des projets par lots
      const stats = await batchPromises(
        projectIds,
        BATCH_SIZE,
        (pid) => fetchPipelineStats(pid, dateFilter, statusFilter)
      );

      // Agrégation des totaux sur tous les projets du groupe
      const total = stats.reduce((s, st) => s + st.total, 0);
      const success = stats.reduce((s, st) => s + st.success, 0);
      const failed = stats.reduce((s, st) => s + st.failed, 0);
      const canceled = stats.reduce((s, st) => s + st.canceled, 0);

      // Calcul de la durée moyenne globale (en sommant puis divisant par le nombre de stats avec durée)
      const avgDur =
        stats.filter((st) => st.averageDuration).reduce((s, st) => s + st.averageDuration, 0) /
        (stats.filter((st) => st.averageDuration).length || 1);

      if (group.children.length) {
        // Si le groupe a des sous-groupes, on calcule récursivement leurs compteurs
        await calculatePipelineCounts(group.children, dateFilter, statusFilter);

        // On additionne les compteurs du groupe avec ceux de ses enfants (sous-groupes)
        group.pipelineCount = total + group.children.reduce((s, c) => s + c.pipelineCount, 0);
        group.successCount = success + group.children.reduce((s, c) => s + c.successCount, 0);
        group.failureCount = failed + group.children.reduce((s, c) => s + c.failureCount, 0);
        group.canceledCount = canceled + group.children.reduce((s, c) => s + c.canceledCount, 0);

        // Addition des durées moyennes du groupe et des enfants
        group.averageDuration = avgDur + group.children.reduce((s, c) => s + (c.averageDuration || 0), 0);
      } else {
        // Sinon, on remplit juste avec les stats du groupe seul
        group.pipelineCount = total;
        group.successCount = success;
        group.failureCount = failed;
        group.canceledCount = canceled;
        group.averageDuration = avgDur;
      }
    })
  );
}
