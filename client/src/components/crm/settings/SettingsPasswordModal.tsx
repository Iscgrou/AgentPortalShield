import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const passwordSchema = z.object({
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type PasswordForm = z.infer<typeof passwordSchema>;

interface SettingsPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Default settings access password (as per requirements: Aa867945)
const SETTINGS_ACCESS_PASSWORD = 'Aa867945';

export function SettingsPasswordModal({ isOpen, onClose, onSuccess }: SettingsPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (data: PasswordForm) => {
    setIsVerifying(true);
    setError(null);

    // Simulate verification delay for security
    await new Promise(resolve => setTimeout(resolve, 800));

    if (data.password === SETTINGS_ACCESS_PASSWORD) {
      toast({
        title: 'دسترسی تایید شد',
        description: 'به تنظیمات سیستم خوش آمدید',
      });
      form.reset();
      onSuccess();
      onClose();
    } else {
      setError('رمز عبور نادرست است. تنها مدیر واحد CRM دسترسی دارد.');
      form.setValue('password', '');
    }

    setIsVerifying(false);
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            احراز هویت تنظیمات
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            برای دسترسی به تنظیمات سیستم، رمز عبور مدیر CRM را وارد کنید
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-300">
                <Lock className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">رمز عبور مدیر CRM</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="رمز عبور را وارد کنید"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pl-12"
                        disabled={isVerifying}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        disabled={isVerifying}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                disabled={isVerifying}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    در حال بررسی...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 ml-2" />
                    تایید دسترسی
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-blue-300 text-sm text-center">
            🔒 تنها مدیر واحد CRM به این بخش دسترسی دارد
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}