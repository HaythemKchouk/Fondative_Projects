import React from 'react';
// Import de React nécessaire pour définir un composant fonctionnel.

import {
  Box, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';  
// Import des composants MUI (Material UI) utilisés pour la construction de l'interface utilisateur.

import { GitlabGroup } from './types';  
// Import de l'interface GitlabGroup locale, qui sert à typer la liste des groupes.

interface Props {
  gitlabGroups: GitlabGroup[];                  // Liste des groupes GitLab à afficher dans le select
  selectedParentId: number | '';                 // Id du groupe parent actuellement sélectionné, ou '' si aucun
  setSelectedParentId: (id: number | '') => void; // Fonction pour modifier la sélection du groupe parent
  selectedOption: string;                        // Option sélectionnée dans le deuxième select (type client)
  setSelectedOption: (val: string) => void;      // Fonction pour modifier cette option sélectionnée
  onSubmit: () => void;                          // Fonction déclenchée au clic sur le bouton "Ajouter"
}

export function ConfigurationForm({
  gitlabGroups,
  selectedParentId,
  setSelectedParentId,
  selectedOption,
  setSelectedOption,
  onSubmit,
}: Props) {
  return (
    // Container horizontal avec espace entre éléments et marge en bas
    <Box display="flex" gap={2} mb={2}> 

      {/* Premier FormControl pour sélectionner un groupe parent */}
      <FormControl fullWidth>
        <InputLabel>Clients</InputLabel>
        <Select
          value={selectedParentId}                      // Valeur sélectionnée
          onChange={(e) => setSelectedParentId(Number(e.target.value))} // Met à jour la sélection avec l'id choisi
          label="Parent GitLab"
          renderValue={(v) => {                         // Fonction pour afficher la valeur sélectionnée
            if (!v) return 'Aucun';                     // Si aucune sélection, afficher "Aucun"
            const g = gitlabGroups.find((x) => x.id === v); // Recherche du groupe correspondant à l'id sélectionné
            return g ? g.name : 'Inconnu';              // Affiche le nom du groupe, ou "Inconnu" si pas trouvé
          }}
        >
          <MenuItem value="">Aucun</MenuItem>            {/* Option vide */}
          {/* On filtre les groupes pour ne pas afficher les groupes APPS et CI-CD seuls */}
          {gitlabGroups
            .filter((g) => g.name !== 'APPS' && g.name !== 'CI-CD')
            .map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}                                  {/* Affiche le nom du groupe */}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Deuxième FormControl pour sélectionner le type de client */}
      <FormControl fullWidth>
        <InputLabel>Type de Clients</InputLabel>
        <Select
          value={selectedOption}                        // Valeur sélectionnée
          onChange={(e) => setSelectedOption(e.target.value)} // Met à jour la sélection
          label="Type de Clients"
        >
          <MenuItem value="APPS">APPS</MenuItem>       {/* Option APPS */}
          <MenuItem value="CI-CD">CI-CD</MenuItem>     {/* Option CI-CD */}
        </Select>
      </FormControl>

      {/* Bouton pour valider et ajouter le groupe */}
      <Button variant="contained" color="primary" onClick={onSubmit}>
        Ajouter
      </Button>
    </Box>
  );
}
