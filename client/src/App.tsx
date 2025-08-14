
import { Router, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useLocation } from "wouter";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/contexts/auth-context";

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
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ path, component: Component, requiredRole }: { 
  path: string; 
  component: React.ComponentType; 
  requiredRole?: 'ADMIN' | 'CRM';
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log(`Authentication required for ${path}, redirecting to login`);
      setLocation('/');
      return;
    }

    if (!isLoading && isAuthenticated && user && requiredRole) {
      if (user.role !== requiredRole) {
        console.log(`Access denied: user role ${user.role} !== required ${requiredRole}`);
        setLocation('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, path, requiredRole, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <Component />;
}

function AppRoutes() {
  return (
    <>
      <Route path="/" component={UnifiedAuth} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute path="/admin" component={Dashboard} requiredRole="ADMIN" />
      </Route>
      <Route path="/admin/">
        <ProtectedRoute path="/admin/" component={Dashboard} requiredRole="ADMIN" />
      </Route>
      <Route path="/admin/representatives">
        <ProtectedRoute path="/admin/representatives" component={Representatives} requiredRole="ADMIN" />
      </Route>
      <Route path="/admin/invoices">
        <ProtectedRoute path="/admin/invoices" component={Invoices} requiredRole="ADMIN" />
      </Route>
      <Route path="/admin/sales-partners">
        <ProtectedRoute path="/admin/sales-partners" component={SalesPartners} requiredRole="ADMIN" />
      </Route>
      <Route path="/admin/financial-integrity">
        <ProtectedRoute path="/admin/financial-integrity" component={FinancialIntegrity} requiredRole="ADMIN" />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute path="/admin/settings" component={Settings} requiredRole="ADMIN" />
      </Route>

      {/* CRM Routes */}
      <Route path="/crm">
        <ProtectedRoute path="/crm" component={Dashboard} requiredRole="CRM" />
      </Route>
      <Route path="/crm/">
        <ProtectedRoute path="/crm/" component={Dashboard} requiredRole="CRM" />
      </Route>
      <Route path="/crm/representatives">
        <ProtectedRoute path="/crm/representatives" component={Representatives} requiredRole="CRM" />
      </Route>
      <Route path="/crm/invoices">
        <ProtectedRoute path="/crm/invoices" component={Invoices} requiredRole="CRM" />
      </Route>
      <Route path="/crm/settings">
        <ProtectedRoute path="/crm/settings" component={Settings} requiredRole="CRM" />
      </Route>

      {/* Catch all */}
      <Route path="/:rest*" component={NotFound} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
