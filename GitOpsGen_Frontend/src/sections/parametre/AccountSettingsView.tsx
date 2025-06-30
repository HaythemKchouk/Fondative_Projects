/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

interface Props {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  success: string | null;
  error: string | null;
  onEmailChange: (value: string) => void;
  onTokenChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSave: () => void;
  onBack: () => void;
}

export default function AccountSettingsView({
  email,
  token,
  newPassword,
  confirmPassword,
  loading,
  success,
  error,
  onEmailChange,
  onTokenChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSave,
  onBack,
}: Props) {
  return (
    <Box p={2}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6">Paramètres du compte</Typography>
        <Divider sx={{ my: 2 }} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField
          fullWidth
          label="Adresse Email"
          type="email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Token GitLab"
          value={token}
          onChange={e => onTokenChange(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          Changer le mot de passe
        </Typography>

        <TextField
          fullWidth
          label="Nouveau mot de passe"
          type="password"
          value={newPassword}
          onChange={e => onNewPasswordChange(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Confirmer le mot de passe"
          type="password"
          value={confirmPassword}
          onChange={e => onConfirmPasswordChange(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" onClick={onBack}>
            Retour
          </Button>
          <Button variant="contained" onClick={onSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
