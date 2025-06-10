import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SpeciesForm() {
  const [list, setList] = useState([]);
  const [data, setData] = useState({ common_name: '', scientific_name: '', description: '' });

  const fetch = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/species', { headers: { Authorization: `Bearer ${token}` } });
    setList(res.data);
  };

  useEffect(() => { fetch(); }, []);

  const handle = e => setData({ ...data, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.post('/api/species', data, { headers: { Authorization: `Bearer ${token}` } });
    setData({ common_name: '', scientific_name: '', description: '' });
    fetch();
  };

  return (
    <div className="mb-4">
      <form onSubmit={submit} className="flex space-x-2">
        <input name="common_name" value={data.common_name} onChange={handle} placeholder="Nom commun" />
        <input name="scientific_name" value={data.scientific_name} onChange={handle} placeholder="Nom scientifique" />
        <input name="description" value={data.description} onChange={handle} placeholder="Description" />
        <button type="submit">Enregistrer</button>
      </form>
      <ul className="mt-2">
        {list.map(s => (<li key={s.id}>{s.common_name} ({s.scientific_name})</li>))}
      </ul>
    </div>
  );
}

export default SpeciesForm;