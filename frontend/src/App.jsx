import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login.jsx';
import Agendamentos from './pages/Agendamentos/Agendamentos.jsx';
import Clientes from './pages/Clientes/Clientes.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import { getCurrentUser } from './services/api.js';

function RequireAuth({ children, roles }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.perfil)) {
    return <Navigate to="/agendamentos" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Caminho inicial padrão */}
        <Route path="/" element={<Login />} />
        
        {/* Outros caminhos do sistema */}
        <Route path="/agendamentos" element={<RequireAuth><Agendamentos /></RequireAuth>} />
        <Route path="/clientes" element={<RequireAuth><Clientes /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth roles={['GERENTE']}><Dashboard /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
