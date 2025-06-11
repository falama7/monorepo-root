import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer,TileLayer,Marker,Popup } from 'react-leaflet';

export default function Observations(){
  const [obs,setObs]=useState([]),[form,sv]=useState({species_id:'',latitude:'',longitude:''});
  const hdr={headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}};
  useEffect(()=>axios.get('/api/observations',hdr).then(r=>setObs(r.data)),[]);
  const send=async()=>{await axios.post('/api/observations',form,{...hdr});window.location.reload();};
  return (<div>
    <h2>Observations</h2>
    <input placeholder="Espèce ID" onChange={e=>sv({...form,species_id:+e.target.value})}/>
    <input placeholder="Lat" onChange={e=>sv({...form,latitude:+e.target.value})}/>
    <input placeholder="Lng" onChange={e=>sv({...form,longitude:+e.target.value})}/>
    <button onClick={send}>Envoyer</button>
    <MapContainer center={[0,0]} zoom={2} style={{height:'400px',width:'100%'}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      {obs.map(o=><Marker key={o.id} position={[o.lat,o.lng]}>
        <Popup>{o.species_id} @ {new Date(o.observed_at).toLocaleString()}</Popup>
      </Marker>)}
    </MapContainer>
  </div>);
}