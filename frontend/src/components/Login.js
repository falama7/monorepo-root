import React, { useState } from 'react';
import axios from 'axios';

// Configuration de l'URL du backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: formData.username,
        password: formData.password
      });
      
      localStorage.setItem('token', response.data.access_token);
      setMessage('Connexion réussie ! Redirection en cours...');
      
      // Redirection automatique après 2 secondes
      setTimeout(() => {
        window.location.href = '/species';
      }, 2000);
      
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        setMessage('Nom d\'utilisateur ou mot de passe incorrect');
      } else if (error.response) {
        setMessage(`Erreur serveur: ${error.response.status}`);
      } else if (error.request) {
        setMessage('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      } else {
        setMessage('Erreur lors de la connexion');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Se connecter</h2>
      
      <div style={{ marginBottom: '15px', fontSize: '12px', color: '#666' }}>
        Backend URL: {API_BASE_URL}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={e => handleInputChange('username', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={e => handleInputChange('password', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      {message && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          borderRadius: '4px',
          backgroundColor: message.includes('réussie') ? '#d4edda' : '#f8d7da',
          color: message.includes('réussie') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('réussie') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Pas encore de compte ? <a href="/register">S'inscrire</a></p>
      </div>
    </div>
  );
}