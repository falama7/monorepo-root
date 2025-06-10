import React from 'react';
import SpeciesForm from './components/SpeciesForm';
import MapView from './components/MapView';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Suivi des Espèces</h1>
      <SpeciesForm />
      <MapView />
    </div>
  );
}

export default App;