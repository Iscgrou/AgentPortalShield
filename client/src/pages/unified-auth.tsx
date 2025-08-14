
// 🔐 UNIFIED AUTHENTICATION PAGE - Stable Login (SHERLOCK v4.0 FIXED)
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Brain, 
  Eye, 
  EyeOff,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useCrmAuth } from '@/hooks/use-crm-auth';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function UnifiedAuth() {
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'detecting' | 'admin' | 'crm'>('detecting');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get both auth contexts
  const adminAuth = useAuth();
  const crmAuth = useCrmAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // Stable navigation function
  const navigateToDestination = useCallback((path: string) => {
    console.log('🔄 Navigating to:', path);
    setTimeout(() => {
      setLocation(path);
    }, 1500);
  }, [setLocation]);

  // Set panel type
  const selectAdminPanel = useCallback(() => {
    setLoginType('admin');
    reset();
  }, [reset]);

  const selectCrmPanel = useCallback(() => {
    setLoginType('crm');
    reset();
  }, [reset]);

  const onSubmit = async (data: LoginForm) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Determine login type based on username
      const targetLoginType = data.username === 'mgr' ? 'admin' : 'crm';
      const targetRedirect = targetLoginType === 'admin' ? '/dashboard' : '/crm';
      
      if (targetLoginType === 'admin') {
        // Admin login
        adminAuth.loginMutation.mutate(data, {
          onSuccess: () => {
            console.log('✅ Admin login successful');
            toast({
              title: "ورود موفق",
              description: "به پنل ادمین خوش آمدید",
            });
            navigateToDestination(targetRedirect);
          },
          onError: (error: any) => {
            console.error('❌ Admin login error:', error);
            toast({
              title: "خطا در ورود ادمین",
              description: error.message || "خطا در احراز هویت",
              variant: "destructive",
            });
            setIsSubmitting(false);
          }
        });
      } else {
        // CRM login
        crmAuth.loginMutation.mutate(data, {
          onSuccess: (response: any) => {
            console.log('✅ CRM login successful');
            toast({
              title: "ورود موفق",
              description: "به پنل CRM خوش آمدید",
            });
            navigateToDestination(targetRedirect);
          },
          onError: (error: any) => {
            console.error('❌ CRM login error:', error);
            toast({
              title: "خطا در ورود CRM",
              description: error.message || "خطا در احراز هویت",
              variant: "destructive",
            });
            setIsSubmitting(false);
          }
        });
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast({
        title: "خطا در ورود",
        description: "مشکل در برقراری ارتباط با سرور",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen clay-background relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="w-full p-6">
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
                      <Shield className="w-6 h-6" />
                      <div className="text-right">
                        <div className="font-semibold">پنل ادمین</div>
                        <div className="text-xs opacity-90">مدیریت کامل سیستم</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={selectCrmPanel}
                    className="w-full h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
                  >
                    <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                      <Users className="w-6 h-6" />
                      <div className="text-right">
                        <div className="font-semibold">پنل CRM</div>
                        <div className="text-xs opacity-90">مدیریت روابط مشتریان</div>
                      </div>
                    </div>
                  </Button>
                  
                  {/* Information Cards */}
                  <div className="mt-8 space-y-3">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-2 text-blue-200 text-sm">
                        <Settings className="w-4 h-4" />
                        <span>ادمین: مدیریت فاکتورها، پرداخت‌ها، گزارش‌گیری</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-2 text-purple-200 text-sm">
                        <Brain className="w-4 h-4" />
                        <span>CRM: هوش مصنوعی، تحلیل نمایندگان، وظایف</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Login Form
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-white text-sm font-medium">
                        نام کاربری
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder={loginType === 'admin' ? 'نام کاربری ادمین' : 'نام کاربری CRM'}
                        className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                        disabled={isSubmitting}
                        {...register('username')}
                      />
                      {errors.username && (
                        <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-white text-sm font-medium">
                        رمز عبور
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="رمز عبور"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 pr-10"
                          disabled={isSubmitting}
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full h-12 font-semibold ${
                        loginType === 'admin' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                      } text-white border-0`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>در حال ورود...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          {loginType === 'admin' ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                          <span>ورود به پنل {loginType === 'admin' ? 'ادمین' : 'CRM'}</span>
                        </div>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setLoginType('detecting')}
                      variant="outline"
                      className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                      disabled={isSubmitting}
                    >
                      بازگشت به انتخاب پنل
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="w-full p-6 text-center">
          <p className="text-blue-200 text-sm">
            © 2025 MarFaNet - سیستم یکپارچه مدیریت مالی و CRM
          </p>
        </div>
      </div>
    </div>
  );
}
