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

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      console.log('Admin Login Request:', credentials);
      const response = await apiRequest('/api/login', { method: 'POST', data: credentials });
      console.log('Admin Login Success Response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Admin Auth Success - Setting authenticated state');
      setIsAuthenticated(true);
    },
    onError: (error: any) => {
      console.error('Admin login error:', error);
      setIsAuthenticated(false);
    }
  });

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check", { credentials: "include" });
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      // Ignore logout errors
    } finally {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

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