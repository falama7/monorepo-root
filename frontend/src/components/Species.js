import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Configuration de l'URL du backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Species() {
  const [speciesList, setSpeciesList] = useState([]);
  const [formData, setFormData] = useState({
    common_name: '',
    scientific_name: '',
    description: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const headers = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  }), []);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/species`, headers);
        setSpeciesList(response.data);
      } catch (error) {
        console.error('Error fetching species:', error);
        if (error.response?.status === 401) {
          setMessage('Session expirée. Veuillez vous reconnecter.');
        }
      }
    };

    fetchSpecies();
  }, [headers]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecies = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await axios.post(`${API_BASE_URL}/api/species`, formData, headers);
      
      // Refresh the list
      const response = await axios.get(`${API_BASE_URL}/api/species`, headers);
      setSpeciesList(response.data);
      
      // Reset form
      setFormData({
        common_name: '',
        scientific_name: '',
        description: ''
      });
      
      setMessage('Espèce ajoutée avec succès !');
    } catch (error) {
      console.error('Error adding species:', error);
      if (error.response?.status === 401) {
        setMessage('Session expirée. Veuillez vous reconnecter.');
      } else {
        setMessage('Erreur lors de l\'ajout de l\'espèce');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Gestion des Espèces</h2>
      
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Ajouter une nouvelle espèce</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label>Nom commun:</label>
            <input 
              type="text"
              placeholder="Ex: Lion" 
              value={formData.common_name}
              onChange={e => handleInputChange('common_name', e.target.value)}
              style={{
                display: 'block',
                width: '200px',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label>Nom scientifique:</label>
            <input 
              type="text"
              placeholder="Ex: Panthera leo" 
              value={formData.scientific_name}
              onChange={e => handleInputChange('scientific_name', e.target.value)}
              style={{
                display: 'block',
                width: '200px',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label>Description:</label>
            <input 
              type="text"
              placeholder="Description de l'espèce" 
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              style={{
                display: 'block',
                width: '300px',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <button 
            onClick={addSpecies}
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
            {isLoading ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
        
        {message && (
          <div style={{
            marginTop: '10px',
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

      <div>
        <h3>Liste des espèces ({speciesList.length})</h3>
        {speciesList.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Aucune espèce enregistrée pour le moment.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {speciesList.map(species => (
              <div 
                key={species.id} 
                style={{
                  padding: '15px',
                  border: '1px solid #eee',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                  {species.common_name}
                </div>
                {species.scientific_name && (
                  <div style={{ fontStyle: 'italic', color: '#666', marginTop: '2px' }}>
                    {species.scientific_name}
                  </div>
                )}
                {species.description && (
                  <div style={{ marginTop: '5px', color: '#555' }}>
                    {species.description}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  ID: {species.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}