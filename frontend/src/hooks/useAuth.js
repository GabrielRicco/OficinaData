import { useMemo } from 'react';
import { getCurrentUser } from '../services/api';

/**
 * Hook customizado para obter informações do usuário autenticado
 * @returns {Object} Objeto com user, isAuthenticated e hasRole (método)
 */
export function useAuth() {
  const user = getCurrentUser();

  return useMemo(() => ({
    user,
    isAuthenticated: !!user,
    hasRole: (role) => user?.perfil === role,
    hasAnyRole: (roles) => Array.isArray(roles) && roles.includes(user?.perfil)
  }), [user]);
}
