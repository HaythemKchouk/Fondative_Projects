/* eslint-disable perfectionist/sort-imports */
import React from 'react';

import { Box } from '@mui/material';
import { ConfigurationForm } from './ConfigurationForm';

export function ConfigurationApplicationView() {
  return (
    <Box p={2}>
      <ConfigurationForm />
    </Box>
  );
}
