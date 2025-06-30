/* eslint-disable perfectionist/sort-imports */
// formulaire_values/StepExplorer.tsx

import React, { Dispatch, SetStateAction } from 'react';

import {
  Box, Button, CircularProgress, Divider, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import { loadTree, loadFile } from './helpers';
import { RepoItem } from './types';

// Typage générique setter React
type SetState<T> = Dispatch<SetStateAction<T>>;

interface Props {
  repoItems: RepoItem[];
  pathSegments: string[];
  selectedProjectId: string;
  setPathSegments: SetState<string[]>;
  setRepoItems: SetState<RepoItem[]>;
  setFormValues: SetState<any>;
  setYamlData: SetState<any>;
  setLoading: SetState<boolean>;
  setApiError: SetState<string | null>;
  setActiveStep: SetState<number>;
  loading: boolean;
  handleBack: () => void;
  handleNext: () => void;
}

export default function StepExplorer({
  repoItems,
  pathSegments,
  selectedProjectId,
  setPathSegments,
  setRepoItems,
  setFormValues,
  setYamlData,
  setLoading,
  setApiError,
  setActiveStep,
  loading,
  handleBack,
  handleNext,
}: Props) {
  function handlePathSelect(item: RepoItem) {
    if (item.type === 'tree') {
      const newPath = [...pathSegments, item.name];
      setPathSegments(newPath);
      loadTree(selectedProjectId, newPath.join('/'), setRepoItems, setApiError, setLoading);
    } else if (item.type === 'blob' && item.name === 'values.yaml') {
      const fullPath = [...pathSegments, item.name].join('/');
      loadFile(selectedProjectId, fullPath, setYamlData, setFormValues, setApiError, setLoading);
      setActiveStep(2);
    }
  }

  function goUpOneLevel() {
    if (pathSegments.length === 0) return;
    const newPath = [...pathSegments];
    newPath.pop();
    setPathSegments(newPath);
    loadTree(selectedProjectId, newPath.join('/'), setRepoItems, setApiError, setLoading);
  }

  return (
    <>
      <Box mb={2}>
        <Button variant="outlined" disabled={pathSegments.length === 0} onClick={goUpOneLevel}>
          Remonter d un niveau
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center"><CircularProgress /></Box>
      ) : (
        <List>
          {repoItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton onClick={() => handlePathSelect(item)}>
                <ListItemIcon>
                  {item.type === 'tree' ? <FolderIcon /> : <DescriptionIcon />}
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          ))}
          {repoItems.length === 0 && <Typography>Aucun élément dans ce dossier.</Typography>}
        </List>
      )}

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={handleBack}>Retour</Button>
        <Button variant="contained" disabled={loading} onClick={handleNext}>
          Modifier values.yaml
        </Button>
      </Box>
    </>
  );
}
