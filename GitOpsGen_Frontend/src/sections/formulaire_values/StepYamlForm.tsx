// formulaire_values/StepYamlForm.tsx
/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { getByPath, handleChange } from './helpers';

const user = JSON.parse(localStorage.getItem('user') || '{}');
const role = user?.role || 'invite';

const canEditField = (fieldPath: string): boolean => {
  if (role === 'admin' || role === 'ops') return true;
  if (role === 'developpeur') return fieldPath.startsWith('db.');
  return false;
};

interface Props {
  formValues: any;
  setFormValues: (v: any) => void;
  uploading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleBack: () => void;
}

export default function StepYamlForm({
  formValues,
  setFormValues,
  uploading,
  handleSubmit,
  handleBack,
}: Props) {
  function renderFields(obj: any, prefix = ''): React.ReactElement[] {
    if (!formValues || typeof obj !== 'object') return [];

    return Object.entries(obj)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([key, val]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          return [
            <Typography key={path} variant="subtitle2" color="primary" sx={{ mt: 2 }}>
              {key}
            </Typography>,
            ...renderFields(val, path),
          ];
        }

        const editable = canEditField(path);
        return (
          <Box key={path} sx={{ mb: 1 }}>
            <TextField
              label={key}
              size="small"
              value={getByPath(formValues, path)}
              onChange={(e) => handleChange(path, e.target.value, formValues, setFormValues)}
              fullWidth
              disabled={!editable}
            />
            {!editable && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                Ce champ est réservé aux roles admin/ops.
              </Typography>
            )}
          </Box>
        );
      });
  }

  return (
    <>
      {!formValues ? (
        <Typography variant="body2" color="textSecondary">
          Aucune donnée chargée.
        </Typography>
      ) : (
        <form onSubmit={handleSubmit}>
          <Box sx={{ maxHeight: 500, overflowY: 'auto', mb: 3 }}>
            {renderFields(formValues)}
          </Box>

          <Box display="flex" justifyContent="space-between" gap={2}>
            <Button variant="outlined" onClick={handleBack}>Retour</Button>
            <Button
              variant="contained"
              type="submit"
              disabled={uploading}
              startIcon={<UploadFileIcon />}
            >
              {uploading ? 'Envoi...' : 'Mettre à jour'}
            </Button>
          </Box>
        </form>
      )}
    </>
  );
}
