import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { taskGenerator } from '@/api/functions';
import { Agent } from '@/api/entities';

export default function QuickTaskForm({ resellerId, resellerName, onTaskCreated }) {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const activeAgents = await Agent.filter({ is_active: true }); // <-- BUG FIX: Load only active agents
                setAgents(activeAgents);
            } catch (error) {
                console.error("Error fetching agents:", error);
            }
        };
        fetchAgents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAgent || !context) {
            // Simple validation feedback
            alert('لطفا کارمند و زمینه وظیفه را مشخص کنید.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await taskGenerator({
                action: 'generate_task',
                reseller_id: resellerId,
                agent_id: selectedAgent,
                task_type: 'follow_up', // Default to follow_up for quick tasks
                context: context
            });

            if (data.task) {
                onTaskCreated(data.task);
                setContext('');
                setSelectedAgent('');
            } else {
                throw new Error(data.error || 'Failed to create task');
            }
        } catch (error) {
            console.error("Error creating quick task:", error);
            alert(`خطا در ایجاد وظیفه: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg border space-y-3">
            <h4 className="font-semibold text-gray-800">ایجاد وظیفه سریع برای {resellerName}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <Select onValueChange={setSelectedAgent} value={selectedAgent}>
                    <SelectTrigger>
                        <SelectValue placeholder="انتخاب کارمند" />
                    </SelectTrigger>
                    <SelectContent>
                        {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input 
                    placeholder="موضوع وظیفه (مثلا: پیگیری سفارش)" 
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'در حال ایجاد...' : <><Send className="w-4 h-4 ml-2" /> ایجاد و تخصیص وظیفه</>}
            </Button>
        </form>
    );
}