
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loginMutation: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authChecked = useRef(false);
  const checkingAuth = useRef(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      console.log('🔐 Admin Login Request:', credentials.username);
      const response = await apiRequest('/api/auth/login', { method: 'POST', data: credentials });
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Admin Login Success');
      setIsAuthenticated(true);
      authChecked.current = true;
    },
    onError: (error: any) => {
      console.error('❌ Admin Login Error:', error);
      setIsAuthenticated(false);
    }
  });

  const checkAuth = useCallback(async () => {
    if (authChecked.current || checkingAuth.current) {
      return;
    }
    
    checkingAuth.current = true;
    
    try {
      const response = await fetch("/api/auth/check", { 
        credentials: "include",
        method: "GET"
      });
      
      const isValid = response.ok;
      setIsAuthenticated(isValid);
      
      if (isValid) {
        console.log('✅ Admin Auth Valid');
      } else {
        console.log('❌ Admin Auth Invalid');
      }
    } catch (error) {
      console.log('❌ Admin Auth Check Failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      authChecked.current = true;
      checkingAuth.current = false;
    }
  }, []);

  const login = useCallback(() => {
    setIsAuthenticated(true);
    authChecked.current = true;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.log('❌ Logout request failed');
    } finally {
      setIsAuthenticated(false);
      authChecked.current = false;
    }
  }, []);

  // تنها یک بار در ابتدا auth check انجام شود
  useEffect(() => {
    if (!authChecked.current && !checkingAuth.current) {
      console.log('🔍 Admin Auth: Initial check');
      checkAuth();
    }
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
        loginMutation,
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
