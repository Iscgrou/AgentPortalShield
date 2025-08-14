
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CrmUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  panelType: string;
  sessionId?: string;
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
  const authChecked = useRef(false);
  const checkingAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    if (authChecked.current || checkingAuth.current) {
      return;
    }

    checkingAuth.current = true;

    try {
      const response = await apiRequest('/api/crm/auth/user');

      if (response && (response.id || response.user)) {
        const userData = response.user || response;
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ CRM Auth Success:', userData.username);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      setUser(null);
      setIsAuthenticated(false);
      // حذف لاگ خطا برای جلوگیری از spam console
      if (error.status !== 401) {
        console.log('❌ CRM Auth Failed:', error.message);
      }
    } finally {
      setIsLoading(false);
      authChecked.current = true;
      checkingAuth.current = false;
    }
  }, []);

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
        authChecked.current = true;
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
      authChecked.current = false;
    }
  });

  // تنها یک بار در ابتدا auth check انجام شود
  useEffect(() => {
    if (!authChecked.current && !checkingAuth.current) {
      console.log('🔍 CRM Auth: Initial check');
      checkAuth();
    }
  }, [checkAuth]);

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
