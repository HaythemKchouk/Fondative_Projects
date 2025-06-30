/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function SignInHeader() {
  return (
    <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
      <Typography variant="h5">Se connecter</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        <Box sx={{ ml: 0.5, display: 'flex', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
          Plateforme Web de Génération de Configuration Kubernetes/GitOps
        </Box>
      </Typography>
    </Box>
  );
}
