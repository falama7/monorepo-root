import React, { useState, useEffect } from 'react';
import axios from 'axios';
export default function Species(){
  const [list,set]=useState([]),[d,sd]=useState({common_name:'',scientific_name:'',description:''});
  const hdr={headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}};
  useEffect(()=>axios.get('/api/species',hdr).then(r=>set(r.data)),[]);
  const add=async()=>{await axios.post('/api/species',d,{...hdr,'Content-Type':'application/json'});location.reload();};
  return (<div>
    <h2>Espèces</h2>
    <input placeholder="Nom" onChange={e=>sd({...d,common_name:e.target.value})}/>
    <input placeholder="Sci" onChange={e=>sd({...d,scientific_name:e.target.value})}/>
    <input placeholder="Desc" onChange={e=>sd({...d,description:e.target.value})}/>
    <button onClick={add}>Ajouter</button>
    <ul>{list.map(s=><li key={s.id}>{s.common_name}</li>)}</ul>
  </div>);
}