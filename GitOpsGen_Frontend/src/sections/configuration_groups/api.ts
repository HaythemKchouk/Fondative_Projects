/* eslint-disable perfectionist/sort-imports */
// Désactive la règle ESLint qui impose un ordre strict des imports, pour éviter les erreurs lors du tri automatique.

import axios from 'axios'; 
// Import de la bibliothèque axios pour faire des requêtes HTTP facilement.

import { GitlabGroup } from './types';
// Import de l'interface TypeScript GitlabGroup pour typer la réponse des groupes GitLab.

const API_URL = 'http://localhost:3000/api';
// Définition de l'URL de base de l'API backend.

// Fonction asynchrone pour récupérer la liste des groupes GitLab depuis le backend.
// Renvoie un tableau typé GitlabGroup[].
export const fetchGitlabGroups = async () => {
  const response = await axios.get<GitlabGroup[]>(`${API_URL}/groups`);
  // Effectue une requête GET vers /groups et attend la réponse.
  return response.data;
  // Retourne uniquement les données de la réponse (le tableau des groupes).
};

// Fonction asynchrone pour créer un nouveau groupe via le backend.
// Prend en paramètres :
// - name : nom du groupe à créer
// - parentId (optionnel) : ID du groupe parent pour créer une hiérarchie
// Renvoie un objet contenant l'id du groupe créé.
export const createGroup = async (name: string, parentId?: number) => {
  const response = await axios.post<{ id: number }>(`${API_URL}/groups`, {
    name,
    parentId,
  });
  // Effectue une requête POST vers /groups avec le nom et éventuellement l'id du parent.
  return response.data;
  // Retourne les données de la réponse, ici l'id du groupe nouvellement créé.
};
