import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface CrmUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  panelType: string;
}

interface CrmAuthContextType {
  user: CrmUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginMutation: any;
  logoutMutation: any;
  checkAuth: () => Promise<void>;
}

const CrmAuthContext = createContext<CrmAuthContextType | undefined>(undefined);

export function CrmAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CrmUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      console.log('CRM Login Request:', credentials);
      const response = await apiRequest('/api/crm/auth/login', {
        method: 'POST',
        data: credentials
      });
      console.log('CRM Login Success Response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('CRM Auth Success - Setting user data:', data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      setTimeout(() => {
        console.log('CRM login successful, redirecting to:', '/crm');
        setLocation('/crm');
      }, 100);
    },
    onError: (error: any) => {
      console.error('CRM login error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/crm/auth/logout', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      setUser(null);
      setIsAuthenticated(false);
      setLocation('/auth');
    },
    onError: (error) => {
      console.error('CRM logout error:', error);
      // Force logout even if request fails
      setUser(null);
      setIsAuthenticated(false);
      setLocation('/auth');
    }
  });

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/crm/auth/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        console.log('CRM auth check successful:', userData);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('CRM auth check failed:', response.status);
        // Redirect to login if on CRM routes
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/crm')) {
          setLocation('/auth');
        }
      }
    } catch (error) {
      console.error('CRM auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only check CRM auth if we're on CRM routes
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/crm')) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <CrmAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        loginMutation,
        logoutMutation,
        checkAuth,
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

// Export the context for external use
export { CrmAuthContext };