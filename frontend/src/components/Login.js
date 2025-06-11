import React, { useState } from 'react';
import axios from 'axios';

export default function Login(){
  const [u,p]=useState(''),usePas=useState('');
  const login=async()=>{
    const r=await axios.post('/api/auth/login',{username:u,password:p});
    localStorage.setItem('token',r.data.access_token);
    alert('Logged in');
  };
  return (<div>
    <input placeholder="user" onChange={e=>useState[1](e.target.value)}/>
    <input placeholder="pass" type="password" onChange={e=>usePas[1](e.target.value)}/>
    <button onClick={login}>Login</button>
  </div>);
}