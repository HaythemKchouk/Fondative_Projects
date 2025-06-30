/* eslint-disable perfectionist/sort-imports */
// Import React et hooks utiles : useEffect (effets de bord), useState (état local), useMemo (mémoïsation)
import React, { useEffect, useState, useMemo } from 'react';

// Import des composants Material UI pour construire l'interface utilisateur
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

// Import des composants de graphique de la librairie Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Import des types TypeScript et des fonctions utilitaires pour les données
import type { GroupWithChildren, ArgoApplication } from './types';
import { fetchGroupsWithSubgroups, containsSubgroupWithNames, flattenGroups } from './groups';
import { calculatePipelineCounts } from './pipelines';
import { fetchArgoApplications } from './api';

// Composant fonctionnel Dashboard
export function Dashboard() {
  // États locaux pour stocker les données, état de chargement, erreurs et filtres
  const [groupPipelines, setGroupPipelines] = useState<GroupWithChildren[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'day' | 'week'>('all');  // filtre date pipelines
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'canceled'>('all');  // filtre statut pipelines

  // États spécifiques aux applications ArgoCD (chargement, erreur, données)
  const [argoApps, setArgoApps] = useState<ArgoApplication[]>([]);
  const [loadingArgo, setLoadingArgo] = useState(false);
  const [errorArgo, setErrorArgo] = useState<string | null>(null);

  // Combinaison des états loading et error des deux sources (GitLab et Argo)
  const loadingAll = loading || loadingArgo;
  const errorAll = error || errorArgo;

  // Effet React déclenché au montage du composant et à chaque changement des filtres date/statut
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchGroupsWithSubgroups() // récupère les groupes et sous-groupes GitLab
      .then((groups) =>
        calculatePipelineCounts(groups, dateFilter, statusFilter) // calcule les stats de pipelines par groupe selon filtres
          .then(() =>
            setGroupPipelines(groups.filter((g) => containsSubgroupWithNames(g, ['CI-CD', 'APPS']))) // garde que groupes avec certains sous-groupes
          )
      )
      .catch((e) => setError(e.message))  // capture les erreurs
      .finally(() => setLoading(false));  // met fin au chargement
  }, [dateFilter, statusFilter]);  // dépendances : refait le fetch à chaque changement de filtre

  // Effet React pour récupérer les applications ArgoCD au montage du composant
  useEffect(() => {
    setLoadingArgo(true);
    setErrorArgo(null);
    fetchArgoApplications()  // appelle l'API pour récupérer la liste des apps ArgoCD
      .then((apps) => setArgoApps(apps))
      .catch((e) => setErrorArgo(e.message))
      .finally(() => setLoadingArgo(false));
  }, []);  // tableau vide = appel une seule fois au montage

  // Mémoïsation du tableau aplati des groupes (avec tous les sous-groupes) pour optimiser les calculs
  const flatGroups = useMemo(() => flattenGroups(groupPipelines), [groupPipelines]);

  // Ajoute à chaque application ArgoCD le groupe GitLab correspondant, recalculé seulement si dépendances changent
  const argoWithGroup = useMemo(
    () =>
      argoApps.map((app) => ({
        ...app,
        group: findGroupForApp(app, flatGroups, groupPipelines),  // fonction pour mapper app à groupe GitLab
      })),
    [argoApps, flatGroups, groupPipelines]
  );

  // Prépare les données pour le graphique : nom du groupe et nombre de pipelines par statut
  const successRateData = groupPipelines.map((g) => ({
    name: g.name,
    success: g.successCount,
    failure: g.failureCount,
    canceled: g.canceledCount,
  }));

  // Rendu JSX du composant Dashboard
  return (
    <Box sx={{ p: 4 }}>
      {/* Titre section pipelines */}
      <Typography variant="h5" gutterBottom>
        Taux de réussite des Pipelines par Clients
      </Typography>

      {/* Filtres : sélection par date */}
      <FormControl sx={{ minWidth: 200, mb: 2, mr: 2 }}>
        <InputLabel id="date-filter-label">Filtrer par date</InputLabel>
        <Select
          labelId="date-filter-label"
          value={dateFilter}
          label="Filtrer par date"
          onChange={(e) => setDateFilter(e.target.value as any)}
        >
          <MenuItem value="all">Toutes les dates</MenuItem>
          <MenuItem value="day">Aujourd hui</MenuItem>
          <MenuItem value="week">Cette semaine</MenuItem>
        </Select>
      </FormControl>

      {/* Filtres : sélection par statut */}
      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel id="status-filter-label">Filtrer par statut</InputLabel>
        <Select
          labelId="status-filter-label"
          value={statusFilter}
          label="Filtrer par statut"
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <MenuItem value="all">Tous les statuts</MenuItem>
          <MenuItem value="success">Succès</MenuItem>
          <MenuItem value="failed">Échec</MenuItem>
          <MenuItem value="canceled">Annulé</MenuItem>
        </Select>
      </FormControl>

      {/* Affichage du spinner de chargement ou des erreurs ou des données */}
      {loadingAll ? (
        <CircularProgress />  // Indicateur de chargement si en cours
      ) : errorAll ? (
        <Alert severity="error">{errorAll}</Alert>  // Message d'erreur s'il y en a
      ) : (
        <>
          {/* Liste avec graphique et détail des groupes */}
          <List>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={successRateData}>
                <XAxis dataKey="name" />       {/* Axe X avec noms groupes */}
                <YAxis />                     {/* Axe Y */}
                <Tooltip />                   {/* Infobulle au survol */}
                <Legend />                    {/* Légende du graphique */}
                <Bar dataKey="success" name="Succès" fill="#4caf50" />  {/* Barres vertes succès */}
                <Bar dataKey="failure" name="Échecs" fill="#f44336" />  {/* Barres rouges échecs */}
                <Bar dataKey="canceled" name="Annulés" fill="#9e9e9e" />{/* Barres grises annulés */}
              </BarChart>
            </ResponsiveContainer>
            {/* Liste texte avec stats détaillées par groupe */}
            {groupPipelines.map((group) => (
              <ListItem key={group.id} divider>
                <ListItemText
                  primary={group.name}
                  secondary={`Pipelines: ${group.pipelineCount} | Succès: ${group.successCount} | Échecs: ${group.failureCount} | Annulés: ${group.canceledCount} | Durée Moyenne: ${group.averageDuration?.toFixed(2)}s`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Titre section ArgoCD */}
      <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
        Statut des applications ArgoCD
      </Typography>

      {/* Affichage liste des apps ArgoCD avec leur groupe GitLab et statut */}
      {loadingAll ? null : errorAll ? null : (
        <List>
          {argoWithGroup.map((app, idx) => (
            <ListItem key={idx} divider>
              <ListItemText
                primary={app.metadata.name}
                secondary={`Clients: ${app.group} | Santé: ${app.status.health.status} | Sync: ${app.status.sync.status}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

// Fonction pour associer une application ArgoCD à un groupe GitLab
function findGroupForApp(
  app: ArgoApplication,
  flat: GroupWithChildren[],
  roots: GroupWithChildren[]
): string {
  // Extraction des URLs de repos Git (source ou sources multiples)
  const urls: string[] = app.spec?.source
    ? [app.spec.source.repoURL]
    : app.spec?.sources?.map((s) => s.repoURL) || [];
  if (urls.length === 0) return 'Unknown';

  // On supprime le protocole (https://) et on découpe l'URL en segments, enlevant le premier et dernier (généralement org et repo)
  const repoURL = urls[0];
  const segments = repoURL.replace(/^https?:\/\//, '').split('/').slice(1, -1);
  if (segments.length === 0) return 'Unknown';

  // Recherche d'un groupe racine correspondant à la première partie de l'URL
  const first = segments[0];
  const rootMatch = roots.find(
    (g) => g.fullPath === first || g.fullPath?.startsWith(first + '/')
  );
  if (rootMatch) return rootMatch.name;

  // Recherche plus profonde dans les groupes aplatis via le chemin complet
  const ns = segments.join('/');
  const deepMatch = flat.find((g) => g.fullPath === ns);
  return deepMatch ? deepMatch.name : 'Unknown';  // Sinon renvoie 'Unknown'
}
