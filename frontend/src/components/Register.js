import React, { useState } from 'react';
import axios from 'axios';

// Configuration de l'URL du backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'ranger'
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: formData.username,
        password: formData.password,
        role: formData.role
      });

      console.log('Registration successful:', response.data);
      setMessage('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'ranger'
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.status === 409) {
        setMessage('Ce nom d\'utilisateur existe déjà');
      } else if (error.response) {
        setMessage(`Erreur serveur: ${error.response.status} - ${error.response.data?.msg || 'Erreur inconnue'}`);
      } else if (error.request) {
        setMessage('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      } else {
        setMessage('Erreur lors de la création du compte');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Créer un compte</h2>
      
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
            placeholder="Mot de passe (min. 6 caractères)"
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

        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChange={e => handleInputChange('confirmPassword', e.target.value)}
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
          <label>Rôle :</label>
          <select
            value={formData.role}
            onChange={e => handleInputChange('role', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="ranger">Garde forestier</option>
            <option value="researcher">Chercheur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Création en cours...' : 'Créer le compte'}
        </button>
      </form>

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

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Vous avez déjà un compte ? <a href="/login">Se connecter</a></p>
      </div>
    </div>
  );
}