/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';

export function SignInDivider() {
  return (
    <>
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}>
          OU
        </Typography>
      </Divider>

      <Box sx={{ gap: 1, display: 'flex', justifyContent: 'center' }}>
        <IconButton color="inherit">
          <Iconify width={24} icon={"logos:gitlab" as any} sx={{ '--color': 'white' }} />
        </IconButton>
      </Box>
    </>
  );
}
