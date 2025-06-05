import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8
            }
          }}
          onClick={() => navigate('/')}
        >
          Parking Manager
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate('/parkings')}>
            Parkings
          </Button>
          <Button color="inherit" onClick={() => navigate('/services')}>
            Services
          </Button>
          <Button color="inherit" onClick={() => navigate('/about')}>
            À propos de nous
          </Button>
          <Button color="inherit" onClick={() => navigate('/contact')}>
            Contactez-nous
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 