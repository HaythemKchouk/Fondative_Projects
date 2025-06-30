/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import {
  Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent,
} from '@mui/material';
import { GitlabGroup, GitlabProject } from './types';

interface Props {
  topGroups: GitlabGroup[];
  projects: GitlabProject[];
  selectedTopGroupId: string;
  selectedProjectId: string;
  loading: boolean;
  setSelectedTopGroupId: (id: string) => void;
  setSelectedProjectId: (id: string) => void;
  handleNext: () => void;
}

export default function StepGroupProject({
  topGroups,
  projects,
  selectedTopGroupId,
  selectedProjectId,
  loading,
  setSelectedTopGroupId,
  setSelectedProjectId,
  handleNext,
}: Props) {
  return (
    <>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="top-group-label">Clients</InputLabel>
        <Select
          labelId="top-group-label"
          value={selectedTopGroupId}
          label="Clients"
          onChange={(e: SelectChangeEvent) => {
            setSelectedTopGroupId(e.target.value);
            setSelectedProjectId('');
          }}
        >
          {topGroups.map((g) => (
            <MenuItem key={g.id} value={g.id.toString()}>
              {g.full_name || g.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedTopGroupId}>
        <InputLabel id="project-label">Projet</InputLabel>
        <Select
          labelId="project-label"
          value={selectedProjectId}
          label="Projet"
          onChange={(e: SelectChangeEvent) => setSelectedProjectId(e.target.value)}
        >
          {projects.length === 0 && <MenuItem value="">Aucun projet</MenuItem>}
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id.toString()}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="contained"
          disabled={!selectedProjectId || loading}
          onClick={handleNext}
        >
          Suivant
        </Button>
      </Box>
    </>
  );
}
