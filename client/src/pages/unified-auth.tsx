
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useCrmAuth } from "@/hooks/use-crm-auth";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است")
});

type LoginForm = z.infer<typeof loginSchema>;

export default function UnifiedAuth() {
  const [loginType, setLoginType] = useState<'detecting' | 'admin' | 'crm'>('detecting');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Admin auth
  const { loginMutation: adminLoginMutation, isAuthenticated: isAdminAuth } = useAuth();
  
  // CRM auth
  const { loginMutation: crmLoginMutation, isAuthenticated: isCrmAuth } = useCrmAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuth) {
      console.log('Admin already authenticated, redirecting to dashboard');
      setLocation('/dashboard');
    } else if (isCrmAuth) {
      console.log('CRM already authenticated, redirecting to CRM panel');
      setLocation('/crm');
    }
  }, [isAdminAuth, isCrmAuth, setLocation]);

  const selectAdminPanel = () => {
    setLoginType('admin');
    form.reset();
    setError(null);
  };

  const selectCrmPanel = () => {
    setLoginType('crm');
    form.reset();
    setError(null);
  };

  const goBack = () => {
    setLoginType('detecting');
    form.reset();
    setError(null);
  };

  const onSubmit = async (data: LoginForm) => {
    setError(null);

    if (loginType === 'admin') {
      adminLoginMutation.mutate(data, {
        onSuccess: () => {
          toast({
            title: "ورود موفق",
            description: "به پنل مدیریت خوش آمدید"
          });
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error || error?.message || "خطا در ورود";
          setError(errorMessage);
          toast({
            title: "خطا در ورود",
            description: errorMessage,
            variant: "destructive"
          });
        }
      });
    } else if (loginType === 'crm') {
      crmLoginMutation.mutate(data, {
        onSuccess: () => {
          toast({
            title: "ورود موفق",
            description: "به پنل CRM خوش آمدید"
          });
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error || error?.message || "خطا در ورود";
          setError(errorMessage);
          toast({
            title: "خطا در ورود",
            description: errorMessage,
            variant: "destructive"
          });
        }
      });
    }
  };

  const isLoading = adminLoginMutation.isPending || crmLoginMutation.isPending;

  return (
    <div className="min-h-screen clay-background relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/20"></div>
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">MarFaNet</h1>
          <p className="text-blue-200">سیستم یکپارچه مدیریت مالی و CRM</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              {loginType === 'detecting' ? 'انتخاب پنل' : 
               loginType === 'admin' ? 'ورود ادمین' : 'ورود CRM'}
            </CardTitle>
            <CardDescription className="text-blue-200">
              {loginType === 'detecting' ? 'لطفاً پنل مورد نظر را انتخاب کنید' :
               loginType === 'admin' ? 'مدیریت کامل سیستم مالی' : 'مدیریت روابط مشتریان'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loginType === 'detecting' ? (
              // Panel Selection
              <div className="space-y-4">
                <Button
                  onClick={selectAdminPanel}
                  className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
                >
                  <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                    <div className="text-right">
                      <div className="font-bold text-lg">پنل ادمین</div>
                      <div className="text-sm text-blue-100">مدیریت کامل سیستم</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={selectCrmPanel}
                  className="w-full h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
                >
                  <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                    <div className="text-right">
                      <div className="font-bold text-lg">پنل CRM</div>
                      <div className="text-sm text-purple-100">مدیریت روابط مشتریان</div>
                    </div>
                  </div>
                </Button>
              </div>
            ) : (
              // Login Form
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="bg-red-900/50 border-red-500">
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">نام کاربری</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            autoComplete="username"
                            disabled={isLoading}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            placeholder="نام کاربری خود را وارد کنید"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">رمز عبور</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            placeholder="رمز عبور خود را وارد کنید"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className={`w-full ${
                        loginType === 'admin' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                      } text-white border-0`}
                      disabled={isLoading}
                    >
                      {isLoading ? "در حال ورود..." : "ورود"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                      disabled={isLoading}
                    >
                      بازگشت به انتخاب پنل
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
