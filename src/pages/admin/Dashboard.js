import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalParking as ParkingIcon,
  EventAvailable as EventIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalClients: 0,
    totalParkings: 0,
    totalReservations: 0,
    totalRevenue: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    recentReservations: [],
    upcomingReservations: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      // Récupérer les réservations
      const reservationsResponse = await axios.get('http://localhost:5000/api/reservations/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const reservations = reservationsResponse.data.reservations;
      
      // Calculer les statistiques
      const totalReservations = reservations.length;
      const pendingReservations = reservations.filter(res => res.status === 'pending').length;
      const confirmedReservations = reservations.filter(res => res.status === 'confirmed').length;
      const totalRevenue = reservations
        .filter(res => res.status === 'confirmed')
        .reduce((sum, res) => sum + (res.totalPrice || 0), 0);

      // Récupérer les clients
      const clientsResponse = await axios.get('http://localhost:5000/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Récupérer les parkings
      const parkingsResponse = await axios.get('http://localhost:5000/api/parkings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const recentReservations = reservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const upcomingReservations = reservations
        .filter(res => new Date(res.startDate) > new Date())
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);

      setStats({
        totalClients: clientsResponse.data.length,
        totalParkings: parkingsResponse.data.length,
        totalReservations,
        totalRevenue,
        pendingReservations,
        confirmedReservations,
        recentReservations,
        upcomingReservations
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewReservations = () => {
    navigate('/admin/reservations');
  };

  const handleViewClients = () => {
    navigate('/admin/clients');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tableau de bord
        </Typography>
      </Box>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'primary.main',
              }
            }}
            onClick={handleViewClients}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Clients</Typography>
            </Box>
            <Typography variant="h4" component="div" align="center">
              {stats.totalClients}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} align="center">
              Clients enregistrés
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'success.light',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <ParkingIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Parkings</Typography>
            </Box>
            <Typography variant="h4" component="div" align="center">
              {stats.totalParkings}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} align="center">
              Parkings disponibles
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'info.light',
              color: 'white',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'info.main',
              }
            }}
            onClick={handleViewReservations}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <EventIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Réservations</Typography>
            </Box>
            <Typography variant="h4" component="div" align="center">
              {stats.totalReservations}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} align="center">
              Total des réservations
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'warning.light',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <MoneyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Revenus</Typography>
            </Box>
            <Typography variant="h4" component="div" align="center">
              {formatCurrency(stats.totalRevenue)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} align="center">
              Revenus totaux
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Réservations en attente et confirmées */}
      <Grid container spacing={6} sx={{ mb: 4, justifyContent: 'center' }}>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 2,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
            onClick={() => navigate('/admin/reservations/pending')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Réservations en attente</Typography>
            </Box>
            <Typography variant="h3" color="warning.main" sx={{ mb: 1 }} align="center">
              {stats.pendingReservations}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Réservations nécessitant une action
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 2,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
            onClick={() => navigate('/admin/reservations/confirmed')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Réservations confirmées</Typography>
            </Box>
            <Typography variant="h3" color="success.main" sx={{ mb: 1 }} align="center">
              {stats.confirmedReservations}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Réservations actives
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Réservations récentes et à venir */}
      <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Réservations récentes</Typography>
              </Box>
              <List>
                {stats.recentReservations.map((reservation) => (
                  <React.Fragment key={reservation._id}>
                    <ListItem>
                      <ListItemIcon>
                        <Chip
                          label={reservation.status}
                          color={reservation.status === 'confirmed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={reservation.name}
                        secondary={
                          <>
                            {reservation.parking?.name}
                            <br />
                            {formatDate(reservation.startDate)}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Prochaines réservations</Typography>
              </Box>
              <List>
                {stats.upcomingReservations.map((reservation) => (
                  <React.Fragment key={reservation._id}>
                    <ListItem>
                      <ListItemIcon>
                        <Chip
                          label={reservation.status}
                          color={reservation.status === 'confirmed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={reservation.name}
                        secondary={
                          <>
                            {reservation.parking?.name}
                            <br />
                            {formatDate(reservation.startDate)}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 