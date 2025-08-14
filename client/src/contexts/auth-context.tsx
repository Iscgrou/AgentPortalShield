
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  const [authChecked, setAuthChecked] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      console.log('🔐 Admin Login Request:', credentials.username);
      const response = await apiRequest('/api/auth/login', { method: 'POST', data: credentials });
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Admin Login Success');
      setIsAuthenticated(true);
      setAuthChecked(true);
    },
    onError: (error: any) => {
      console.error('❌ Admin Login Error:', error);
      setIsAuthenticated(false);
    }
  });

  const checkAuth = async () => {
    if (authChecked) return; // Prevent multiple checks
    
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/check", { 
        credentials: "include",
        method: "GET"
      });
      
      const isValid = response.ok;
      setIsAuthenticated(isValid);
      
      console.log(isValid ? '✅ Admin Auth Valid' : '❌ Admin Auth Invalid');
    } catch (error) {
      console.log('❌ Admin Auth Check Failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };

  const login = () => {
    setIsAuthenticated(true);
    setAuthChecked(true);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.log('❌ Logout request failed');
    } finally {
      setIsAuthenticated(false);
      setAuthChecked(false);
    }
  };

  // Single auth check on mount
  useEffect(() => {
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);

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
