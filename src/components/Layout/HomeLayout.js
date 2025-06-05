import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import Navbar from './AdminLayouts/Navbar';

const HomeLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default HomeLayout; 