import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parkingService } from '../../services/api';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Box,
  FormControlLabel,
  Switch,
  IconButton,
  Divider,
  Alert,
  Card,
  CardMedia
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const AddParking = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    totalSpots: '',
    pricePerHour: '',
    description: '',
    isActive: true,
    image: null,
    services: [''],
    openingHours: '24h/24, 7j/7'
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Vérifier le type de fichier
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Seuls les fichiers JPG, JPEG et PNG sont acceptés');
      return;
    }

    // Créer l'URL de prévisualisation
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    // Ajouter le fichier au formData
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setPreviewImage(null);
  };

  const handleArrayChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Veuillez vous connecter pour créer un parking');
      return;
    }

    // Validation des champs requis
    if (!formData.name || !formData.address || !formData.totalSpots || !formData.pricePerHour) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // Préparation des données
      const parkingData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        totalSpots: parseInt(formData.totalSpots),
        pricePerHour: parseFloat(formData.pricePerHour),
        description: formData.description ? formData.description.trim() : '',
        isActive: formData.isActive,
        openingHours: formData.openingHours || '24h/24, 7j/7',
        services: formData.services.filter(service => service.trim() !== '')
      };

      console.log('Données préparées:', parkingData);

      // Si nous avons une image
      if (formData.image) {
        const formDataToSend = new FormData();
        
        // Ajout des données de base
        Object.entries(parkingData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => {
              formDataToSend.append(key, item);
            });
          } else {
            formDataToSend.append(key, value);
          }
        });

        // Ajout de l'image
        formDataToSend.append('image', formData.image);

        // Afficher le contenu du FormData pour le débogage
        console.log('Contenu du FormData:');
        for (let pair of formDataToSend.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        console.log('Envoi avec FormData');
        const response = await parkingService.create(formDataToSend);
        console.log('Réponse du serveur:', response.data);
      } else {
        // Envoi sans image
        console.log('Envoi en JSON');
        const response = await parkingService.create(parkingData);
        console.log('Réponse du serveur:', response.data);
      }

      navigate('/dashboard/parkings');
    } catch (error) {
      console.error('Erreur détaillée:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Une erreur est survenue lors de la création du parking');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
          Ajouter un nouveau parking
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Informations de base */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Informations de base
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du parking"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                error={!formData.name}
                helperText={!formData.name ? 'Le nom du parking est requis' : ''}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Adresse"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                error={!formData.address}
                helperText={!formData.address ? "L'adresse est requise" : ''}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre total de places"
                name="totalSpots"
                type="number"
                value={formData.totalSpots}
                onChange={handleChange}
                required
                error={!formData.totalSpots || formData.totalSpots < 1}
                helperText={!formData.totalSpots ? 'Le nombre de places est requis' : 
                          formData.totalSpots < 1 ? 'Le nombre de places doit être supérieur à 0' : ''}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prix par heure (FCFA)"
                name="pricePerHour"
                type="number"
                value={formData.pricePerHour}
                onChange={handleChange}
                required
                error={!formData.pricePerHour || formData.pricePerHour < 0}
                helperText={!formData.pricePerHour ? 'Le prix par heure est requis' : 
                          formData.pricePerHour < 0 ? 'Le prix ne peut pas être négatif' : ''}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            {/* Image */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Image du parking
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Sélectionner une image
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Formats acceptés : JPG, JPEG, PNG
                </Typography>
              </Box>

              {previewImage && (
                <Box sx={{ position: 'relative', width: 'fit-content' }}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={previewImage}
                      alt="Aperçu du parking"
                      sx={{ objectFit: 'cover' }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      onClick={removeImage}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                </Box>
              )}
            </Grid>

            {/* Services */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Services
              </Typography>
              {formData.services.map((service, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Service ${index + 1}`}
                    value={service}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'services')}
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => removeArrayItem(index, 'services')}
                    disabled={formData.services.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => addArrayItem('services')}
                sx={{ mt: 1 }}
              >
                Ajouter un service
              </Button>
            </Grid>

            {/* Horaires d'ouverture */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Horaires d'ouverture
              </Typography>
              <TextField
                fullWidth
                label="Horaires d'ouverture"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleChange}
                placeholder="ex: 24h/24, 7j/7"
              />
            </Grid>

            {/* Statut */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Parking actif"
              />
            </Grid>

            {/* Boutons d'action */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard/parkings')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Créer le parking
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddParking; 