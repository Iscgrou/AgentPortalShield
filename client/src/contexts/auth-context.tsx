
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  fullName?: string;
  role: 'ADMIN' | 'CRM';
  panelType: 'ADMIN_PANEL' | 'CRM_PANEL';
  sessionId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdminUser: boolean;
  isCrmUser: boolean;
  login: (credentials: LoginCredentials, panelType: 'admin' | 'crm') => Promise<void>;
  logout: () => Promise<void>;
}

interface LoginCredentials {
  username: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Unified auth check query - single source of truth
  const authQuery = useQuery({
    queryKey: ['auth-status'],
    queryFn: async () => {
      try {
        // Try CRM auth first
        const crmResponse = await apiRequest('/api/crm/auth/user');
        if (crmResponse?.success && crmResponse.user) {
          return { 
            user: crmResponse.user, 
            source: 'crm',
            authenticated: true 
          };
        }
      } catch (error) {
        console.log('CRM auth check failed, trying admin...');
      }

      try {
        // Try admin auth
        const adminResponse = await fetch('/api/auth/check', { 
          credentials: 'include' 
        });
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          if (adminData.authenticated && adminData.user) {
            return {
              user: {
                id: adminData.user.id,
                username: adminData.user.username,
                role: 'ADMIN' as const,
                panelType: 'ADMIN_PANEL' as const,
                fullName: 'مدیر سیستم'
              },
              source: 'admin',
              authenticated: true
            };
          }
        }
      } catch (error) {
        console.log('Admin auth check failed');
      }

      return { user: null, source: null, authenticated: false };
    },
    staleTime: 30000, // 30 seconds
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // Update state when auth query resolves
  useEffect(() => {
    if (authQuery.data !== undefined) {
      const { user: userData, authenticated } = authQuery.data;
      setUser(userData);
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      console.log('🔐 Auth State Updated:', {
        authenticated,
        user: userData?.username,
        role: userData?.role,
        source: authQuery.data.source
      });
    }
  }, [authQuery.data]);

  // Set initial loading from query state
  useEffect(() => {
    setIsLoading(authQuery.isLoading);
  }, [authQuery.isLoading]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ credentials, panelType }: { credentials: LoginCredentials; panelType: 'admin' | 'crm' }) => {
      const endpoint = panelType === 'admin' ? '/api/auth/login' : '/api/crm/auth/login';
      
      console.log(`🔐 Login attempt: ${panelType}`, credentials.username);
      
      const response = await apiRequest(endpoint, {
        method: 'POST',
        data: credentials
      });

      return { response, panelType };
    },
    onSuccess: ({ response, panelType }) => {
      console.log(`✅ Login Success: ${panelType}`, response);
      
      // Force auth query refetch
      authQuery.refetch();
    },
    onError: (error: any) => {
      console.error('❌ Login Error:', error);
      throw error;
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const logoutPromises = [];
      
      // Try both logout endpoints
      if (user?.role === 'ADMIN') {
        logoutPromises.push(
          fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        );
      }
      
      if (user?.role === 'CRM' || user?.panelType === 'CRM_PANEL') {
        logoutPromises.push(
          apiRequest('/api/crm/auth/logout', { method: 'POST' })
        );
      }

      await Promise.allSettled(logoutPromises);
    },
    onSuccess: () => {
      console.log('✅ Logout Success');
      setUser(null);
      setIsAuthenticated(false);
      authQuery.refetch();
    }
  });

  const login = useCallback(async (credentials: LoginCredentials, panelType: 'admin' | 'crm') => {
    await loginMutation.mutateAsync({ credentials, panelType });
  }, [loginMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const isAdminUser = user?.role === 'ADMIN';
  const isCrmUser = user?.role === 'CRM';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdminUser,
        isCrmUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
