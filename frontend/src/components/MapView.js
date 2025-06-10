import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

function MapView() {
  const [obs, setObs] = useState([]);

  const fetchObs = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/observations', { headers: { Authorization: `Bearer ${token}` } });
    setObs(res.data);
  };

  useEffect(() => { fetchObs(); }, []);

  return (
    <MapContainer center={[0,0]} zoom={2} style={{ height: '500px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {obs.map(o => (
        <Marker key={o.id} position={[o.latitude, o.longitude]}>
          <Popup>
            Espèce&nbsp;ID: {o.species_id}<br />
            {new Date(o.observed_at).toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;