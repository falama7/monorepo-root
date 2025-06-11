import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart,Bar,XAxis,YAxis,Tooltip,LineChart,Line } from 'recharts';

export default function Dashboard(){
  const [pop,tline]=useState([]),useTl=useState([]);
  const hdr={headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}};
  useEffect(()=>{
    axios.get('/api/stats/population',hdr).then(r=>pop(r.data));
    axios.get('/api/stats/timeline',hdr).then(r=>useTl(r.data));
  },[]);
  return (<div>
    <h2>Population</h2>
    <BarChart width={500} height={300} data={pop}><XAxis dataKey="species"/><YAxis/><Tooltip/><Bar dataKey="count"/></BarChart>
    <h2>Évolution mensuelle</h2>
    <LineChart width={500} height={300} data={tline}><XAxis dataKey="month"/><YAxis/><Tooltip/><Line dataKey="count"/></LineChart>
  </div>);
}