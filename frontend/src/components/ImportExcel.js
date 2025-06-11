import React, { useState } from 'react';
import axios from 'axios';

// Configuration de l'URL du backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ImportExcel() {
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

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
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

      const response = await axios.post(`${API_BASE_URL}/api/import/import`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResults(response.data);
      setMessage(`Import réussi ! ${response.data.count} espèces importées.`);
      setFile(null);
      
      // Reset file input
      document.getElementById('fileInput').value = '';
      
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Import de données Excel/CSV</h2>
      
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h3>Instructions</h3>
        <p>Votre fichier Excel ou CSV doit contenir les colonnes suivantes :</p>
        <ul>
          <li><strong>common_name</strong> ou <strong>Nom commun</strong> : Nom commun de l'espèce</li>
          <li><strong>scientific_name</strong> ou <strong>Nom scientifique</strong> : Nom scientifique de l'espèce</li>
          <li><strong>description</strong> (optionnel) : Description de l'espèce</li>
        </ul>
        
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
          <strong>Exemple de format :</strong>
          <table style={{ marginTop: '10px', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#dee2e6' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>common_name</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>scientific_name</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Lion</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Panthera leo</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Grand félin d'Afrique</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Éléphant d'Afrique</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Loxodonta africana</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Plus grand mammifère terrestre</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Sélectionner le fichier à importer</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            id="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100%'
            }}
          />
        </div>

        {file && (
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
            <strong>Fichier sélectionné :</strong> {file.name} ({Math.round(file.size / 1024)} KB)
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!file || isLoading) ? 'not-allowed' : 'pointer',
            opacity: (!file || isLoading) ? 0.6 : 1,
            fontSize: '16px'
          }}
        >
          {isLoading ? 'Import en cours...' : 'Importer le fichier'}
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
          borderRadius: '5px',
          backgroundColor: '#d4edda'
        }}>
          <h3 style={{ color: '#155724', marginTop: 0 }}>Résultats de l'import</h3>
          <p><strong>Nombre d'espèces importées :</strong> {importResults.count}</p>
          {importResults.created && importResults.created.length > 0 && (
            <div>
              <p><strong>Espèces ajoutées :</strong></p>
              <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {importResults.created.map((species, index) => (
                  <li key={index}>{species}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
        <strong>💡 Conseil :</strong> Avant d'importer un gros fichier, testez d'abord avec quelques lignes pour vérifier que le format est correct.
      </div>
    </div>
  );
}