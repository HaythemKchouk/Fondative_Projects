/* eslint-disable perfectionist/sort-imports */
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';

import StepGroupProject from './StepGroupProject';
import StepExplorer from './StepExplorer';
import StepYamlForm from './StepYamlForm';

import {
  GitlabGroup,
  GitlabProject,
  RepoItem,
  ApiGroupWrapper,
} from './types';

import {
  loadTree,
  handleSubmit,
  filterGroups,
  parseAllowedParents,
} from './helpers';

import {
  fetchGitlabGroups,
  fetchProjects,
} from './api';

export function FormulaireValues() {
  const [topGroups, setTopGroups] = useState<GitlabGroup[]>([]);
  const [projects, setProjects] = useState<GitlabProject[]>([]);
  const [repoItems, setRepoItems] = useState<RepoItem[]>([]);

  const [selectedTopGroupId, _setSelectedTopGroupId] = useState<string>('');
  const [selectedProjectId, _setSelectedProjectId] = useState<string>('');
  const [pathSegments, setPathSegments] = useState<string[]>([]);

  const [yamlData, setYamlData] = useState<any>(null);
  const [formValues, setFormValues] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const steps = ['Choisir Clients et projet', 'Explorer arborescence', 'Modifier values.yaml'];

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const rawProjets = user.projets || '';
  const allowedParents = parseAllowedParents(rawProjets);

  // Wrappers pour logger les changements d'état
  function setSelectedTopGroupId(id: string) {
    console.log(`[DEBUG] setSelectedTopGroupId called with: ${id}`);
    _setSelectedTopGroupId(id);
  }
  function setSelectedProjectId(id: string) {
    console.log(`[DEBUG] setSelectedProjectId called with: ${id}`);
    _setSelectedProjectId(id);
  }

  // Chargement des groupes filtrés
  useEffect(() => {
    setLoading(true);
    setApiError(null);
    fetchGitlabGroups()
      .then((data: ApiGroupWrapper[]) => {
        const filteredGroups = data.flatMap(wrapper =>
          wrapper.subgroups.length > 0 ? wrapper.subgroups : [wrapper.parent]
        );
        const groupsFiltered = filterGroups(filteredGroups, allowedParents);
        setTopGroups(groupsFiltered);
        console.log('[DEBUG] Groupes filtrés chargés:', groupsFiltered);
      })
      .catch(err => {
        setApiError(`Erreur récupération groupes: ${err.message}`);
        console.error('[ERROR] fetchGitlabGroups failed:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Chargement projets directement selon groupe sélectionné (plus de sous-groupes)
  useEffect(() => {
    if (!selectedTopGroupId) {
      setProjects([]);
      setSelectedProjectId('');
      return;
    }

    fetchProjects(Number(selectedTopGroupId))
      .then((fetchedProjects) => {
        console.log('[DEBUG] Projets chargés:', fetchedProjects);
        setProjects(fetchedProjects);
        if (fetchedProjects.length > 0) {
          setSelectedProjectId(String(fetchedProjects[0].id)); // sélection auto premier projet
        } else {
          setSelectedProjectId('');
        }
      })
      .catch((err) => {
        setApiError(`Erreur récupération projets: ${err.message}`);
        console.error('[ERROR] fetchProjects failed:', err);
      });
  }, [selectedTopGroupId]);

  // Chargement arborescence dépôt
  useEffect(() => {
    if (!selectedProjectId) {
      setRepoItems([]);
      setPathSegments([]);
      console.log('[DEBUG] Aucun projet sélectionné');
      return;
    }

    console.log(`[DEBUG] Chargement arborescence pour projetId=${selectedProjectId}`);
    loadTree(selectedProjectId, '', setRepoItems, setApiError, setLoading);
  }, [selectedProjectId]);

  function handleNext() {
    if (activeStep === 0 && selectedProjectId) {
      setActiveStep(1);
      setYamlData(null);
      setFormValues(null);
      setPathSegments([]);
      setSuccess(null);
      setApiError(null);
    } else if (activeStep === 1 && yamlData) {
      setActiveStep(2);
    }
  }

  function handleBack() {
    if (activeStep === 2) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      setActiveStep(0);
      setSelectedProjectId('');
      setRepoItems([]);
      setPathSegments([]);
      setYamlData(null);
      setFormValues(null);
      setSuccess(null);
      setApiError(null);
    }
  }

  return (
    <Card sx={{ maxWidth: 1000, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" mb={3}>
          Editeur values.yaml GitLab
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {activeStep === 0 && (
          <StepGroupProject
            topGroups={topGroups}
            projects={projects}
            selectedTopGroupId={selectedTopGroupId}
            selectedProjectId={selectedProjectId}
            loading={loading}
            setSelectedTopGroupId={setSelectedTopGroupId}
            setSelectedProjectId={setSelectedProjectId}
            handleNext={handleNext}
          />
        )}

        {activeStep === 1 && (
          <StepExplorer
            repoItems={repoItems}
            pathSegments={pathSegments}
            selectedProjectId={selectedProjectId}
            setPathSegments={setPathSegments}
            setRepoItems={setRepoItems}
            setFormValues={setFormValues}
            setYamlData={setYamlData}
            setLoading={setLoading}
            setApiError={setApiError}
            setActiveStep={setActiveStep}
            loading={loading}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        )}

        {activeStep === 2 && (
          <StepYamlForm
            formValues={formValues}
            setFormValues={setFormValues}
            uploading={uploading}
            handleSubmit={(e) =>
              handleSubmit(
                e,
                formValues,
                selectedProjectId,
                pathSegments,
                setUploading,
                setApiError,
                setSuccess
              )
            }
            handleBack={handleBack}
          />
        )}
      </CardContent>
    </Card>
  );
}
