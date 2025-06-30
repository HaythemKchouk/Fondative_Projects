/* eslint-disable perfectionist/sort-imports */
// Désactive la règle ESLint qui impose un ordre strict pour les imports

import React, { useEffect, useState } from 'react';
// Import de React et des hooks d'état et d'effet

import { Box, Card, Typography, Divider } from '@mui/material';
// Import de composants Material UI pour construire l'interface utilisateur

import { Groupe, GitlabGroup } from './types';
// Import des interfaces TypeScript personnalisées pour typer les données

import { fetchGitlabGroups, createGroup } from './api';
// Import des fonctions API pour récupérer les groupes GitLab et créer un groupe

import { ConfigurationForm } from './ConfigurationForm';
// Import du formulaire de configuration pour sélectionner les groupes

import { GroupsList } from './GroupsList';
// Import du composant qui affiche la liste des groupes créés

export function ConfigurationGroupsView() {
  // Déclaration des états React
  const [selectedOption, setSelectedOption] = useState<string>('');  
  // Type de client sélectionné (ex: "APPS", "CI-CD")
  
  const [groupes, setGroupes] = useState<Groupe[]>([]);  
  // Liste locale des groupes créés
  
  const [gitlabGroups, setGitlabGroups] = useState<GitlabGroup[]>([]);  
  // Liste des groupes GitLab récupérés depuis le backend
  
  const [selectedParentId, setSelectedParentId] = useState<number | ''>('');  
  // Id du groupe parent sélectionné dans le formulaire

  // useEffect appelé une fois au montage du composant
  useEffect(() => {
    fetchGitlabGroups()
      .then(setGitlabGroups)  
      // Met à jour la liste des groupes GitLab récupérés
      .catch((err) => console.error('Erreur fetch groups:', err));  
      // Log des erreurs éventuelles
  }, []);

  // Fonction asynchrone pour créer un groupe via l'API
  const handleAddGroup = async () => {
    if (!selectedOption.trim()) return;  
    // Ne rien faire si la sélection est vide ou ne contient que des espaces

    try {
      // Appel API pour créer le groupe avec le nom et l'id du parent (optionnel)
      const { id } = await createGroup(selectedOption, selectedParentId || undefined);

      // Création d'un objet groupe local avec un ID temporaire (timestamp)
      const newGroup: Groupe = {
        id: Date.now(),
        nom: selectedOption,
        gitlabId: id,  // ID retourné par l'API GitLab
      };

      // Ajoute ce nouveau groupe à la liste locale (état)
      setGroupes((prev) => [...prev, newGroup]);

      // Réinitialise les champs de sélection
      setSelectedOption('');
      setSelectedParentId('');
    } catch (err: any) {
      // Affiche une erreur dans la console et en alerte si création échoue
      console.error('Erreur création via backend:', err.response?.data || err.message);
      alert('Impossible de créer le groupe.');
    }
  };

  // Fonction pour supprimer un groupe de la liste locale par son ID
  const handleDeleteGroup = (id: number) => {
    setGroupes((gs) => gs.filter((g) => g.id !== id));
  };

  return (
    <Box p={2}>
      {/* Carte contenant toute la configuration */}
      <Card sx={{ boxShadow: 3, borderRadius: 2, p: 3 }}>
        {/* Titre */}
        <Typography variant="h6" gutterBottom>
          Configuration des Clients
        </Typography>

        {/* Séparateur visuel */}
        <Divider sx={{ my: 2 }} />

        {/* Formulaire pour choisir groupe parent et type */}
        <ConfigurationForm
          gitlabGroups={gitlabGroups}             // Liste des groupes GitLab pour le select
          selectedParentId={selectedParentId}     // Id groupe parent sélectionné
          setSelectedParentId={setSelectedParentId} // Fonction pour modifier ce choix
          selectedOption={selectedOption}          // Type sélectionné (APPS/CI-CD)
          setSelectedOption={setSelectedOption}   // Fonction pour modifier ce choix
          onSubmit={handleAddGroup}                // Fonction appelée au clic sur "Ajouter"
        />

        {/* Séparateur visuel */}
        <Divider sx={{ my: 2 }} />

        {/* Liste des groupes créés, avec possibilité de suppression */}
        <GroupsList groupes={groupes} onDelete={handleDeleteGroup} />
      </Card>
    </Box>
  );
}
