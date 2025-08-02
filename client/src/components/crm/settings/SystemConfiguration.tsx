import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Key, 
  TestTube, 
  Check, 
  X,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

export function SystemConfiguration() {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);

  const handleApiKeyTest = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً کلید API را وارد کنید",
        variant: "destructive"
      });
      return;
    }

    setIsTestingApi(true);
    try {
      const response = await fetch('/api/crm/settings/test-xai-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });

      const result = await response.json();
      setApiTestResult(result);

      if (result.success) {
        toast({
          title: "✅ تست موفق",
          description: "اتصال به xAI Grok برقرار شد"
        });
      } else {
        toast({
          title: "❌ تست ناموفق",
          description: result.error || "خطا در اتصال",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('API test error:', error);
      toast({
        title: "خطا",
        description: "خطا در ارسال درخواست",
        variant: "destructive"
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً کلید API را وارد کنید",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/crm/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'XAI_GROK_API_KEY',
          value: apiKey,
          category: 'API_KEYS',
          description: 'کلید API برای xAI Grok',
          isEncrypted: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ ذخیره شد",
          description: "کلید API با موفقیت ذخیره شد"
        });
      } else {
        toast({
          title: "خطا",
          description: result.error || "خطا در ذخیره",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Save API key error:', error);
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* xAI Grok Configuration */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                🤖 تنظیمات xAI Grok
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                پیکربندی موتور هوش مصنوعی
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              کلید API
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button 
                onClick={handleApiKeyTest} 
                disabled={isTestingApi || !apiKey.trim()}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                {isTestingApi ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin ml-2" />
                    در حال تست...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 ml-2" />
                    تست
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* API Test Result */}
          {apiTestResult && (
            <div className={`p-4 rounded-lg ${
              apiTestResult.success 
                ? 'bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800' 
                : 'bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {apiTestResult.success ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-medium ${
                  apiTestResult.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {apiTestResult.success ? 'تست موفق' : 'تست ناموفق'}
                </span>
                {apiTestResult.responseTime && (
                  <Badge variant="outline" className="text-xs">
                    {apiTestResult.responseTime}ms
                  </Badge>
                )}
              </div>
              
              {apiTestResult.success && apiTestResult.response && (
                <div className="text-sm text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 p-2 rounded border">
                  📝 پاسخ: {apiTestResult.response}
                </div>
              )}
              
              {!apiTestResult.success && apiTestResult.error && (
                <div className="text-sm text-red-700 dark:text-red-300">
                  ❌ خطا: {apiTestResult.error}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 ml-2" />
              ذخیره کلید API
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                📊 وضعیت سیستم
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                نظارت بر عملکرد سیستم
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-green-800 dark:text-green-200 font-medium">
                🗄️ دیتابیس
              </span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                متصل
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                🔗 API Gateway
              </span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                فعال
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-purple-800 dark:text-purple-200 font-medium">
                🤖 xAI Grok
              </span>
              <Badge className={`${
                apiTestResult?.success 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {apiTestResult?.success ? 'متصل' : 'نیاز به تست'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <span className="text-orange-800 dark:text-orange-200 font-medium">
                🔐 احراز هویت
              </span>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                فعال
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            🔧 اطلاعات محیط
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">نسخه سیستم:</span>
              <div className="font-medium text-gray-900 dark:text-white">DA VINCI v1.0</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">محیط:</span>
              <div className="font-medium text-gray-900 dark:text-white">Development</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">آخرین بروزرسانی:</span>
              <div className="font-medium text-gray-900 dark:text-white">آگوست 2025</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}