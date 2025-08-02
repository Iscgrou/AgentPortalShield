import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { CrmAuthProvider, useCrmAuth } from "./hooks/use-crm-auth";

// Layout components
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

// Pages
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import InvoiceManagement from "@/pages/InvoiceManagement";
import Representatives from "@/pages/representatives";
import SalesPartners from "@/pages/sales-partners";


import Settings from "@/pages/settings";
import PublicPortal from "@/pages/public-portal";
import PublicPortalNew from "@/pages/public-portal-new";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";
import UnifiedAuth from "@/pages/unified-auth";

// Lazy load Modern CRM Dashboard (New Unified Architecture)
const ModernCrmDashboard = lazy(() => import('./components/crm/modern-crm-dashboard'));

// CRM Protected Routes Component
function CrmProtectedRoutes() {
  const { user, isLoading } = useCrmAuth();
  const [, setLocation] = useLocation();

  // FORCE LOGIN EVERY TIME - No auto-authentication
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('CRM Authentication required, redirecting to login...');
      setLocation('/'); // Always redirect to login page
    } else if (user) {
      console.log('CRM User authenticated:', user);
    }
  }, [user, isLoading, setLocation]);

  // Show loading while checking authentication
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

  // Return null while redirecting
  if (!user) {
    return null;
  }

  // 🔥 NEW: Render Modern CRM Dashboard (Unified Interface)
  return (
    <Switch>
      <Route path="/crm">
        {() => (
          <Suspense fallback={
            <div className="min-h-screen clay-background relative flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-white text-lg">بارگذاری پنل CRM مدرن...</p>
                <p className="text-blue-200 text-sm mt-2">معماری یکپارچه جدید</p>
              </div>
            </div>
          }>
            <ModernCrmDashboard />
          </Suspense>
        )}
      </Route>
    </Switch>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-panel-background dark">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="main-content lg:mr-80 mr-0 relative z-10">
        <Header onMenuClick={toggleSidebar} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AuthenticatedRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Check if this is a public portal route
  const isPublicPortal = location.startsWith('/portal/') || location.startsWith('/representative/');
  const isCrmRoute = location.startsWith('/crm');
  
  if (isPublicPortal) {
    // 🔒 SECURITY: Completely isolated public portal - no admin access
    return (
      <div className="dark public-portal-isolated">
        <Switch>
          <Route path="/portal/:publicId" component={PublicPortalNew} />
          <Route path="/representative/:publicId" component={PublicPortalNew} />
          <Route path="/portal/*">
            {() => (
              <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-400 text-6xl mb-4">⚠</div>
                  <h1 className="text-2xl font-bold mb-2">پورتال یافت نشد</h1>
                  <p className="text-gray-400">
                    لینک پورتال نامعتبر است. لطفاً لینک صحیح را از مدیر سیستم دریافت کنید.
                  </p>
                </div>
              </div>
            )}
          </Route>
          <Route path="/representative/*">
            {() => (
              <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-400 text-6xl mb-4">⚠</div>
                  <h1 className="text-2xl font-bold mb-2">پورتال یافت نشد</h1>
                  <p className="text-gray-400">
                    لینک پورتال نامعتبر است. لطفاً لینک صحیح را از مدیر سیستم دریافت کنید.
                  </p>
                </div>
              </div>
            )}
          </Route>
        </Switch>
      </div>
    );
  }

  // SHERLOCK v3.0 FIX: Always require login for CRM routes
  if (isCrmRoute) {
    return (
      <CrmAuthProvider>
        <CrmProtectedRoutes />
      </CrmAuthProvider>
    );
  }
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }
  
  // SHERLOCK v3.0 FIX: Always show unified auth for non-authenticated users
  if (!isAuthenticated) {
    return (
      <CrmAuthProvider>
        <UnifiedAuth />
      </CrmAuthProvider>
    );
  }
  
  // Show admin panel if authenticated
  return (
    <AdminLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/representatives" component={Representatives} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/invoice-management" component={InvoiceManagement} />
        <Route path="/sales-partners" component={SalesPartners} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="rtl">
            <Toaster />
            <AuthenticatedRouter />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
