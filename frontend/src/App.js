import React from 'react';
import { Routes,Route,NavLink } from 'react-router-dom';
import Login from './components/Login';
import Species from './components/Species';
import Observations from './components/Observations';
import Dashboard from './components/Dashboard';

function App(){
  return (<div className="p-4">
    <nav className="mb-4 space-x-4">
      <NavLink to="/login">Login</NavLink>
      <NavLink to="/species">Espèces</NavLink>
      <NavLink to="/obs">Observations</NavLink>
      <NavLink to="/dashboard">Dashboard</NavLink>
    </nav>
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/species" element={<Species/>}/>
      <Route path="/obs" element={<Observations/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
    </Routes>
  </div>);
}
export default App;