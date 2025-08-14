
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { AlertCircle, Loader2 } from "lucide-react";

export default function UnifiedAuth() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'admin' | 'crm'>("admin");
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated, isLoading, login } = useAuth();

  // Handle redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const targetPath = user.role === 'ADMIN' ? '/admin' : '/crm';
      console.log(`✅ Redirecting to ${targetPath} for ${user.role}`);
      setLocation(targetPath);
    }
  }, [isAuthenticated, user, isLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('نام کاربری و رمز عبور الزامی است');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(credentials, activeTab);
      // Redirect will be handled by useEffect above
    } catch (err: any) {
      setError(err.message || 'خطا در ورود به سیستم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated && user) {
    return null;
  }

  const isProcessing = isSubmitting || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">🚀 ورود به سیستم شرلوک</CardTitle>
          <CardDescription>انتخاب کنید که با کدام پنل وارد می‌شوید</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'admin' | 'crm')} className="w-full">
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
                onChange={(e) => {
                  setCredentials(prev => ({ ...prev, username: e.target.value }));
                  setError(null);
                }}
                placeholder="نام کاربری خود را وارد کنید"
                disabled={isProcessing}
                className="text-right"
                autoComplete="username"
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
                onChange={(e) => {
                  setCredentials(prev => ({ ...prev, password: e.target.value }));
                  setError(null);
                }}
                placeholder="رمز عبور خود را وارد کنید"
                disabled={isProcessing}
                className="text-right"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing || !credentials.username || !credentials.password}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                `ورود به ${activeTab === 'admin' ? 'پنل مدیریت' : 'پنل CRM'}`
              )}
            </Button>
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>🔒 ورود امن با احراز هویت یکپارچه</p>
            <p className="mt-1">نسخه: SHERLOCK v13.0 | وضعیت: پایدار ✅</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
