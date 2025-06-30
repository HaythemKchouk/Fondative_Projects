/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import { Box, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/FiberManualRecord';

export default function StageCircle({ status, label }: { status: string; label: string }) {
  const colorMap: Record<string, 'disabled' | 'primary' | 'success' | 'error' | 'warning'> = {
    success: 'success',
    running: 'primary',
    pending: 'warning',
    failed: 'error',
    canceled: 'disabled',
    skipped: 'disabled',
  };

  return (
    <Box
      sx={{
        textAlign: 'center',
        width: 100,
        borderRadius: 2,
        p: 2,
        bgcolor: 'background.paper',
        animation: status === 'running' ? 'pulse 1.5s infinite' : 'none',
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)', boxShadow: '0 0 10px rgba(0,0,255,0.5)' },
          '100%': { transform: 'scale(1)' },
        },
      }}
      title={label}
    >
      <CircleIcon sx={{ fontSize: 48 }} color={colorMap[status] || 'disabled'} />
      <Typography variant="subtitle1" noWrap sx={{ mt: 1, fontWeight: 'bold' }}>
        {label}
      </Typography>
    </Box>
  );
}
