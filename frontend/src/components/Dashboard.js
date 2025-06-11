import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';

// Configuration de l'URL du backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [populationData, setPopulationData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [stats, setStats] = useState({
    totalSpecies: 0,
    totalObservations: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const headers = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }), []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les données de population
        const popResponse = await axios.get(`${API_BASE_URL}/api/stats/population`, headers);
        setPopulationData(popResponse.data);
        
        // Récupérer les données de timeline
        const timelineResponse = await axios.get(`${API_BASE_URL}/api/stats/timeline`, headers);
        setTimelineData(timelineResponse.data);
        
        // Récupérer les statistiques générales
        const speciesResponse = await axios.get(`${API_BASE_URL}/api/species`, headers);
        const obsResponse = await axios.get(`${API_BASE_URL}/api/observations`, headers);
        
        setStats({
          totalSpecies: speciesResponse.data.length,
          totalObservations: obsResponse.data.length
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401) {
          setMessage('Session expirée. Veuillez vous reconnecter.');
        } else {
          setMessage('Erreur lors du chargement des données');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [headers]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Chargement du tableau de bord...</h2>
      </div>
    );
  }

  return (
    <div>
      <h2>Tableau de Bord - Conservation des Espèces</h2>
      
      {message && (
        <div style={{
          marginBottom: '20px',
          padding: '10px',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        }}>
          {message}
        </div>
      )}

      {/* Statistiques générales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #bbdefb'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Total Espèces</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#1976d2' }}>
            {stats.totalSpecies}
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#e8f5e8',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #c8e6c9'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>Total Observations</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#388e3c' }}>
            {stats.totalObservations}
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#fff3e0',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ffcc02'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>Espèces Observées</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#f57c00' }}>
            {populationData.length}
          </div>
        </div>
      </div>

      {/* Graphique de population par espèce */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '20px' }}>Population par espèce</h3>
        {populationData.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
            Aucune donnée de population disponible. Ajoutez des espèces et des observations pour voir les statistiques.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={populationData}>
              <XAxis 
                dataKey="species" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Graphique d'évolution temporelle */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '20px' }}>Évolution mensuelle des observations</h3>
        {timelineData.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
            Aucune donnée temporelle disponible. Les observations avec dates apparaîtront ici.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getFullYear()}`;
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Résumé et conseils */}
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <h3 style={{ marginTop: 0, color: '#495057' }}>Résumé de la conservation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#6c757d' }}>État des données</h4>
            <ul style={{ color: '#6c757d' }}>
              <li>{stats.totalSpecies} espèces répertoriées</li>
              <li>{stats.totalObservations} observations enregistrées</li>
              <li>{populationData.length} espèces avec des observations actives</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#6c757d' }}>Actions recommandées</h4>
            <ul style={{ color: '#6c757d' }}>
              <li>Continuer l'inventaire des espèces locales</li>
              <li>Augmenter la fréquence des observations sur le terrain</li>
              <li>Documenter les habitats et comportements observés</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}