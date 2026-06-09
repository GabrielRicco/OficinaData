import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import Login from './pages/Login/Login.jsx';
import Servicos from './pages/Servicos/Servicos.jsx';
import Sobre from './pages/Sobre/Sobre.jsx';
import Contato from './pages/Contato/Contato.jsx';
import Agendamento from './pages/Agendamento/Agendamento.jsx';
import Agendamentos from './pages/Agendamentos/Agendamentos.jsx';
import Clientes from './pages/Clientes/Clientes.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Estoque from './pages/Estoque/Estoque.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { AccessDenied } from './components/AccessDenied.jsx';
import { useAuth } from './hooks/useAuth.js';

function ProtectedRoute({ children, requiredRoles }) {
  const { isAuthenticated, user } = useAuth();

  // Usuário não autenticado: redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Usuário autenticado mas sem role necessário: mostra tela de acesso negado
  if (requiredRoles && !requiredRoles.includes(user?.perfil)) {
    return <AccessDenied />;
  }

  return children;
}

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/agendamento" element={<Agendamento />} />
        
        {/* Rotas protegidas: qualquer usuário autenticado pode acessar */}
        <Route 
          path="/agendamentos" 
          element={<ProtectedRoute><Agendamentos /></ProtectedRoute>} 
        />
        <Route
          path="/clientes"
          element={<ProtectedRoute><Clientes /></ProtectedRoute>}
        />
        <Route
          path="/estoque"
          element={<ProtectedRoute><Estoque /></ProtectedRoute>}
        />

        {/* Rota protegida: apenas GERENTE pode acessar */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute requiredRoles={['GERENTE']}><Dashboard /></ProtectedRoute>} 
        />

        {/* Rota 404: qualquer caminho não encontrado */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
