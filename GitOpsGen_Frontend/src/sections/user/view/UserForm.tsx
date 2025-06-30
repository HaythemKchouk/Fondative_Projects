/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import {
  Box,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { User, GitLabGroup } from './types';


type UserFormProps = {
  formData: {
    email: string;
    password: string;
    name: string;
    role: string;
    projets: string[];
  };
  groupOptions: GitLabGroup[];
  loadingGroups: boolean;
  loading: boolean;
  editingId: number | null;
  errorMsg: string;
  successMsg: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProjectsChange: (_: any, values: GitLabGroup[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export function UserForm({
  formData,
  groupOptions,
  loadingGroups,
  loading,
  editingId,
  errorMsg,
  successMsg,
  onInputChange,
  onProjectsChange,
  onSubmit,
  onCancel,
}: UserFormProps) {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mb: 3 }}>
      <Typography variant="h6" mb={2}>
        {editingId ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
      </Typography>
      
      <TextField 
        name="email" 
        label="Email" 
        value={formData.email} 
        onChange={onInputChange} 
        fullWidth 
        sx={{ mb: 2 }} 
        required
      />
      
      <TextField 
        name="password" 
        label="Mot de passe" 
        type="password" 
        value={formData.password} 
        onChange={onInputChange} 
        fullWidth 
        sx={{ mb: 2 }} 
        required={!editingId}
        helperText={editingId ? "Laisser vide pour conserver l'actuel" : ""}
      />
      
      <TextField 
        name="name" 
        label="Nom" 
        value={formData.name} 
        onChange={onInputChange} 
        fullWidth 
        sx={{ mb: 2 }} 
        required
      />
      
      <TextField 
        name="role" 
        label="Rôle" 
        value={formData.role} 
        onChange={onInputChange} 
        fullWidth 
        sx={{ mb: 2 }} 
        required
      />
      
      <Autocomplete
        multiple
        openOnFocus
        filterSelectedOptions
        isOptionEqualToValue={(option, value) => option.id === value.id}
        options={groupOptions}
        getOptionLabel={opt => opt.name}
        value={groupOptions.filter(g => formData.projets.includes(g.name))}
        onChange={onProjectsChange}
        disableCloseOnSelect
        loading={loadingGroups}
        renderOption={(props, option, { selected: optionSelected }) => (
          <li {...props}>
            <Checkbox checked={optionSelected} sx={{ mr: 1 }} />
            {option.name}
          </li>
        )}
        renderInput={params => (
          <TextField
            {...params}
            label="Groupes"
            placeholder="Sélectionnez vos groupes…"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingGroups && <CircularProgress size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
      />
      
      {errorMsg && <Typography color="error" mb={1}>{errorMsg}</Typography>}
      {successMsg && <Typography color="success.main" mb={1}>{successMsg}</Typography>}
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading 
            ? (editingId ? 'Mise à jour...' : 'Création...') 
            : (editingId ? 'Mettre à jour' : 'Créer')}
        </Button>
        
        {editingId && (
          <Button 
            variant="outlined" 
            onClick={onCancel}
            startIcon={<CancelIcon />}
          >
            Annuler
          </Button>
        )}
      </Box>
    </Box>
  );
}
