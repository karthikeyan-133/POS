import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

export default function AddNewReminderPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: '',
    category: '',
    assignedTo: '',
    reminderTime: '',
    repeat: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const priorities = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ];

  const categories = [
    'Inventory',
    'Supplier',
    'Customer',
    'Reports',
    'Maintenance',
    'Sales',
    'Purchase',
    'General',
    'Other'
  ];

  const teamMembers = [
    'John Smith',
    'Sarah Johnson',
    'Mike Chen',
    'Lisa Brown',
    'Alex Rodriguez',
    'David Kim',
    'Emma Wilson',
    'Robert Taylor'
  ];

  const reminderTimes = [
    '15 minutes before',
    '30 minutes before',
    '1 hour before',
    '2 hours before',
    '1 day before',
    '2 days before',
    '1 week before'
  ];

  const repeatOptions = [
    'No Repeat',
    'Daily',
    'Weekly',
    'Monthly',
    'Yearly',
    'Custom'
  ];

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">New Reminder</CardTitle>
        <CardDescription>Create a new reminder or notification</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={form.title} 
                onChange={(e) => handleChange('title', e.target.value)} 
                placeholder="Reminder title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={form.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Detailed description of the reminder"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate" 
                type="date" 
                value={form.dueDate} 
                onChange={(e) => handleChange('dueDate', e.target.value)} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input 
                id="dueTime" 
                type="time" 
                value={form.dueTime} 
                onChange={(e) => handleChange('dueTime', e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={form.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select value={form.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member} value={member}>{member}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminderTime">Reminder Time</Label>
              <Select value={form.reminderTime} onValueChange={(value) => handleChange('reminderTime', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="When to remind" />
                </SelectTrigger>
                <SelectContent>
                  {reminderTimes.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="repeat">Repeat</Label>
              <Select value={form.repeat} onValueChange={(value) => handleChange('repeat', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Repeat option" />
                </SelectTrigger>
                <SelectContent>
                  {repeatOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              value={form.notes} 
              onChange={(e) => handleChange('notes', e.target.value)} 
              placeholder="Any additional notes or instructions..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/reminder')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Reminder'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
