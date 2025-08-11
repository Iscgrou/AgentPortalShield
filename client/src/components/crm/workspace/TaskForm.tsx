import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: string;
  createdAt: string;
  isAiGenerated: boolean;
  culturalContext?: string;
}

interface TaskFormProps {
  task?: WorkspaceTask | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskForm({ task, onClose, onSuccess }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || '');
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
  const [status, setStatus] = useState(task?.status || 'PENDING');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !assignedTo || !dueDate) {
      toast({
        title: "خطا در ارسال",
        description: "لطفاً تمام فیلدهای ضروری را پر کنید",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        title,
        description,
        assignedTo,
        priority,
        status,
        dueDate: dueDate.toISOString(),
        isAiGenerated: false
      };

      const response = await fetch(
        task ? `/api/workspace/tasks/${task.id}` : '/api/workspace/tasks',
        {
          method: task ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      toast({
        title: task ? "وظیفه بروزرسانی شد" : "وظیفه جدید ایجاد شد",
        description: "تغییرات با موفقیت ذخیره شد",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "خطا در ذخیره",
        description: "مشکلی در ذخیره وظیفه پیش آمد",
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
          <DialogTitle>{task ? 'ویرایش وظیفه' : 'وظیفه جدید'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {task ? 'اطلاعات وظیفه را ویرایش کنید' : 'اطلاعات وظیفه جدید را وارد کنید'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان وظیفه</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان وظیفه را وارد کنید"
              className="bg-gray-800 border-gray-600"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات وظیفه را وارد کنید"
              className="bg-gray-800 border-gray-600 min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">مسئول انجام</Label>
            <Input
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="نام مسئول را وارد کنید"
              className="bg-gray-800 border-gray-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اولویت</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as 'HIGH' | 'MEDIUM' | 'LOW')}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="انتخاب اولویت" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="HIGH">بالا</SelectItem>
                  <SelectItem value="MEDIUM">متوسط</SelectItem>
                  <SelectItem value="LOW">پایین</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>وضعیت</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="انتخاب وضعیت" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="PENDING">در انتظار</SelectItem>
                  <SelectItem value="IN_PROGRESS">در حال انجام</SelectItem>
                  <SelectItem value="COMPLETED">تکمیل شده</SelectItem>
                  <SelectItem value="CANCELLED">لغو شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>مهلت انجام</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-right bg-gray-800 border-gray-600 hover:bg-gray-700"
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'yyyy/MM/dd') : "انتخاب تاریخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="bg-gray-800"
                />
              </PopoverContent>
            </Popover>
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
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              {isLoading ? 'در حال ذخیره...' : task ? 'بروزرسانی' : 'ایجاد وظیفه'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}