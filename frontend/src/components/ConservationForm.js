import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ConservationForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    espece: '',
    nom_scientifique: '',
    activite: '',
    sous_activite: '',
    taches: '',
    responsable: '',
    date_debut_taches: '',
    date_fin_taches: '',
    budget_annee_1: '',
    budget_annee_2: '',
    budget_annee_3: '',
    budget_annee_4: '',
    budget_annee_5: ''
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
      await axios.post(`${API_BASE_URL}/api/conservation`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('Plan de conservation créé avec succès !');
      setFormData({
        espece: '',
        nom_scientifique: '',
        activite: '',
        sous_activite: '',
        taches: '',
        responsable: '',
        date_debut_taches: '',
        date_fin_taches: '',
        budget_annee_1: '',
        budget_annee_2: '',
        budget_annee_3: '',
        budget_annee_4: '',
        budget_annee_5: ''
      });
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error creating conservation plan:', error);
      if (error.response?.data?.msg) {
        setMessage(`Erreur: ${error.response.data.msg}`);
      } else {
        setMessage('Erreur lors de la création du plan');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalBudget = () => {
    const budgets = [
      parseFloat(formData.budget_annee_1) || 0,
      parseFloat(formData.budget_annee_2) || 0,
      parseFloat(formData.budget_annee_3) || 0,
      parseFloat(formData.budget_annee_4) || 0,
      parseFloat(formData.budget_annee_5) || 0
    ];
    return budgets.reduce((total, budget) => total + budget, 0);
  };

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{ marginBottom: '20px', color: '#495057' }}>
        📋 Nouveau Plan de Conservation
      </h3>
      
      <form onSubmit={handleSubmit}>
        {/* Informations de base */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🦁 Espèce *
            </label>
            <input
              type="text"
              value={formData.espece}
              onChange={e => handleInputChange('espece', e.target.value)}
              placeholder="Ex: Lion d'Afrique"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🔬 Nom scientifique *
            </label>
            <input
              type="text"
              value={formData.nom_scientifique}
              onChange={e => handleInputChange('nom_scientifique', e.target.value)}
              placeholder="Ex: Panthera leo"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Activités */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🎯 Activité *
            </label>
            <input
              type="text"
              value={formData.activite}
              onChange={e => handleInputChange('activite', e.target.value)}
              placeholder="Ex: Protection de l'habitat"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              📝 Sous-activité
            </label>
            <input
              type="text"
              value={formData.sous_activite}
              onChange={e => handleInputChange('sous_activite', e.target.value)}
              placeholder="Ex: Surveillance des aires protégées"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Tâches et responsable */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            ✅ Tâches *
          </label>
          <textarea
            value={formData.taches}
            onChange={e => handleInputChange('taches', e.target.value)}
            placeholder="Détaillez les tâches à accomplir..."
            required
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            👤 Responsable *
          </label>
          <input
            type="text"
            value={formData.responsable}
            onChange={e => handleInputChange('responsable', e.target.value)}
            placeholder="Nom du responsable"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Dates */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              📅 Date début *
            </label>
            <input
              type="date"
              value={formData.date_debut_taches}
              onChange={e => handleInputChange('date_debut_taches', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              📅 Date fin *
            </label>
            <input
              type="date"
              value={formData.date_fin_taches}
              onChange={e => handleInputChange('date_fin_taches', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Budgets sur 5 ans */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '15px', color: '#495057' }}>💰 Budget par Année (FCFA)</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '15px' 
          }}>
            {[1, 2, 3, 4, 5].map(year => (
              <div key={year}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Année {year}
                </label>
                <input
                  type="number"
                  value={formData[`budget_annee_${year}`]}
                  onChange={e => handleInputChange(`budget_annee_${year}`, e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1000"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            <strong>Budget Total: {calculateTotalBudget().toLocaleString()} FCFA</strong>
          </div>
        </div>

        {/* Bouton de soumission */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '⏳ Création...' : '💾 Créer le Plan de Conservation'}
          </button>
        </div>
      </form>

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: message.includes('succès') ? '#d4edda' : '#f8d7da',
          color: message.includes('succès') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('succès') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}
    </div>
  );
}