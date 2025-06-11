import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConservationForm from './ConservationForm';
import ImportConservation from './ImportConservation';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Composant Diagramme de Gantt simple
const GanttChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        Aucun plan de conservation disponible pour le diagramme de Gantt
      </div>
    );
  }

  // Calculer les dates min et max pour l'échelle
  const dates = data.flatMap(item => [new Date(item.start), new Date(item.end)]);
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  // Générer les mois pour l'en-tête
  const generateMonths = () => {
    const months = [];
    const current = new Date(minDate);
    current.setDate(1);
    
    while (current <= maxDate) {
      months.push({
        date: new Date(current),
        label: current.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
      });
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  const months = generateMonths();
  const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

  const getBarPosition = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startOffset = (startDate - minDate) / (1000 * 60 * 60 * 24);
    const duration = (endDate - startDate) / (1000 * 60 * 60 * 24);
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px',
      border: '1px solid #dee2e6',
      overflow: 'auto'
    }}>
      <h4 style={{ marginBottom: '20px' }}>📊 Diagramme de Gantt - Planification sur 5 ans</h4>
      
      {/* En-tête des mois */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #dee2e6', 
        marginBottom: '10px',
        minWidth: '800px'
      }}>
        <div style={{ width: '200px', fontWeight: 'bold', padding: '10px' }}>
          Tâches
        </div>
        <div style={{ flex: 1, display: 'flex' }}>
          {months.map((month, index) => (
            <div 
              key={index}
              style={{ 
                flex: 1, 
                textAlign: 'center', 
                padding: '10px', 
                borderLeft: '1px solid #dee2e6',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>

      {/* Barres de Gantt */}
      <div style={{ minWidth: '800px' }}>
        {data.map((item, index) => {
          const barStyle = getBarPosition(item.start, item.end);
          const color = colors[index % colors.length];
          
          return (
            <div 
              key={item.id}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px',
                minHeight: '40px'
              }}
            >
              <div style={{ 
                width: '200px', 
                padding: '8px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {item.espece}
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                  {item.activite}
                </div>
              </div>
              
              <div style={{ 
                flex: 1, 
                position: 'relative', 
                height: '30px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef'
              }}>
                <div
                  style={{
                    position: 'absolute',
                    height: '100%',
                    backgroundColor: color,
                    opacity: 0.8,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    ...barStyle
                  }}
                  title={`${item.espece} - ${item.activite}\nResponsable: ${item.responsable}\nBudget: ${item.budget_total?.toLocaleString()} FCFA\nDu ${new Date(item.start).toLocaleDateString()} au ${new Date(item.end).toLocaleDateString()}`}
                >
                  {item.responsable}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        <h5>📋 Légende</h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {data.map((item, index) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: colors[index % colors.length],
                  marginRight: '8px',
                  borderRadius: '2px'
                }}
              />
              <span style={{ fontSize: '12px' }}>
                {item.espece} - {item.responsable}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant principal de planification
export default function Planification() {
  const [plans, setPlans] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [rapport, setRapport] = useState(null);
  const [activeTab, setActiveTab] = useState('gantt');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const headers = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les plans de conservation
      const plansResponse = await axios.get(`${API_BASE_URL}/api/conservation`, headers);
      setPlans(plansResponse.data);

      // Récupérer les données pour le Gantt
      const ganttResponse = await axios.get(`${API_BASE_URL}/api/conservation/gantt`, headers);
      setGanttData(ganttResponse.data);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRapport = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/conservation/rapport`, headers);
      setRapport(response.data);
      setActiveTab('rapport');
    } catch (error) {
      console.error('Error generating rapport:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onFormSuccess = () => {
    setShowForm(false);
    fetchData();
  };

  const onImportSuccess = () => {
    setShowImport(false);
    fetchData();
  };

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#007bff' : '#f8f9fa',
    color: isActive ? 'white' : '#495057',
    border: '1px solid #dee2e6',
    cursor: 'pointer',
    borderBottom: isActive ? '1px solid #007bff' : '1px solid #dee2e6'
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <h2>🌿 Planification Conservation - Plan 5 ans</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📋 Nouveau Plan
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📊 Import Excel
          </button>
          <button
            onClick={generateRapport}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            📄 Générer Rapport
          </button>
        </div>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div style={{ marginBottom: '30px' }}>
          <ConservationForm onSuccess={onFormSuccess} />
        </div>
      )}

      {/* Import Excel */}
      {showImport && (
        <div style={{ marginBottom: '30px' }}>
          <ImportConservation onSuccess={onImportSuccess} />
        </div>
      )}

      {/* Onglets */}
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div 
          style={tabStyle(activeTab === 'gantt')}
          onClick={() => setActiveTab('gantt')}
        >
          📊 Diagramme de Gantt
        </div>
        <div 
          style={tabStyle(activeTab === 'liste')}
          onClick={() => setActiveTab('liste')}
        >
          📋 Liste des Plans
        </div>
        <div 
          style={tabStyle(activeTab === 'rapport')}
          onClick={() => setActiveTab('rapport')}
        >
          📄 Rapport de Suivi
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'gantt' && (
        <GanttChart data={ganttData} />
      )}

      {activeTab === 'liste' && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h4>📋 Liste des Plans de Conservation ({plans.length})</h4>
          {plans.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              Aucun plan de conservation enregistré. Créez votre premier plan !
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {plans.map(plan => (
                <div 
                  key={plan.id}
                  style={{
                    padding: '15px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <strong>🦁 {plan.espece}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {plan.nom_scientifique}
                      </div>
                    </div>
                    <div>
                      <strong>🎯 {plan.activite}</strong>
                      {plan.sous_activite && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {plan.sous_activite}
                        </div>
                      )}
                    </div>
                    <div>
                      <strong>👤 {plan.responsable}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        💰 {plan.budget_total?.toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    📅 Du {new Date(plan.date_debut_taches).toLocaleDateString()} 
                    au {new Date(plan.date_fin_taches).toLocaleDateString()} 
                    ({plan.duree_jours} jours)
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    <strong>Tâches:</strong> {plan.taches}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rapport' && rapport && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '20px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4>📄 Rapport de Suivi des Espèces</h4>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(rapport, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `rapport_conservation_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              💾 Télécharger JSON
            </button>
          </div>

          {/* Résumé */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
              <h5>📊 Plans Totaux</h5>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#1976d2' }}>
                {rapport.resume.total_plans}
              </div>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
              <h5>🦁 Espèces Uniques</h5>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#388e3c' }}>
                {rapport.resume.especes_uniques}
              </div>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
              <h5>💰 Budget Total</h5>
              <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#f57c00' }}>
                {rapport.resume.total_budget?.toLocaleString()} FCFA
              </div>
            </div>
          </div>

          {/* Budget par année */}
          <div style={{ marginBottom: '30px' }}>
            <h5>💰 Répartition Budgétaire par Année</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {Object.entries(rapport.budgets_annuels).map(([annee, budget]) => (
                <div key={annee} style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold' }}>{annee.replace('_', ' ').toUpperCase()}</div>
                  <div style={{ color: '#007bff' }}>{budget?.toLocaleString()} FCFA</div>
                </div>
              ))}
            </div>
          </div>

          {/* Plans par responsable */}
          <div>
            <h5>👥 Plans par Responsable</h5>
            {Object.entries(rapport.responsables).map(([responsable, plans]) => (
              <div key={responsable} style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                  {responsable} ({plans.length} plans)
                </div>
                <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                  {plans.map(plan => (
                    <div key={plan.id} style={{ fontSize: '14px', marginBottom: '3px' }}>
                      • {plan.espece} - {plan.activite} 
                      ({plan.budget_total?.toLocaleString()} FCFA)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}