import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ImportConservation({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage('');
    setImportResults(null);
  };

  const handleImport = async () => {
    if (!file) {
      setMessage('Veuillez sélectionner un fichier');
      return;
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setMessage('Seuls les fichiers Excel (.xlsx, .xls) et CSV sont acceptés');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/api/conservation/import`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResults(response.data);
      setMessage(`Import réussi ! ${response.data.count} plans de conservation importés.`);
      setFile(null);
      
      document.getElementById('conservationFileInput').value = '';
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Import error:', error);
      if (error.response?.status === 401) {
        setMessage('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.data?.msg) {
        setMessage(`Erreur d'import: ${error.response.data.msg}`);
      } else {
        setMessage('Erreur lors de l\'import du fichier');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Créer un template CSV avec les en-têtes corrects
    const headers = [
      'Espèce',
      'Nom scientifique', 
      'Activité',
      'Sous-activité',
      'Tâches',
      'Responsable',
      'date debut taches',
      'date fin taches',
      'Budget Année 1',
      'Budget Année 2',
      'Budget Année 3',
      'Budget Année 4',
      'Budget Année 5'
    ];
    
    const exampleData = [
      'Lion d\'Afrique',
      'Panthera leo',
      'Protection de l\'habitat',
      'Surveillance des aires protégées',
      'Patrouilles quotidiennes, installation de caméras, sensibilisation communautaire',
      'Jean Dupont',
      '2025-01-01',
      '2025-12-31',
      '5000000',
      '5500000',
      '6000000',
      '6500000',
      '7000000'
    ];
    
    const csvContent = headers.join(',') + '\n' + exampleData.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_plan_conservation.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{ marginBottom: '20px', color: '#495057' }}>
        📊 Import Excel - Plans de Conservation
      </h3>
      
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        border: '1px solid #007bff', 
        borderRadius: '8px', 
        backgroundColor: '#e7f3ff' 
      }}>
        <h4 style={{ color: '#0056b3', marginBottom: '15px' }}>📋 Format du fichier Excel requis</h4>
        <p style={{ marginBottom: '15px' }}>
          Votre fichier Excel doit contenir <strong>exactement</strong> ces colonnes dans cet ordre :
        </p>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          marginBottom: '15px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '8px',
            fontSize: '12px'
          }}>
            {[
              '1. Espèce *',
              '2. Nom scientifique *', 
              '3. Activité *',
              '4. Sous-activité',
              '5. Tâches *',
              '6. Responsable *',
              '7. date debut taches *',
              '8. date fin taches *',
              '9. Budget Année 1',
              '10. Budget Année 2',
              '11. Budget Année 3',
              '12. Budget Année 4',
              '13. Budget Année 5'
            ].map((col, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '8px', 
                  backgroundColor: col.includes('*') ? '#fff3cd' : '#e9ecef',
                  borderRadius: '3px',
                  fontWeight: col.includes('*') ? 'bold' : 'normal'
                }}
              >
                {col}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>📅 Format des dates :</strong> YYYY-MM-DD (ex: 2025-01-15)
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>💰 Budget :</strong> Nombres entiers en FCFA (ex: 5000000)
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>⚠️ Champs obligatoires :</strong> Marqués avec *
        </div>

        <button
          onClick={downloadTemplate}
          style={{
            padding: '8px 16px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📥 Télécharger le modèle CSV
        </button>
      </div>

      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        border: '1px solid #28a745', 
        borderRadius: '8px',
        backgroundColor: '#d4edda'
      }}>
        <h4 style={{ color: '#155724', marginBottom: '15px' }}>
          📄 Exemple de données
        </h4>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          overflow: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #dee2e6', padding: '4px' }}>Espèce</th>
                <th style={{ border: '1px solid #dee2e6', padding: '4px' }}>Nom scientifique</th>
                <th style={{ border: '1px solid #dee2e6', padding: '4px' }}>Activité</th>
                <th style={{ border: '1px solid #dee2e6', padding: '4px' }}>Responsable</th>
                <th style={{ border: '1px solid #dee2e6', padding: '4px' }}>Dates</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #dee2e6', padding: '4px' }}>Lion d'Afrique</td>
                <td style={{ border: '1px solid #dee2e6', padding: '4px' }}>Panthera leo</td>
                <td style={{ border: '1px solid #dee2e6', padding: '4px' }}>Protection habitat</td>
                <td style={{ border: '1px solid #dee2e6', padding: '4px' }}>Jean Dupont</td>
                <td style={{ border: '1px solid #dee2e6', padding: '4px' }}>2025-01-01 → 2025-12-31</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: 'white'
      }}>
        <h4 style={{ marginBottom: '15px' }}>📁 Sélectionner le fichier</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            id="conservationFileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            style={{
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              width: '100%'
            }}
          />
        </div>

        {file && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '4px' 
          }}>
            <strong>📎 Fichier sélectionné :</strong> {file.name} ({Math.round(file.size / 1024)} KB)
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!file || isLoading) ? 'not-allowed' : 'pointer',
            opacity: (!file || isLoading) ? 0.6 : 1,
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '⏳ Import en cours...' : '🚀 Importer les Plans de Conservation'}
        </button>
      </div>

      {message && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: message.includes('réussi') ? '#d4edda' : '#f8d7da',
          color: message.includes('réussi') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('réussi') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {importResults && (
        <div style={{
          padding: '20px',
          border: '1px solid #28a745',
          borderRadius: '8px',
          backgroundColor: '#d4edda'
        }}>
          <h4 style={{ color: '#155724', marginTop: 0 }}>✅ Résultats de l'import</h4>
          <div style={{ marginBottom: '10px' }}>
            <strong>📊 Plans importés :</strong> {importResults.count}
          </div>
          {importResults.skipped > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>⚠️ Lignes ignorées :</strong> {importResults.skipped}
            </div>
          )}
          
          {importResults.created && importResults.created.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>🦁 Espèces ajoutées :</strong>
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto', 
                marginTop: '5px',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '4px'
              }}>
                {importResults.created.map((espece, index) => (
                  <div key={index} style={{ fontSize: '14px', marginBottom: '2px' }}>
                    • {espece}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {importResults.skipped_details && importResults.skipped_details.length > 0 && (
            <div>
              <strong>📝 Détails des erreurs :</strong>
              <div style={{ 
                maxHeight: '100px', 
                overflowY: 'auto', 
                marginTop: '5px',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '4px'
              }}>
                {importResults.skipped_details.map((detail, index) => (
                  <div key={index} style={{ fontSize: '12px', marginBottom: '2px', color: '#721c24' }}>
                    • {detail}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}