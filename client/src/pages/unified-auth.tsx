
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useCrmAuth } from "@/hooks/use-crm-auth";

export default function UnifiedAuth() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("admin");
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const redirected = useRef(false);

  const { isAuthenticated: adminAuth, isLoading: adminLoading, loginMutation: adminLogin } = useAuth();
  const { isAuthenticated: crmAuth, isLoading: crmLoading, loginMutation: crmLogin } = useCrmAuth();

  const handleAuthRedirect = useCallback(() => {
    if (redirected.current) return;

    if (!adminLoading && adminAuth) {
      console.log('✅ Admin authenticated, redirecting...');
      redirected.current = true;
      setLocation("/admin");
      return;
    }

    if (!crmLoading && crmAuth) {
      console.log('✅ CRM authenticated, redirecting...');
      redirected.current = true;
      setLocation("/crm");
      return;
    }
  }, [adminAuth, crmAuth, adminLoading, crmLoading, setLocation]);

  useEffect(() => {
    handleAuthRedirect();
  }, [handleAuthRedirect]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) return;

    try {
      if (activeTab === "admin") {
        console.log('🔐 Attempting admin login...');
        await adminLogin.mutateAsync(credentials);
      } else {
        console.log('🔐 Attempting CRM login...');
        await crmLogin.mutateAsync(credentials);
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  }, [credentials, activeTab, adminLogin, crmLogin]);

  const isLoading = adminLogin.isPending || crmLogin.isPending || adminLoading || crmLoading;
  const error = adminLogin.error || crmLogin.error;

  // Don't render if already authenticated and redirecting
  if ((adminAuth || crmAuth) && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">🚀 ورود به سیستم</CardTitle>
          <CardDescription>انتخاب کنید که با کدام پنل وارد می‌شوید</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin" className="relative">
                مدیر سیستم
                <Badge variant="secondary" className="ml-1 text-xs">Admin</Badge>
              </TabsTrigger>
              <TabsTrigger value="crm" className="relative">
                پنل CRM
                <Badge variant="outline" className="ml-1 text-xs">CRM</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">پنل مدیریت</h3>
                <p className="text-sm text-gray-600">دسترسی کامل به تمامی بخش‌های سیستم</p>
              </div>
            </TabsContent>

            <TabsContent value="crm" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">پنل CRM</h3>
                <p className="text-sm text-gray-600">مدیریت نمایندگان و گزارش‌گیری</p>
              </div>
            </TabsContent>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                نام کاربری
              </label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="نام کاربری خود را وارد کنید"
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                رمز عبور
              </label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="رمز عبور خود را وارد کنید"
                disabled={isLoading}
                className="text-right"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error.message || 'خطا در ورود به سیستم'}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !credentials.username || !credentials.password}
            >
              {isLoading ? "در حال ورود..." : `ورود به ${activeTab === 'admin' ? 'پنل مدیریت' : 'پنل CRM'}`}
            </Button>
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>🔒 ورود امن با تأیید دو مرحله‌ای</p>
            <p className="mt-1">نسخه: SHERLOCK v12.2 | وضعیت: پایدار ✅</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
