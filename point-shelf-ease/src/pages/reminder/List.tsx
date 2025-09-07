import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  category: string;
  assignedTo: string;
  createdAt: string;
  reminderTime: string;
}

const SAMPLE: Reminder[] = [
  { 
    id: 'rem1', 
    title: 'Inventory Check', 
    description: 'Check stock levels for electronics department',
    dueDate: '2025-02-15',
    priority: 'High',
    status: 'Pending',
    category: 'Inventory',
    assignedTo: 'John Smith',
    createdAt: '2025-02-01',
    reminderTime: '09:00 AM'
  },
  { 
    id: 'rem2', 
    title: 'Supplier Meeting', 
    description: 'Monthly meeting with ABC Electronics supplier',
    dueDate: '2025-02-20',
    priority: 'Medium',
    status: 'Completed',
    category: 'Supplier',
    assignedTo: 'Sarah Johnson',
    createdAt: '2025-02-02',
    reminderTime: '02:00 PM'
  },
  { 
    id: 'rem3', 
    title: 'Sales Report Review', 
    description: 'Review weekly sales performance report',
    dueDate: '2025-02-10',
    priority: 'High',
    status: 'Overdue',
    category: 'Reports',
    assignedTo: 'Mike Chen',
    createdAt: '2025-02-03',
    reminderTime: '10:00 AM'
  },
  { 
    id: 'rem4', 
    title: 'Customer Follow-up', 
    description: 'Follow up with customer regarding order #12345',
    dueDate: '2025-02-12',
    priority: 'Medium',
    status: 'Pending',
    category: 'Customer',
    assignedTo: 'Lisa Brown',
    createdAt: '2025-02-04',
    reminderTime: '11:30 AM'
  },
  { 
    id: 'rem5', 
    title: 'Equipment Maintenance', 
    description: 'Schedule maintenance for POS terminals',
    dueDate: '2025-02-25',
    priority: 'Low',
    status: 'Scheduled',
    category: 'Maintenance',
    assignedTo: 'Alex Rodriguez',
    createdAt: '2025-02-05',
    reminderTime: '03:00 PM'
  },
];

export default function ReminderListPage() {
  const [query, setQuery] = useState('');
  const [items] = useState<Reminder[]>(SAMPLE);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q) ||
      i.priority.toLowerCase().includes(q) ||
      i.assignedTo.toLowerCase().includes(q)
    );
  }, [query, items]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'scheduled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'inventory':
        return 'default';
      case 'supplier':
        return 'secondary';
      case 'reports':
        return 'outline';
      case 'customer':
        return 'default';
      case 'maintenance':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const totalReminders = filtered.length;
  const pendingReminders = filtered.filter(i => i.status === 'Pending').length;
  const overdueReminders = filtered.filter(i => i.status === 'Overdue').length;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">Reminders</CardTitle>
        <CardDescription>All scheduled reminders and notifications</CardDescription>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title, description, category, or assigned to..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalReminders}</div>
            <div className="text-sm text-blue-600">Total Reminders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingReminders}</div>
            <div className="text-sm text-orange-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{overdueReminders}</div>
            <div className="text-sm text-red-600">Overdue</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Reminder Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.title}</TableCell>
                <TableCell className="max-w-xs truncate" title={i.description}>
                  {i.description}
                </TableCell>
                <TableCell>{i.dueDate}</TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(i.priority) as any}>
                    {i.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(i.status) as any}>
                    {i.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getCategoryColor(i.category) as any}>
                    {i.category}
                  </Badge>
                </TableCell>
                <TableCell>{i.assignedTo}</TableCell>
                <TableCell>{i.reminderTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
