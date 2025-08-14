import { BrowserRouter as Router, Routes, Route, Navigate } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useLocation } from "wouter";
import { useEffect, useCallback, useRef } from "react";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { CrmAuthProvider, useCrmAuth } from "@/hooks/use-crm-auth";

// Pages
import UnifiedAuth from "@/pages/unified-auth";
import Dashboard from "@/pages/dashboard";
import Representatives from "@/pages/representatives";
import Invoices from "@/pages/invoices";
import SalesPartners from "@/pages/sales-partners";
import FinancialIntegrity from "@/pages/financial-integrity";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AdminProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const redirected = useRef(false);

  const handleAuthRedirect = useCallback(() => {
    if (!isLoading && !isAuthenticated && !redirected.current) {
      console.log('Admin Authentication required, redirecting to login...');
      redirected.current = true;
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    handleAuthRedirect();
  }, [handleAuthRedirect]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Prevent rendering while redirecting
  }

  return (
    <Routes>
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/representatives" component={Representatives} />
      <Route path="/admin/invoices" component={Invoices} />
      <Route path="/admin/sales-partners" component={SalesPartners} />
      <Route path="/admin/financial-integrity" component={FinancialIntegrity} />
      <Route path="/admin/settings" component={Settings} />
      <Route path="/admin/*" component={NotFound} />
    </Routes>
  );
}

function CrmProtectedRoutes() {
  const { user, isLoading } = useCrmAuth();
  const [, setLocation] = useLocation();
  const redirected = useRef(false);

  const handleAuthRedirect = useCallback(() => {
    if (!isLoading && !user && !redirected.current) {
      console.log('CRM Authentication required, redirecting to login...');
      redirected.current = true;
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    handleAuthRedirect();
  }, [handleAuthRedirect]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بررسی احراز هویت CRM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Prevent rendering while redirecting
  }

  return (
    <Routes>
      <Route path="/crm" component={Dashboard} />
      <Route path="/crm/representatives" component={Representatives} />
      <Route path="/crm/invoices" component={Invoices} />
      <Route path="/crm/settings" component={Settings} />
      <Route path="/crm/*" component={NotFound} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CrmAuthProvider>
            <Routes>
              <Route path="/" component={UnifiedAuth} />
              <Route path="/admin/*" component={AdminProtectedRoutes} />
              <Route path="/crm/*" component={CrmProtectedRoutes} />
              <Route component={NotFound} />
            </Routes>
            <Toaster />
          </CrmAuthProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;