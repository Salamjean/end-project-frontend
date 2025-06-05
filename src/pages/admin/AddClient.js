import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import axios from 'axios';

const AddClient = () => {
  const navigate = useNavigate();
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehiclePlate: '',
    vehicleModel: '',
    parkingId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchParkings();
    // Vérifier s'il y a des données pré-remplies
    const pendingClientData = localStorage.getItem('pendingClientData');
    if (pendingClientData) {
      const data = JSON.parse(pendingClientData);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        vehiclePlate: data.vehiclePlate || '',
        vehicleModel: data.vehicleModel || '',
        parkingId: data.parkingId || '',
        startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : ''
      });
      // Supprimer les données du localStorage après les avoir utilisées
      localStorage.removeItem('pendingClientData');
    }
  }, []);

  const fetchParkings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parkings');
      if (Array.isArray(response.data)) {
        setParkings(response.data);
      }
    } catch (error) {
      setError('Erreur lors du chargement des parkings');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone.replace(/\s/g, ''));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        return;
      }

      // Validation des champs
      if (!formData.name.trim()) {
        setError('Le nom est requis');
        return;
      }

      if (!validateEmail(formData.email)) {
        setError('Veuillez entrer une adresse email valide');
        return;
      }

      if (!validatePhone(formData.phone)) {
        setError('Veuillez entrer un numéro de téléphone valide');
        return;
      }

      // Calculer la durée et le prix total si les dates sont fournies
      let duration = 0;
      let totalPrice = 0;
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        duration = Math.ceil((end - start) / (1000 * 60 * 60));

        const selectedParking = parkings.find(p => p._id === formData.parkingId);
        if (selectedParking) {
          totalPrice = duration * selectedParking.pricePerHour;
        }
      }

      // Préparer les données du client
      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        vehiclePlate: formData.vehiclePlate.trim(),
        vehicleModel: formData.vehicleModel.trim(),
        parkingId: formData.parkingId,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        duration,
        totalPrice
      };

      console.log('Envoi des données client:', clientData);

      const clientResponse = await axios.post(
        'http://localhost:5000/api/clients',
        clientData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Réponse du serveur:', clientResponse.data);

      if (!clientResponse.data.client) {
        throw new Error('Erreur lors de la création du client: Réponse invalide du serveur');
      }

      // Marquer le client comme enregistré si les données proviennent d'une réservation
      const pendingClientData = localStorage.getItem('pendingClientData');
      if (pendingClientData) {
        const data = JSON.parse(pendingClientData);
        const registeredClients = JSON.parse(localStorage.getItem('registeredClients') || '[]');
        registeredClients.push(data.reservationId);
        localStorage.setItem('registeredClients', JSON.stringify(registeredClients));
      }

      setSuccess('Client créé avec succès');
      setTimeout(() => {
        navigate('/admin/clients');
      }, 2000);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (error.response) {
        console.error('Données de réponse:', error.response.data);
        console.error('Statut de réponse:', error.response.status);
        console.error('En-têtes de réponse:', error.response.headers);
        
        if (error.response.status === 400) {
          setError(error.response.data.message || 'Veuillez vérifier les informations saisies');
        } else {
          setError(error.response.data.message || error.response.data.error || 'Erreur lors de la création du client');
        }
      } else if (error.request) {
        console.error('Requête sans réponse:', error.request);
        setError('Le serveur ne répond pas. Veuillez vérifier votre connexion.');
      } else {
        console.error('Erreur de configuration:', error.message);
        setError(error.message || 'Une erreur est survenue');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Ajouter un nouveau client
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Remplissez le formulaire ci-dessous pour ajouter un nouveau client et sa réservation.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Section Informations du client */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
              Informations du client
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  required
                  label="Nom complet"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Jean Dupont"
                  error={error && !formData.name.trim()}
                  helperText={error && !formData.name.trim() ? 'Le nom est requis' : ''}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: jean.dupont@email.com"
                  error={error && !validateEmail(formData.email)}
                  helperText={error && !validateEmail(formData.email) ? 'Email invalide' : ''}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  required
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: 0612345678"
                  error={error && !validatePhone(formData.phone)}
                  helperText={error && !validatePhone(formData.phone) ? 'Numéro de téléphone invalide' : ''}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Section Informations du véhicule */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
              Informations du véhicule
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Modèle du véhicule"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="Ex: Renault Clio"
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Plaque d'immatriculation"
                  name="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={handleChange}
                  placeholder="Ex: AB-123-CD"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Section Informations de réservation */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
              Informations de réservation
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12}>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <FormControl sx={{ width: '80%' }}>
                    <InputLabel>Parking</InputLabel>
                    <Select
                      name="parkingId"
                      value={formData.parkingId}
                      onChange={handleChange}
                      label="Parking"
                      sx={{
                        minHeight: '56px',
                        '& .MuiSelect-select': {
                          padding: '12px 14px',
                          fontSize: '1rem',
                        }
                      }}
                    >
                      {parkings.map((parking) => (
                        <MenuItem 
                          key={parking._id} 
                          value={parking._id}
                          sx={{
                            padding: '12px 14px',
                            fontSize: '1rem',
                          }}
                        >
                          {parking.name} - {parking.address}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Date de début"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Date de fin"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Boutons d'action */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/clients')}
              size="large"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              size="large"
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Enregistrement...' : 'Ajouter le client'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddClient; 