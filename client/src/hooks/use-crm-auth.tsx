import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CrmUser {
  username: string;
  role: string;
  sessionId: string;
}

interface CrmAuthContextType {
  user: CrmUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  loginMutation: any;
  logoutMutation: any;
}

const CrmAuthContext = createContext<CrmAuthContextType | undefined>(undefined);

export function CrmAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CrmUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Stable auth check function
  const checkAuth = async () => {
    if (authChecked) return; // Prevent multiple checks

    try {
      setIsLoading(true);
      const response = await apiRequest('/api/crm/auth/user');

      if (response && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ CRM Auth Success:', response.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌ CRM Auth Failed: No user data');
      }
    } catch (error: any) {
      console.log('❌ CRM Auth Failed:', error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      console.log('🔐 CRM Login Request:', credentials.username);
      const response = await apiRequest('/api/crm/auth/login', { 
        method: 'POST', 
        data: credentials 
      });
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ CRM Login Success:', data);
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        setAuthChecked(true);
      }
    },
    onError: (error: any) => {
      console.error('❌ CRM Login Error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/crm/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      console.log('✅ CRM Logout Success');
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(false);
    }
  });

  // Single auth check on mount
  useEffect(() => {
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);

  return (
    <CrmAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        checkAuth,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </CrmAuthContext.Provider>
  );
}

export function useCrmAuth() {
  const context = useContext(CrmAuthContext);
  if (context === undefined) {
    throw new Error("useCrmAuth must be used within a CrmAuthProvider");
  }
  return context;
}