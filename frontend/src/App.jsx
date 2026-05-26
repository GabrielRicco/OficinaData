import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login.jsx';
import Agendamentos from './pages/Agendamentos/Agendamentos.jsx';
import Clientes from './pages/Clientes/Clientes.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Caminho inicial padrão */}
        <Route path="/" element={<Login />} />
        
        {/* Outros caminhos do sistema */}
        <Route path="/agendamentos" element={<Agendamentos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;