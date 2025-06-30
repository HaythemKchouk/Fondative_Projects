/* eslint-disable perfectionist/sort-imports */
import React, { useEffect, useState } from 'react';

import {
  Alert, Box, Button, Card, CardContent, Checkbox, CircularProgress, Divider,
  FormControl, FormControlLabel, InputLabel, MenuItem, Select, Typography
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import {
  fetchGroups,
  fetchProjects as fetchProjectsCicd,
  fetchYamlFiles,
  fetchYamlContent,
  commitChanges
} from './api';

import { parseStages, updateYamlWithStagesAndJobs } from './parser';
import { GitlabGroup, GitlabProject, GitlabFile, StageEntry, ApiGroupWrapper } from './types';
import { GITLAB_TOKEN } from './config';
import { parseAllowedParents, filterGroups } from './helpers';

export function Modificationcicd() {
  const [gitlabGroups, setGitlabGroups] = useState<GitlabGroup[]>([]);
  const [subgroups, setSubgroups] = useState<GitlabGroup[]>([]);
  const [projects, setProjects] = useState<GitlabProject[]>([]);
  const [fileOptions, setFileOptions] = useState<GitlabFile[]>([]);
  const [rawContent, setRawContent] = useState('');
  const [formValues, setFormValues] = useState<{ stages: StageEntry[] }>({ stages: [] });

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedSubgroupId, setSelectedSubgroupId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedFile, setSelectedFile] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const rawProjets = user.projets || '';
  const allowedParents = parseAllowedParents(rawProjets);

  useEffect(() => {
    setLoading(true);
    setApiError(null);
    fetchGroups(GITLAB_TOKEN)
  .then((data: ApiGroupWrapper[]) => {
    // On extrait les groupes qui sont soit des sous-groupes "CI-CD", soit les parents
    const filteredGroups = data.flatMap(wrapper =>
      wrapper.subgroups.length > 0 ? wrapper.subgroups : [wrapper.parent]
    );

    const groupsFilteredByAllowedParents = filterGroups(filteredGroups, allowedParents);
    setGitlabGroups(groupsFilteredByAllowedParents);
  })

  .catch(err => setApiError(`Erreur récupération groupes: ${err.message}`))
  .finally(() => setLoading(false));

  }, []);

  useEffect(() => {
    setSubgroups([]);
    setSelectedSubgroupId('');
    setProjects([]);
    setSelectedProjectId('');
    setSelectedFile('');
    setFormValues({ stages: [] });
    setApiError(null);
    setSuccess(null);

    if (!selectedGroupId) return;

    setLoading(true);
    fetchGroups(GITLAB_TOKEN)
     .then((data: ApiGroupWrapper[]) => {
  const filteredGroups = data.flatMap(wrapper =>
    wrapper.subgroups.length > 0 ? wrapper.subgroups : [wrapper.parent]
  );
})

      .catch((err: Error) => setApiError(`Erreur récupération sous-groupes: ${err.message}`))
      .finally(() => setLoading(false));
  }, [selectedGroupId]);

  useEffect(() => {
    setProjects([]);
    setSelectedProjectId('');
    setSelectedFile('');
    setFormValues({ stages: [] });
    setApiError(null);
    setSuccess(null);

    const groupIdToUse = selectedSubgroupId || selectedGroupId;
    if (!groupIdToUse) return;

    setLoading(true);
    fetchProjectsCicd(groupIdToUse, GITLAB_TOKEN)
      .then(setProjects)
      .catch((e: Error) => setApiError(e.message))
      .finally(() => setLoading(false));
  }, [selectedGroupId, selectedSubgroupId]);

 useEffect(() => {
  if (!selectedProjectId) return;
  async function loadFiles() {
    setLoading(true);
    setApiError(null);
    try {
      const tokenHeader = { Authorization: `Bearer ${GITLAB_TOKEN}` };
      const branches = ['main'];  // On teste uniquement la branche main
      const paths = [''];          // On teste uniquement la racine, pas 'ci-config'

      let found: GitlabFile[] = [];
      outer: for (const branch of branches) {
        for (const dir of paths) {
          console.log(`Fetching YAML files from branch="${branch}" path="${dir}"`);
          const params = new URLSearchParams({ ref: branch, per_page: '100', ...(dir && { path: dir }) });
          const res = await fetch(
            `https://gitlab.com/api/v4/projects/${selectedProjectId}/repository/tree?${params}`,
            { headers: tokenHeader }
          );
          if (!res.ok) {
            console.warn(`Fetch failed: ${res.status} ${res.statusText}`);
            continue;
          }
          const data: GitlabFile[] = await res.json();
          const yamls = data.filter(f => f.type === 'blob' && /\.ya?ml$/i.test(f.name));
          if (yamls.length) {
            found = yamls;
            break outer;
          }
        }
      }
      if (!found.length) {
        setApiError('Aucun fichier YAML trouvé.');
        setFileOptions([]);
      } else {
        setFileOptions(found);
      }
    } catch {
      setApiError('Erreur lors du chargement des fichiers.');
    } finally {
      setLoading(false);
    }
  }
  loadFiles();
}, [selectedProjectId]);



  useEffect(() => {
    if (!selectedFile || !selectedProjectId) return;
    setLoading(true);
    fetchYamlContent(selectedProjectId, selectedFile, GITLAB_TOKEN)
      .then(text => {
        setRawContent(text);
        setFormValues({ stages: parseStages(text) });
      })
      .catch(() => {
        setApiError('Erreur lors du chargement du contenu YAML.');
        setFormValues({ stages: [] });
      })
      .finally(() => setLoading(false));
  }, [selectedFile]);

  const handleToggle = (stageName: string) => {
    setFormValues(prev => ({
      stages: prev.stages.map(s =>
        s.name === stageName ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setApiError(null);
    setSuccess(null);

    try {
      const newContent = updateYamlWithStagesAndJobs(rawContent, formValues.stages);
      await commitChanges(selectedProjectId, selectedFile, newContent, GITLAB_TOKEN);
      setSuccess(`Le fichier ${selectedFile} a bien été mis à jour.`);
    } catch (err: any) {
      setApiError(`Erreur : ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ py: 4, px: 2, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '100%' }} elevation={2}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Modification CI/CD</Typography>
          <Divider sx={{ mb: 3 }} />
          {loading && <Box sx={{ textAlign: 'center', my: 4 }}><CircularProgress /></Box>}
          {apiError && <Alert severity="error">{apiError}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Clients</InputLabel>
            <Select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
              {gitlabGroups.map(g => (
                <MenuItem key={g.id} value={g.id.toString()}>
                  {g.full_name || g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {subgroups.length > 0 && (
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Sous-groupe</InputLabel>
              <Select value={selectedSubgroupId} onChange={(e) => setSelectedSubgroupId(e.target.value)}>
                {subgroups.map(sg => (
                  <MenuItem key={sg.id} value={sg.id.toString()}>
                    {sg.full_name || sg.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {projects.length > 0 && (
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Projet</InputLabel>
              <Select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                {projects.map(p => (
                  <MenuItem key={p.id} value={p.id.toString()}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {fileOptions.length > 0 && (
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Fichier YAML</InputLabel>
              <Select value={selectedFile} onChange={e => setSelectedFile(e.target.value)}>
                {fileOptions.map(f => (
                  <MenuItem key={f.path} value={f.path}>{f.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {rawContent && (
            <Box component="form" onSubmit={handleSubmit} key={selectedFile}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Stages</Typography>
              {formValues.stages.map((st) => (
                <FormControlLabel
                  key={st.name}
                  control={<Checkbox checked={st.enabled} onChange={() => handleToggle(st.name)} />}
                  label={st.name}
                />
              ))}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" startIcon={<UploadFileIcon />} disabled={uploading}>
                  {uploading ? 'Envoi…' : 'Sauvegarder'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}