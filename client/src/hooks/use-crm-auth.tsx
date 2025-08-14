
// This file is deprecated - authentication is now unified in auth-context.tsx
// Keeping for backward compatibility during transition

import { useAuth } from "@/contexts/auth-context";

export function useCrmAuth() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  
  return {
    user: user?.role === 'CRM' ? user : null,
    isAuthenticated: isAuthenticated && user?.role === 'CRM',
    isLoading,
    checkAuth: async () => {
      // Auth check is handled automatically by the unified context
    },
    loginMutation: {
      mutateAsync: async (credentials: { username: string; password: string }) => {
        await login(credentials, 'crm');
      },
      isPending: false,
      error: null
    },
    logoutMutation: {
      mutateAsync: logout,
      isPending: false
    }
  };
}

// Keep the provider export for compatibility but redirect to unified auth
export function CrmAuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
