
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loginMutation: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      console.log('Admin Login Request:', credentials);
      const response = await apiRequest('/api/auth/login', { 
        method: 'POST', 
        data: credentials 
      });
      console.log('Admin Login Success Response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Admin Auth Success - Setting authenticated state');
      setIsAuthenticated(true);
      setUser(data.user);
      // Force redirect to dashboard
      setTimeout(() => {
        console.log('Admin login successful, redirecting to:', '/dashboard');
        setLocation('/dashboard');
      }, 100);
    },
    onError: (error: any) => {
      console.error('Admin login error:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  });

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/check", { 
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user || data);
        console.log('Admin auth check successful:', data);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('Admin auth check failed:', response.status);
      }
    } catch (error) {
      console.error('Admin auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST", 
        credentials: "include" 
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setLocation('/auth');
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
        user,
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
