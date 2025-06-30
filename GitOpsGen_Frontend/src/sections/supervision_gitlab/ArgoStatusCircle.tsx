/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import SyncIcon from '@mui/icons-material/Sync';

export default function ArgoStatusCircle({ health, sync }: { health: string; sync: string }) {
  const iconSize = 16;
  const isSyncing = sync.toLowerCase().includes('sync');

  const healthIcons: Record<string, React.ReactElement> = {
    Healthy: <CheckCircleIcon sx={{ fontSize: iconSize }} color="success" />,
    Progressing: <SyncIcon sx={{ fontSize: iconSize }} color="info" />,
    Degraded: <WarningIcon sx={{ fontSize: iconSize }} color="error" />,
    Unknown: <CancelIcon sx={{ fontSize: iconSize }} color="disabled" />,
  };

  const syncIcon = (
    <SyncIcon
      sx={{
        fontSize: iconSize,
        animation: isSyncing ? 'rotation 1.2s linear infinite' : 'none',
        '@keyframes rotation': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }}
      color={sync === 'Synced' ? 'success' : 'warning'}
    />
  );

  return (
    <Box
      sx={{
        fontSize: 50,
        lineHeight: 5,
        p: 1,
        minWidth: 120,
        borderRadius: 5,
        bgcolor: 'grey.100',
        boxShadow: 2,
      }}
      title={`Health: ${health} · Sync: ${sync}`}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        {healthIcons[health] || healthIcons.Unknown}
        <Typography variant="caption">Health: {health}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {syncIcon}
        <Typography variant="caption">Sync: {sync}</Typography>
      </Box>
    </Box>
  );
}
