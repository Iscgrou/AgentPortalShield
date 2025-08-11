import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ReportFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ReportForm({ onClose, onSuccess }: ReportFormProps) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "خطا در ارسال",
        description: "لطفاً متن گزارش را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const reportData = {
        content: content.trim(),
        status,
        submittedBy: 'کاربر CRM' // In real app, get from auth context
      };

      const response = await fetch('/api/workspace/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast({
        title: "گزارش ارسال شد",
        description: "گزارش شما با موفقیت ثبت شد و برای تحلیل ارسال خواهد شد",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "خطا در ارسال گزارش",
        description: "مشکلی در ارسال گزارش پیش آمد",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>ارسال گزارش عملکرد</DialogTitle>
          <DialogDescription className="text-gray-400">
            گزارش خود از انجام وظایف را ارسال کنید
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">متن گزارش</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="گزارش خود از انجام وظایف، چالش‌ها و پیشنهادات را بنویسید..."
              className="bg-gray-800 border-gray-600 min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>وضعیت عملکرد</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="وضعیت را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="COMPLETED">تکمیل شده</SelectItem>
                <SelectItem value="IN_PROGRESS">در حال انجام</SelectItem>
                <SelectItem value="BLOCKED">مسدود</SelectItem>
                <SelectItem value="NEEDS_HELP">نیاز به کمک</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'در حال ارسال...' : 'ارسال گزارش'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}