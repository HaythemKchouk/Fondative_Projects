/* eslint-disable perfectionist/sort-imports */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
} from '@mui/material';

import {
  fetchGitlabGroups,
  fetchProjects,
  fetchSubgroups,
  createApp,
  createCICDFolder,
} from './api';

import { ApiGroupWrapper, GitlabGroup, GitlabProject } from './types';
import { filterGroups, parseAllowedParents } from './helpers';

export function ConfigurationForm() {
  const [gitlabGroups, setGitlabGroups] = useState<GitlabGroup[]>([]);
  const [subgroups, setSubgroups] = useState<GitlabGroup[]>([]);
  const [projects, setProjects] = useState<GitlabProject[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [folderName, setFolderName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const rawProjets = user.projets || '';
  const allowedParents = parseAllowedParents(rawProjets);

  // Charger groupes filtrés au montage
  useEffect(() => {
    setLoading(true);
    setApiError(null);
    fetchGitlabGroups()
      .then((data: ApiGroupWrapper[]) => {
        const filteredGroups = data.flatMap(wrapper =>
          wrapper.subgroups.length > 0 ? wrapper.subgroups : [wrapper.parent]
        );
        const groupsFilteredByAllowedParents = filterGroups(filteredGroups, allowedParents);
        setGitlabGroups(groupsFilteredByAllowedParents);
      })
      .catch(err => setApiError(`Erreur récupération groupes: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  // Charger sous-groupes à la sélection d'un groupe
  useEffect(() => {
    setSubgroups([]);
    setSelectedSubgroupId('');
    setProjects([]);
    setProjectName('');
    setFolderName('');
    setApiError(null);
    setSuccess(null);

    if (!selectedGroupId) return;

    setLoading(true);
    fetchSubgroups(selectedGroupId)
      .then(data => setSubgroups(data))
      .catch(err => setApiError(`Erreur récupération sous-groupes: ${err.message}`))
      .finally(() => setLoading(false));
  }, [selectedGroupId]);

  // Charger projets CI/CD au changement de groupe ou sous-groupe
  useEffect(() => {
    setProjects([]);
    setProjectName('');
    setFolderName('');
    setApiError(null);
    setSuccess(null);

    const groupIdToUse = selectedSubgroupId || selectedGroupId;
    if (!groupIdToUse) return;

    setLoading(true);
    fetchProjects(Number(groupIdToUse))
      .then(setProjects)
      .catch(e => setApiError(e.message))
      .finally(() => setLoading(false));
  }, [selectedGroupId, selectedSubgroupId]);

  const handleCreate = async () => {
    setApiError(null);
    setSuccess(null);

    const group = gitlabGroups.find(g => String(g.id) === selectedGroupId);
    if (!group) {
      setApiError('Veuillez sélectionner un groupe');
      return;
    }

    try {
      setLoading(true);

      if (group.name === 'APPS') {
        if (!projectName.trim()) throw new Error('Veuillez saisir un nom de projet');
        const proj = await createApp(projectName, group.id);
        setSuccess(`Projet "${proj.name}" créé sous ${proj.path_with_namespace}`);
        setProjectName('');
      } else {
        const cdProj = projects.find(p => p.name === 'cd-config');
        if (!cdProj) throw new Error('Projet cd-config introuvable');
        if (!folderName.trim()) throw new Error('Veuillez saisir un nom de dossier');
        await createCICDFolder(cdProj.id, folderName);
        setSuccess(`Dossier "${folderName}" créé`);
        setFolderName('');
      }
    } catch (e: any) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isApps = gitlabGroups.some(g => String(g.id) === selectedGroupId && g.name === 'APPS');

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">Configuration Application</Typography>
      <Divider sx={{ my: 2 }} />

      {loading && <CircularProgress sx={{ mx: 'auto', my: 2 }} />}
      {apiError && <Alert severity="error">{apiError}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="clients-label">Clients</InputLabel>
        <Select
          labelId="clients-label"
          value={selectedGroupId}
          onChange={e => setSelectedGroupId(e.target.value)}
          label="Clients"
          disabled={loading}
        >
          {gitlabGroups.map(g => (
            <MenuItem key={g.id} value={String(g.id)}>
              {g.full_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {subgroups.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="subgroups-label">Sous-groupes</InputLabel>
          <Select
            labelId="subgroups-label"
            value={selectedSubgroupId}
            onChange={e => setSelectedSubgroupId(e.target.value)}
            label="Sous-groupes"
            disabled={loading}
          >
            {subgroups.map(sg => (
              <MenuItem key={sg.id} value={String(sg.id)}>
                {sg.full_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedGroupId && isApps && (
        <TextField
          label="Nom du projet"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          fullWidth
          disabled={loading}
          sx={{ mb: 2 }}
        />
      )}

      {selectedGroupId && !isApps && (
        <TextField
          label="Nom Application"
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          fullWidth
          disabled={loading || projects.length === 0}
          helperText={projects.length === 0 ? 'Chargement projets CI‑CD…' : ''}
          sx={{ mb: 2 }}
        />
      )}

      <Button
        variant="contained"
        onClick={handleCreate}
        disabled={loading || (!isApps && projects.length === 0)}
      >
        {isApps ? 'Créer le projet' : 'Créer Application'}
      </Button>
    </Card>
  );
}
