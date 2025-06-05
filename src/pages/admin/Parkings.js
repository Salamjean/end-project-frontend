import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Paper,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalParking as ParkingIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  EventSeat as SeatIcon
} from '@mui/icons-material';
import { parkingService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Parkings = () => {
  const [parkings, setParkings] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingParking, setEditingParking] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    totalSpots: '',
    pricePerHour: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const navigate = useNavigate();

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

  const handleOpen = (parking = null) => {
    if (parking) {
      setEditingParking(parking);
      setFormData({
        name: parking.name,
        address: parking.address,
        totalSpots: parking.totalSpots,
        pricePerHour: parking.pricePerHour,
        image: null
      });
      if (parking.image) {
        setPreviewImage(parking.image);
      } else {
        setPreviewImage('');
      }
    } else {
      setEditingParking(null);
      setFormData({
        name: '',
        address: '',
        totalSpots: '',
        pricePerHour: '',
        image: null
      });
      setPreviewImage('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingParking(null);
    setPreviewImage('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParking) {
        await parkingService.update(editingParking.id, formData);
      } else {
        await parkingService.create(formData);
      }
      fetchParkings();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du parking:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce parking ?')) {
      try {
        await parkingService.delete(id);
        fetchParkings();
      } catch (error) {
        console.error('Erreur lors de la suppression du parking:', error);
      }
    }
  };

  const getAvailabilityColor = (available, total) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'success';
    if (ratio > 0.2) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Gestion des Parkings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            py: 1
          }}
        >
          Ajouter un parking
        </Button>
      </Box>

      <Grid container spacing={3}>
        {parkings.map((parking) => (
          <Grid item xs={12} sm={6} md={4} key={parking.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box
                sx={{
                  height: 140,
                  backgroundImage: `url(${parking.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {parking.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {parking.address}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SeatIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Places
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {parking.availableSpots}/{parking.totalSpots}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MoneyIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Prix/heure
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {parking.pricePerHour} €
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpen(parking)}
                  sx={{ mr: 1 }}
                >
                  Modifier
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(parking.id)}
                >
                  Supprimer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingParking ? 'Modifier le parking' : 'Ajouter un parking'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nom du parking"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Adresse"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Nombre total de places"
              name="totalSpots"
              type="number"
              value={formData.totalSpots}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Prix par heure"
              name="pricePerHour"
              type="number"
              value={formData.pricePerHour}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Box sx={{ mt: 2 }}>
              <input
                accept="image/*"
                type="file"
                id="image-upload"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                >
                  Choisir une image
                </Button>
              </label>
            </Box>
            {previewImage && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingParking ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Parkings; 