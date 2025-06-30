/* eslint-disable perfectionist/sort-imports */
// Désactive la règle ESLint qui impose un ordre strict dans les imports

import React from 'react';
// Import de React (obligatoire pour les composants JSX)

import {
  List, ListItem, ListItemText, IconButton, Typography
} from '@mui/material';
// Import des composants d'interface de Material UI utilisés pour la liste, les boutons et les textes

import { Delete } from '@mui/icons-material';
// Icône de corbeille utilisée pour la suppression d'un groupe

import { Groupe } from './types';
// Import du type `Groupe` défini dans un fichier local `types.ts`

// Définition des props attendues par le composant GroupsList
interface Props {
  groupes: Groupe[];             // Liste des groupes à afficher
  onDelete: (id: number) => void; // Fonction à appeler quand on supprime un groupe
}

// Définition du composant fonctionnel GroupsList
export function GroupsList({ groupes, onDelete }: Props) {
  return (
    <>
      {/* Titre au-dessus de la liste */}
      <Typography variant="subtitle1" gutterBottom>
        Clients créés
      </Typography>

      {/* Composant de liste Material UI */}
      <List>
        {groupes.map((g) => (
          // Élément de liste pour chaque groupe
          <ListItem
            key={g.id} // Clé unique obligatoire dans les listes React
            secondaryAction={
              // Bouton de suppression aligné à droite
              <IconButton onClick={() => onDelete(g.id)}>
                <Delete /> {/* Icône poubelle */}
              </IconButton>
            }
          >
            {/* Texte principal et secondaire affichant le nom du groupe et son ID GitLab */}
            <ListItemText primary={g.nom} secondary={`GitLab ID: ${g.gitlabId}`} />
          </ListItem>
        ))}
      </List>
    </>
  );
}
