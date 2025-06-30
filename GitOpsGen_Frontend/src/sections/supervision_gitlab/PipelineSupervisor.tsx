/* eslint-disable perfectionist/sort-imports */
import React, { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';

import StageCircle from './StageCircle';
import { Group, Project, Pipeline, Job, ArgoApp } from './types';
import {
  computeStages,
  extractRootGroupFromRepoUrl,
  mapHealth,
  mapSync,
} from './helpers';
import {
  fetchGroups,
  fetchSubgroups,
  fetchProjects,
  fetchPipelines,
  fetchPipelineJobs,
  fetchArgoApps,
} from './api';

export function PipelineSupervisor() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [subgroups, setSubgroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [argoApps, setArgoApps] = useState<ArgoApp[]>([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedArgoGroup, setSelectedArgoGroup] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGroups();
        setGroups(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let iv: NodeJS.Timeout;
    if (selectedProject) {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchPipelines(Number(selectedProject));
          setPipelines(data);
        } catch (err: any) {
          setError(err.message);
          setPipelines([]);
        } finally {
          setLoading(false);
        }
      })();
      iv = setInterval(async () => {
        try {
          const data = await fetchPipelines(Number(selectedProject));
          setPipelines(data);
        } catch {
          setPipelines([]);
        }
      }, 5000);
    }
    return () => clearInterval(iv);
  }, [selectedProject]);

  useEffect(() => {
    let iv: NodeJS.Timeout;
    if (selectedProject && pipelines[0]) {
      (async () => {
        try {
          const data = await fetchPipelineJobs(Number(selectedProject), pipelines[0].id);
          setJobsList(data);
        } catch {
          setJobsList([]);
        }
      })();
      iv = setInterval(async () => {
        try {
          const data = await fetchPipelineJobs(Number(selectedProject), pipelines[0].id);
          setJobsList(data);
        } catch {
          setJobsList([]);
        }
      }, 1000);
    }
    return () => clearInterval(iv);
  }, [selectedProject, pipelines]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchArgoApps();
        setArgoApps(data);
      } catch (err: any) {
        setError(`ArgoCD: ${err.message}`);
      }
    })();
    const iv = setInterval(async () => {
      try {
        const data = await fetchArgoApps();
        setArgoApps(data);
      } catch (err: any) {
        setError(`ArgoCD: ${err.message}`);
      }
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  const filteredArgoApps = argoApps.filter(app => {
    if (!selectedArgoGroup) return true;
    const urls: string[] = [];
    if (app.spec?.source?.repoURL) urls.push(app.spec.source.repoURL!);
    app.spec?.sources?.forEach(s => s.repoURL && urls.push(s.repoURL));
    return urls.some(u => extractRootGroupFromRepoUrl(u)?.toLowerCase() === selectedArgoGroup.toLowerCase());
  });

  const handleGroupChange = (e: SelectChangeEvent) => {
    const id = e.target.value;
    setSelectedGroup(id);
    setSelectedSubgroup('');
    setSelectedProject('');
    setSelectedArgoGroup(groups.find(g => g.id.toString() === id)?.full_path || '');
    setSubgroups([]);
    setProjects([]);
    setPipelines([]);
    setJobsList([]);
    if (id) {
      (async () => {
        try {
          const subgs = await fetchSubgroups(Number(id));
          setSubgroups(subgs);
          const projs = await fetchProjects(Number(id));
          setProjects(projs);
        } catch (err: any) {
          setError(err.message);
          setSubgroups([]);
          setProjects([]);
        }
      })();
    }
  };

  const handleSubgroupChange = (e: SelectChangeEvent) => {
    const id = e.target.value;
    setSelectedSubgroup(id);
    setSelectedProject('');
    setJobsList([]);
    setPipelines([]);
    setProjects([]);
    if (id) {
      (async () => {
        try {
          const projs = await fetchProjects(Number(id));
          setProjects(projs);
        } catch (err: any) {
          setError(err.message);
          setProjects([]);
        }
      })();
    }
  };

  const handleProjectChange = (e: SelectChangeEvent) => {
    const id = e.target.value;
    setSelectedProject(id);
    setJobsList([]);
    setPipelines([]);
    if (id) {
      (async () => {
        try {
          const pipes = await fetchPipelines(Number(id));
          setPipelines(pipes);
        } catch (err: any) {
          setError(err.message);
          setPipelines([]);
        }
      })();
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Explorateur GitLab CI/CD + ArgoCD
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {/* filtres GitLab */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Clients (CI/CD + ArgoCD)</InputLabel>
          <Select
            value={selectedGroup}
            onChange={handleGroupChange}
            label="Groupe GitLab (CI/CD + ArgoCD)"
          >
            {groups.filter(g => !g.parent_id).map(g => (
              <MenuItem key={g.id} value={g.id.toString()}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {subgroups.length > 0 && (
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Sous-groupe</InputLabel>
            <Select
              value={selectedSubgroup}
              onChange={handleSubgroupChange}
              label="Sous-groupe"
            >
              {subgroups.map(sg => (
                <MenuItem key={sg.id} value={sg.id.toString()}>
                  {sg.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {projects.length > 0 && (
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Projet</InputLabel>
            <Select
              value={selectedProject}
              onChange={handleProjectChange}
              label="Projet"
            >
              {projects.map(p => (
                <MenuItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* CI et CD côte-à-côte */}
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* CI – GitLab Pipelines */}
        <Box
          sx={{
            flex: 1,
            minWidth: 300,
            minHeight: 320,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            CI – GitLab Pipelines
          </Typography>

          {jobsList.length > 0 ? (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Pipeline #{pipelines[0]?.id}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
                  justifyContent: 'center',
                  mt: 2,
                }}
              >
                {computeStages(jobsList).map(({ stage, status }) => (
                  <StageCircle key={stage} label={stage} status={status} />
                ))}
              </Box>
            </>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Aucun pipeline sélectionné.
            </Typography>
          )}
        </Box>

        {/* CD – ArgoCD Applications */}
        <Box
          sx={{
            flex: 1,
            minWidth: 300,
            minHeight: 320,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            CD – ArgoCD Applications
          </Typography>

          {filteredArgoApps.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
                justifyContent: 'center',
                mt: 2,
              }}
            >
              {filteredArgoApps.map(app => {
                const hStatus = mapHealth(app.status.health.status);
                const sStatus = mapSync(app.status.sync.status);

                return (
                  <Box
                    key={app.metadata.name}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      boxShadow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {app.metadata.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <StageCircle
                        status={hStatus}
                        label={app.status.health.status}
                      />
                      <StageCircle
                        status={sStatus}
                        label={app.status.sync.status}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Aucune application ArgoCD trouvée.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
