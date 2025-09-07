import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface InquiryStatus {
  id: string;
  name: string;
  description: string;
  color: string;
  inquiryCount: number;
  isActive: boolean;
  sortOrder: number;
}

const SAMPLE_STATUSES: InquiryStatus[] = [
  {
    id: 'status1',
    name: 'New',
    description: 'Newly received inquiries that need attention',
    color: 'blue',
    inquiryCount: 12,
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'status2',
    name: 'In Progress',
    description: 'Inquiries currently being worked on',
    color: 'orange',
    inquiryCount: 8,
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'status3',
    name: 'Pending',
    description: 'Inquiries waiting for customer response',
    color: 'yellow',
    inquiryCount: 5,
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'status4',
    name: 'Resolved',
    description: 'Inquiries that have been successfully resolved',
    color: 'green',
    inquiryCount: 25,
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'status5',
    name: 'Closed',
    description: 'Inquiries that have been closed',
    color: 'gray',
    inquiryCount: 3,
    isActive: true,
    sortOrder: 5
  }
];

export default function InquiryStatusPage() {
  const [statuses, setStatuses] = useState<InquiryStatus[]>(SAMPLE_STATUSES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<InquiryStatus | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: 'blue',
    isActive: true,
    sortOrder: 1
  });

  const handleChange = (field: string, value: string | boolean | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStatus) {
      setStatuses(prev => prev.map(status => 
        status.id === editingStatus.id ? { ...status, ...form } : status
      ));
    } else {
      const newStatus: InquiryStatus = {
        id: `status${Date.now()}`,
        ...form,
        inquiryCount: 0
      };
      setStatuses(prev => [...prev, newStatus]);
    }
    
    setForm({ name: '', description: '', color: 'blue', isActive: true, sortOrder: 1 });
    setEditingStatus(null);
    setDialogOpen(false);
  };

  const handleEdit = (status: InquiryStatus) => {
    setEditingStatus(status);
    setForm({
      name: status.name,
      description: status.description,
      color: status.color,
      isActive: status.isActive,
      sortOrder: status.sortOrder
    });
    setDialogOpen(true);
  };

  const handleDelete = (statusId: string) => {
    setStatuses(prev => prev.filter(status => status.id !== statusId));
  };

  const resetForm = () => {
    setForm({ name: '', description: '', color: 'blue', isActive: true, sortOrder: 1 });
    setEditingStatus(null);
  };

  const colorOptions = [
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'orange', label: 'Orange' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'red', label: 'Red' },
    { value: 'gray', label: 'Gray' },
    { value: 'purple', label: 'Purple' },
    { value: 'pink', label: 'Pink' }
  ];

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
      purple: 'bg-purple-100 text-purple-800',
      pink: 'bg-pink-100 text-pink-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const totalStatuses = statuses.length;
  const activeStatuses = statuses.filter(status => status.isActive).length;
  const totalInquiries = statuses.reduce((sum, status) => sum + status.inquiryCount, 0);

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Inquiry Statuses</CardTitle>
              <CardDescription>Manage inquiry status categories and workflow</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Status
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingStatus ? 'Edit Status' : 'Add New Status'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Status Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter status name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Status description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <select
                        id="color"
                        value={form.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        {colorOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        value={form.sortOrder}
                        onChange={(e) => handleChange('sortOrder', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingStatus ? 'Update' : 'Create'} Status
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalStatuses}</div>
              <div className="text-sm text-blue-600">Total Statuses</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeStatuses}</div>
              <div className="text-sm text-green-600">Active Statuses</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{totalInquiries}</div>
              <div className="text-sm text-orange-600">Total Inquiries</div>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Inquiries</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map(status => (
                <TableRow key={status.id}>
                  <TableCell className="font-medium">{status.name}</TableCell>
                  <TableCell className="max-w-xs truncate" title={status.description}>
                    {status.description}
                  </TableCell>
                  <TableCell>
                    <Badge className={getColorClass(status.color)}>
                      {status.color}
                    </Badge>
                  </TableCell>
                  <TableCell>{status.inquiryCount}</TableCell>
                  <TableCell>{status.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={status.isActive ? 'default' : 'secondary'}>
                      {status.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(status)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(status.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
