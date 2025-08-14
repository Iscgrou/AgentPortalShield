import { Suspense, lazy, useState } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { TooltipProvider } from "@/components/ui/tooltip";

// Lazy load components
const UnifiedAuth = lazy(() => import("@/pages/unified-auth"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Invoices = lazy(() => import("@/pages/invoices"));
const InvoiceManagement = lazy(() => import("@/pages/InvoiceManagement"));
const Representatives = lazy(() => import("@/pages/representatives"));
const SalesPartners = lazy(() => import("@/pages/sales-partners"));
const Settings = lazy(() => import("@/pages/settings"));
const Portal = lazy(() => import("@/pages/portal"));
const FinancialIntegrity = lazy(() => import("@/pages/financial-integrity"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AdminLogin = lazy(() => import("@/pages/admin-login")); // Assuming AdminLogin is still needed for initial admin login flow, though UnifiedAuth might cover it.

// Admin Layout Components
const Sidebar = lazy(() => import("@/components/layout/sidebar"));
const Header = lazy(() => import("@/components/layout/header"));

// CRM Components
const ModernCrmDashboard = lazy(() => import("@/components/crm/modern-crm-dashboard"));
const { CrmAuthProvider } = lazy(() => import("@/hooks/use-crm-auth"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingSpinner({ message = "بارگذاری..." }: { message?: string }) {
  return (
    <div className="min-h-screen clay-background relative flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-white text-lg">{message}</p>
      </div>
    </div>
  );
}

function CrmProtectedRoutes() {
  const { user, isLoading } = useCrmAuth(); // Assuming useCrmAuth is correctly imported and provides user/isLoading
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/'); // Redirect to unified auth or login page if CRM auth fails
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <LoadingSpinner message="در حال بررسی احراز هویت CRM..." />;
  }

  if (!user) {
    return null; // Or redirect if not handled by useEffect
  }

  return (
    <Suspense fallback={<LoadingSpinner message="بارگذاری پنل CRM مدرن..." />}>
      <ModernCrmDashboard />
    </Suspense>
  );
}


function AuthenticatedRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner message="بررسی احراز هویت..." />;
  }

  // Handle CRM routes separately with CRM auth provider
  if (location.startsWith("/crm")) {
    return (
      <CrmAuthProvider>
        <CrmProtectedRoutes />
      </CrmAuthProvider>
    );
  }

  // Handle public portal routes (assuming /portal/:publicId and /representative/:publicId)
  if (location.startsWith("/portal/") || location.startsWith("/representative/")) {
    return (
      <Suspense fallback={<LoadingSpinner message="بارگذاری پورتال عمومی..." />}>
        <Portal />
      </Suspense>
    );
  }

  // Redirect to unified auth page if not authenticated for admin routes
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  // Admin panel routes
  return (
    <AdminLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/invoice-management" component={InvoiceManagement} />
        <Route path="/representatives" component={Representatives} />
        <Route path="/sales-partners" component={SalesPartners} />
        <Route path="/financial-integrity" component={FinancialIntegrity} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-panel-background dark">
      <Suspense fallback={<div>بارگذاری ساید بار...</div>}>
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      </Suspense>
      <div className="main-content lg:mr-80 mr-0 relative z-10">
        <Suspense fallback={<div>بارگذاری هدر...</div>}>
          <Header onMenuClick={toggleSidebar} />
        </Suspense>
        <main className="p-4 lg:p-6">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen relative">
            <Switch>
              <Route path="/auth">
                <Suspense fallback={<LoadingSpinner message="بارگذاری صفحه ورود..." />}>
                  <UnifiedAuth />
                </Suspense>
              </Route>
              <Route path="/admin-login"> {/* Added route for admin login */}
                <Suspense fallback={<LoadingSpinner message="بارگذاری صفحه ورود ادمین..." />}>
                  <AdminLogin />
                </Suspense>
              </Route>
              <Route> {/* This is the catch-all for authenticated routes */}
                <AuthenticatedRouter />
              </Route>
            </Switch>
            <Toaster />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}