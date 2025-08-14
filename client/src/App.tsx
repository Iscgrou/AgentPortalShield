
import { Router, Route } from "wouter";
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
  const [location, setLocation] = useLocation();
  const redirected = useRef(false);

  const handleAuthRedirect = useCallback(() => {
    if (!isLoading && !isAuthenticated && !redirected.current && location.startsWith('/admin')) {
      console.log('Admin Authentication required, redirecting to login...');
      redirected.current = true;
      setTimeout(() => setLocation('/'), 100);
    }
  }, [isAuthenticated, isLoading, setLocation, location]);

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
    <>
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/" component={Dashboard} />
      <Route path="/admin/representatives" component={Representatives} />
      <Route path="/admin/invoices" component={Invoices} />
      <Route path="/admin/sales-partners" component={SalesPartners} />
      <Route path="/admin/financial-integrity" component={FinancialIntegrity} />
      <Route path="/admin/settings" component={Settings} />
      <Route path="/admin/:rest*" component={NotFound} />
    </>
  );
}

function CrmProtectedRoutes() {
  const { user, isLoading } = useCrmAuth();
  const [location, setLocation] = useLocation();
  const redirected = useRef(false);

  const handleAuthRedirect = useCallback(() => {
    if (!isLoading && !user && !redirected.current && location.startsWith('/crm')) {
      console.log('CRM Authentication required, redirecting to login...');
      redirected.current = true;
      setTimeout(() => setLocation('/'), 100);
    }
  }, [user, isLoading, setLocation, location]);

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
    <>
      <Route path="/crm" component={Dashboard} />
      <Route path="/crm/" component={Dashboard} />
      <Route path="/crm/representatives" component={Representatives} />
      <Route path="/crm/invoices" component={Invoices} />
      <Route path="/crm/settings" component={Settings} />
      <Route path="/crm/:rest*" component={NotFound} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CrmAuthProvider>
            <Route path="/" component={UnifiedAuth} />
            <AdminProtectedRoutes />
            <CrmProtectedRoutes />
            <Route path="/:rest*" component={NotFound} />
            <Toaster />
          </CrmAuthProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
