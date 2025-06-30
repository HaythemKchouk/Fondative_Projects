/* eslint-disable perfectionist/sort-imports */
import React, { useState, useEffect, useRef } from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Alert, Box, Button, Card, CircularProgress, Divider,
  FormControl, InputLabel, MenuItem, Select, Typography
} from '@mui/material';

import { GitlabGroup, GitlabProject, GitlabTreeItem } from './types';
import { filterGroups, parseAllowedParents } from './helpers';
import {
  fetchGroups, fetchSubgroups, fetchProjects,
  fetchFolders, uploadFiles
} from './api';

export function HelmChartUploader() {
  const API = import.meta.env.VITE_API_URL || '/api';

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const rawRole = (user.role || '').toLowerCase();
  const rawProjets = user.projets || '';
  const allowedParents = parseAllowedParents(rawProjets);

  const [groups, setGroups] = useState<GitlabGroup[]>([]);
  const [subgroups, setSubgroups] = useState<GitlabGroup[]>([]);
  const [projects, setProjects] = useState<GitlabProject[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<GitlabProject | null>(null);
  const [folders, setFolders] = useState<GitlabTreeItem[]>([]);
  const [currentPath, setCurrentPath] = useState('applications/resources');

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    setApiError(null);
    fetchGroups()
      .then(data => setGroups(filterGroups(data, allowedParents)))
      .catch(err => setApiError(`Erreur récupération groupes: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSubgroups([]);
    setSelectedSubgroupId('');
    setProjects([]);
    setSelectedProject(null);
    setFolders([]);
    setApiError(null);
    setSuccess(null);

    if (!selectedGroupId) return;
    setLoading(true);
    fetchSubgroups(selectedGroupId)
      .then(data => setSubgroups(data))
      .catch(err => setApiError(`Erreur récupération sous-groupes: ${err.message}`))
      .finally(() => setLoading(false));
  }, [selectedGroupId]);

  useEffect(() => {
    setSelectedProject(null);
    setFolders([]);
    setApiError(null);
    if (!selectedSubgroupId) return;
    setLoading(true);
    fetchProjects(selectedSubgroupId)
      .then((data: GitlabProject[]) => {
        const cd = data.find(p => p.name === 'cd-config') || null;
        setSelectedProject(cd);
        if (!cd) setApiError("Projet 'cd-config' introuvable");
      })
      .catch(err => setApiError(`Erreur récupération projets: ${err.message}`))
      .finally(() => setLoading(false));
  }, [selectedSubgroupId]);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    fetchFolders(selectedProject.id, currentPath)
.then((data: GitlabTreeItem[]) => setFolders(data.filter((i: GitlabTreeItem) => i.type === 'tree')))
      .catch(err => setApiError(`Erreur récupération dossiers: ${err.message}`))
      .finally(() => setLoading(false));
  }, [selectedProject, currentPath]);

  const handleFilesSelected = (list: FileList | null) => {
    if (!list) return;
    const y = Array.from(list).filter(f => f.name.toLowerCase().match(/\.ya?ml$/));
    setFiles(y);
  };

  const handleUpload = async () => {
    setApiError(null);
    setSuccess(null);
    if (!selectedProject) {
      setApiError('Aucun projet sélectionné');
      return;
    }
    if (files.length === 0) {
      setApiError('Aucun fichier sélectionné');
      return;
    }

    setUploading(true);
    try {
      await uploadFiles(selectedProject.id, currentPath, files);
      setSuccess(`✓ ${files.length} fichier(s) uploadé(s)`);
      setFiles([]);
    } catch (err: any) {
      setApiError(`Erreur upload: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box p={2}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6">Helm Charts</Typography>
        <Divider sx={{ my: 2 }} />

        {loading && <CircularProgress sx={{ mx: 'auto', my: 2 }} />}
        {apiError && <Alert severity="error">{apiError}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <FormControl fullWidth sx={{ mb: 2 }} disabled={loading}>
          <InputLabel id="group-label">Clients</InputLabel>
          <Select
            labelId="group-label"
            value={selectedGroupId}
            label="Clients"
            onChange={e => setSelectedGroupId(e.target.value)}
          >
            {groups.length === 0 && <MenuItem disabled>Aucun groupe</MenuItem>}
            {groups.map((g) => (
              <MenuItem key={g.id} value={g.id.toString()}>
                {g.full_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {subgroups.length > 0 && (
          <FormControl fullWidth sx={{ mb: 2 }} disabled={loading}>
            <InputLabel id="subgroup-label">Dossier</InputLabel>
            <Select
              labelId="subgroup-label"
              value={selectedSubgroupId}
              label="Sous-groupes"
              onChange={e => setSelectedSubgroupId(e.target.value)}
            >
              {subgroups.map((s) => (
                <MenuItem key={s.id} value={s.id.toString()}>
                  {s.full_name || s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedProject && (
          <>
            <Typography variant="subtitle2">Navigation :</Typography>
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" onClick={() => setCurrentPath('applications/resources')}>
                Racine
              </Button>
              {folders.map((f) => (
                <Button key={f.id} size="small" onClick={() => setCurrentPath(f.path)}>
                  {f.name}
                </Button>
              ))}
            </Box>
            <Typography variant="body2">Chemin : {currentPath}</Typography>
          </>
        )}

        {selectedProject && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button component="label" startIcon={<UploadFileIcon />} sx={{ flex: 1 }}>
                Sélectionner un dossier
                <input
                  hidden
                  type="file"
                  multiple
                  accept=".yaml,.yml"
                  onChange={e => handleFilesSelected(e.target.files)}
                  {...{ webkitdirectory: 'true', directory: 'true' } as any}
                  ref={folderInputRef}
                />
              </Button>
              <Button component="label" startIcon={<UploadFileIcon />} sx={{ flex: 1 }} disabled={uploading}>
                Fichiers YAML
                <input
                  hidden
                  type="file"
                  multiple
                  accept=".yaml,.yml"
                  onChange={e => handleFilesSelected(e.target.files)}
                  ref={filesInputRef}
                />
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                sx={{ flex: 1 }}
              >
                {uploading ? <CircularProgress size={24} /> : `Envoyer (${files.length})`}
              </Button>
            </Box>
            {files.length > 0 && (
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {files.map(f => f.name).join(', ')}
              </Typography>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}
