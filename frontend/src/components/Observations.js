import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Configuration de l'URL du backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Observations() {
  const [observations, setObservations] = useState([]);
  const [species, setSpecies] = useState([]);
  const [formData, setFormData] = useState({
    species_id: '',
    latitude: '',
    longitude: '',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const headers = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les observations
        const obsResponse = await axios.get(`${API_BASE_URL}/api/observations`, headers);
        setObservations(obsResponse.data);
        
        // Récupérer la liste des espèces pour le dropdown
        const speciesResponse = await axios.get(`${API_BASE_URL}/api/species`, headers);
        setSpecies(speciesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          setMessage('Session expirée. Veuillez vous reconnecter.');
        }
      }
    };

    fetchData();
  }, [headers]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const submitObservation = async () => {
    setIsLoading(true);
    setMessage('');

    // Validation
    if (!formData.species_id || !formData.latitude || !formData.longitude) {
      setMessage('Veuillez remplir tous les champs obligatoires');
      setIsLoading(false);
      return;
    }

    try {
      const dataToSend = {
        species_id: parseInt(formData.species_id),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        notes: formData.notes || ''
      };

      await axios.post(`${API_BASE_URL}/api/observations`, dataToSend, {
        headers: {
          ...headers.headers,
          'Content-Type': 'application/json'
        }
      });

      // Refresh observations
      const response = await axios.get(`${API_BASE_URL}/api/observations`, headers);
      setObservations(response.data);

      // Reset form
      setFormData({
        species_id: '',
        latitude: '',
        longitude: '',
        notes: ''
      });

      setMessage('Observation ajoutée avec succès !');
    } catch (error) {
      console.error('Error submitting observation:', error);
      if (error.response?.status === 401) {
        setMessage('Session expirée. Veuillez vous reconnecter.');
      } else {
        setMessage('Erreur lors de l\'ajout de l\'observation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Gestion des Observations</h2>
      
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Ajouter une nouvelle observation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label>Espèce *:</label>
            <select 
              value={formData.species_id}
              onChange={e => handleInputChange('species_id', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="">Sélectionner une espèce</option>
              {species.map(sp => (
                <option key={sp.id} value={sp.id}>
                  {sp.common_name} ({sp.scientific_name})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Latitude *:</label>
            <input 
              type="number"
              step="any"
              placeholder="Ex: 4.0511" 
              value={formData.latitude}
              onChange={e => handleInputChange('latitude', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div>
            <label>Longitude *:</label>
            <input 
              type="number"
              step="any"
              placeholder="Ex: 9.7679" 
              value={formData.longitude}
              onChange={e => handleInputChange('longitude', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div>
            <label>Notes (optionnel):</label>
            <input 
              type="text"
              placeholder="Informations additionnelles" 
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
        
        <button 
          onClick={submitObservation}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Ajout...' : 'Ajouter l\'observation'}
        </button>
        
        {message && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: message.includes('succès') ? '#d4edda' : '#f8d7da',
            color: message.includes('succès') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('succès') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Carte des observations ({observations.length})</h3>
        <MapContainer 
          center={[4.0511, 9.7679]} // Coordonnées du Cameroun
          zoom={6} 
          style={{ height: '400px', width: '100%', borderRadius: '5px' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {observations.map(obs => (
            <Marker 
              key={obs.id} 
              position={[obs.lat || obs.latitude, obs.lng || obs.longitude]}
            >
              <Popup>
                <div>
                  <strong>Espèce ID:</strong> {obs.species_id}<br />
                  <strong>Date:</strong> {new Date(obs.observed_at).toLocaleString()}<br />
                  <strong>Coordonnées:</strong> {obs.lat || obs.latitude}, {obs.lng || obs.longitude}<br />
                  {obs.notes && <><strong>Notes:</strong> {obs.notes}</>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div>
        <h3>Liste des observations</h3>
        {observations.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Aucune observation enregistrée pour le moment.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {observations.map(obs => (
              <div 
                key={obs.id} 
                style={{
                  padding: '15px',
                  border: '1px solid #eee',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Espèce ID: {obs.species_id}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      📍 {obs.lat || obs.latitude}, {obs.lng || obs.longitude}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      🕒 {new Date(obs.observed_at).toLocaleString()}
                    </div>
                    {obs.notes && (
                      <div style={{ marginTop: '5px', color: '#555' }}>
                        📝 {obs.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    ID: {obs.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}