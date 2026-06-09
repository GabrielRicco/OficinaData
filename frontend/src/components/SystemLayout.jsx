import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { clearAuthSession } from '../services/api';
import './SystemLayout.css';

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const IconOS = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconClientes = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconEstoque = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconWrench = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

export default function SystemLayout({ children }) {
  const { user, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSession();
    navigate('/');
  };

  const navItems = [
    ...(hasRole('GERENTE') ? [{ to: '/dashboard', label: 'Dashboard', Icon: IconDashboard }] : []),
    { to: '/agendamentos', label: 'Ordens de Serviço', Icon: IconOS },
    { to: '/clientes',    label: 'Clientes',          Icon: IconClientes },
    { to: '/estoque',     label: 'Estoque',            Icon: IconEstoque },
  ];

  return (
    <div className="sys-layout">
      <aside className="sys-sidebar">
        <div className="sys-sidebar-top">
          <div className="sys-brand">
            <IconWrench />
            <span>OficinaData</span>
          </div>

          <nav className="sys-nav" aria-label="Navegação principal">
            {navItems.map(({ to, label, Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`sys-nav-item ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sys-sidebar-bottom">
          <div className="sys-user">
            <div className="sys-user-avatar">
              {user?.nome?.charAt(0) || 'U'}
            </div>
            <div className="sys-user-info">
              <span className="sys-user-name">{user?.nome || 'Usuário'}</span>
              <span className="sys-user-role">{user?.perfil || ''}</span>
            </div>
          </div>
          <button className="sys-logout-btn" onClick={handleLogout} title="Sair" aria-label="Sair do sistema">
            <IconLogout />
          </button>
        </div>
      </aside>

      <main className="sys-main">
        {children}
      </main>
    </div>
  );
}
