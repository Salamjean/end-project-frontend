import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  ButtonGroup
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { parkingService } from '../services/api';

const ClientParkings = () => {
  const navigate = useNavigate();
  const [parkings, setParkings] = useState([]);

  useEffect(() => {
    fetchParkings();
  }, []);

  const fetchParkings = async () => {
    try {
      const response = await parkingService.getAll();
      if (response.data && Array.isArray(response.data)) {
        setParkings(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des parkings:', error);
    }
  };

  const handleViewDetails = (parkingId) => {
    navigate(`/parking/${parkingId}`);
  };

  const handleReserve = (parkingId) => {
    navigate(`/reservation/${parkingId}`);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 4,
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          Tous les Parkings Disponibles
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mt: 4
        }}>
          <Grid container spacing={4} sx={{ maxWidth: '1600px' }}>
            {parkings.map((parking) => (
              <Grid item xs={12} md={4} key={parking.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    },
                    minWidth: '320px',
                    maxWidth: '320px'
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={parking.image}
                      alt={parking.name}
                      sx={{
                        objectFit: 'cover',
                        height: '200px'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        📍 {parking.address}
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography gutterBottom variant="h6" component="h2" sx={{ mb: 2 }}>
                      {parking.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                      {parking.description}
                    </Typography>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <Chip 
                        label={`${parking.availableSpots}/${parking.totalSpots} places`} 
                        color={parking.availableSpots > 0 ? "success" : "error"} 
                        sx={{ mr: 1, fontSize: '0.9rem', py: 0.5 }} 
                      />
                      <Chip 
                        label={`${parking.pricePerHour} €/heure`} 
                        color="primary"
                        sx={{ fontSize: '0.9rem', py: 0.5 }}
                      />
                    </Box>
                    <ButtonGroup 
                      variant="contained" 
                      sx={{ mt: 2, width: '100%' }}
                    >
                      <Button 
                        color="primary"
                        onClick={() => handleViewDetails(parking.id)}
                        sx={{ flex: 1, py: 1, fontSize: '0.9rem' }}
                      >
                        Voir détails
                      </Button>
                      <Button 
                        color="secondary"
                        onClick={() => handleReserve(parking.id)}
                        disabled={parking.availableSpots === 0}
                        sx={{ flex: 1, py: 1, fontSize: '0.9rem' }}
                      >
                        {parking.availableSpots === 0 ? 'Complet' : 'Réserver'}
                      </Button>
                    </ButtonGroup>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default ClientParkings; 