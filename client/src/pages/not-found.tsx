import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [location, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 صفحه یافت نشد</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            مسیر درخواستی: <code className="bg-gray-100 px-1 rounded">{location}</code>
          </p>
          
          <p className="mt-2 text-sm text-gray-600">
            این صفحه در سیستم موجود نیست.
          </p>

          <Button 
            onClick={handleGoHome}
            className="mt-4 w-full"
            variant="outline"
          >
            <Home className="w-4 h-4 ml-2" />
            بازگشت به صفحه اصلی
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
