/* eslint-disable perfectionist/sort-imports */
// Désactive temporairement la règle ESLint "perfectionist/sort-imports" pour ce fichier,
// évitant les erreurs liées à l'ordre ou à l'espacement des imports.

import { token, argoToken } from './constants';
// Importe deux constantes `token` et `argoToken` depuis le fichier 'constants'.
// `argoToken` sera utilisé comme token d'authentification pour les requêtes à ArgoCD.

import type { ArgoApplication } from './types';
// Importe uniquement le type TypeScript `ArgoApplication` depuis 'types'.
// Ceci sert à typer la fonction et garantir la cohérence des données manipulées.

export async function fetchArgoApplications(): Promise<ArgoApplication[]> {
  // Fonction asynchrone qui retourne une promesse résolvant un tableau d'objets `ArgoApplication`.
  // Elle va récupérer la liste des applications ArgoCD via l'API.

  const res = await fetch('/argo/api/v1/applications', {
    // Effectue une requête HTTP GET vers l'endpoint '/argo/api/v1/applications'
    // pour récupérer la liste des applications.
    headers: { Authorization: `Bearer ${argoToken}` },
    // Ajoute un header d'autorisation avec un Bearer token pour authentification.
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Si la réponse HTTP n'est pas OK (code 200-299), lance une erreur avec le code HTTP.

  const data = await res.json();
  // Parse la réponse JSON en un objet JavaScript.

  const items = data.items || data.applications || [];
  // Récupère la liste des applications dans la propriété 'items' ou 'applications' de la réponse.
  // Si aucune de ces propriétés n'existe, utilise un tableau vide.

  const detailed = await Promise.all(
    // Utilise Promise.all pour lancer en parallèle plusieurs requêtes asynchrones,
    // et attendre que toutes soient terminées avant de continuer.

    items.map(async (app: any) => {
      // Pour chaque application dans la liste 'items', on exécute cette fonction asynchrone.

      const resDetail = await fetch(`/argo/api/v1/applications/${app.metadata.name}`, {
        // Requête HTTP GET pour récupérer les détails de l'application spécifique,
        // en utilisant son nom extrait de `app.metadata.name`.

        headers: { Authorization: `Bearer ${argoToken}` },
        // Même header d'authentification que précédemment.
      });

      return resDetail.ok ? await resDetail.json() : app;
      // Si la réponse est OK, on retourne les détails parsés en JSON,
      // sinon on retourne l'objet 'app' original (sans détail).
    })
  );

  return detailed;
  // Renvoie finalement la liste complète des applications avec leurs détails (ou original si échec).
}
