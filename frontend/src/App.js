import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Species from './components/Species';
import Observations from './components/Observations';
import Dashboard from './components/Dashboard';
import ImportExcel from './components/ImportExcel';
import Planification from './components/Planification';

function App() {
  const linkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    backgroundColor: isActive ? '#007bff' : 'transparent',
    color: isActive ? 'white' : '#007bff',
    border: '1px solid #007bff',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500'
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <nav style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ marginRight: 'auto' }}>
            <h1 style={{ 
              margin: 0, 
              color: '#007bff', 
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🌿 Species Tracker
              <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: 'normal' }}>
                Conservation & Monitoring System
              </span>
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <NavLink to="/register" style={linkStyle}>
              📝 S'inscrire
            </NavLink>
            <NavLink to="/login" style={linkStyle}>
              🔐 Se connecter
            </NavLink>
            <NavLink to="/species" style={linkStyle}>
              🦁 Espèces
            </NavLink>
            <NavLink to="/obs" style={linkStyle}>
              📍 Observations
            </NavLink>
            <NavLink to="/import" style={linkStyle}>
              📊 Import Excel
            </NavLink>
            <NavLink to="/planification" style={linkStyle}>
              📅 Planification
            </NavLink>
            <NavLink to="/dashboard" style={linkStyle}>
              📈 Dashboard
            </NavLink>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/species" element={<Species />} />
          <Route path="/obs" element={<Observations />} />
          <Route path="/import" element={<ImportExcel />} />
          <Route path="/planification" element={<Planification />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      <footer style={{
        marginTop: '50px',
        padding: '20px',
        textAlign: 'center',
        color: '#6c757d',
        borderTop: '1px solid #dee2e6'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>Species Tracker - Système de Conservation et Surveillance</strong>
        </div>
        <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div>🦁 Gestion des espèces</div>
          <div>📍 Observations géolocalisées</div>
          <div>📅 Planification sur 5 ans</div>
          <div>📊 Rapports de suivi</div>
          <div>📈 Tableaux de bord</div>
          <div>💾 Import/Export Excel</div>
        </div>
        <div style={{ fontSize: '12px', marginTop: '10px' }}>
          Développé pour la protection de la biodiversité 🌱 | Plan de Conservation Quinquennal
        </div>
      </footer>
    </div>
  );
}

export default App;