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

interface InquirySource {
  id: string;
  name: string;
  description: string;
  color: string;
  inquiryCount: number;
  isActive: boolean;
  conversionRate: number;
}

const SAMPLE_SOURCES: InquirySource[] = [
  {
    id: 'source1',
    name: 'Website',
    description: 'Inquiries from company website contact forms',
    color: 'blue',
    inquiryCount: 45,
    isActive: true,
    conversionRate: 12.5
  },
  {
    id: 'source2',
    name: 'Phone',
    description: 'Inquiries received via phone calls',
    color: 'green',
    inquiryCount: 28,
    isActive: true,
    conversionRate: 18.2
  },
  {
    id: 'source3',
    name: 'Email',
    description: 'Direct email inquiries',
    color: 'purple',
    inquiryCount: 32,
    isActive: true,
    conversionRate: 15.8
  },
  {
    id: 'source4',
    name: 'Social Media',
    description: 'Inquiries from social media platforms',
    color: 'pink',
    inquiryCount: 18,
    isActive: true,
    conversionRate: 8.9
  },
  {
    id: 'source5',
    name: 'Referral',
    description: 'Inquiries from customer referrals',
    color: 'orange',
    inquiryCount: 15,
    isActive: true,
    conversionRate: 22.1
  },
  {
    id: 'source6',
    name: 'Trade Show',
    description: 'Inquiries from trade shows and events',
    color: 'yellow',
    inquiryCount: 8,
    isActive: false,
    conversionRate: 6.5
  }
];

export default function InquirySourcesPage() {
  const [sources, setSources] = useState<InquirySource[]>(SAMPLE_SOURCES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<InquirySource | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: 'blue',
    isActive: true,
    conversionRate: 0
  });

  const handleChange = (field: string, value: string | boolean | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSource) {
      setSources(prev => prev.map(source => 
        source.id === editingSource.id ? { ...source, ...form } : source
      ));
    } else {
      const newSource: InquirySource = {
        id: `source${Date.now()}`,
        ...form,
        inquiryCount: 0
      };
      setSources(prev => [...prev, newSource]);
    }
    
    setForm({ name: '', description: '', color: 'blue', isActive: true, conversionRate: 0 });
    setEditingSource(null);
    setDialogOpen(false);
  };

  const handleEdit = (source: InquirySource) => {
    setEditingSource(source);
    setForm({
      name: source.name,
      description: source.description,
      color: source.color,
      isActive: source.isActive,
      conversionRate: source.conversionRate
    });
    setDialogOpen(true);
  };

  const handleDelete = (sourceId: string) => {
    setSources(prev => prev.filter(source => source.id !== sourceId));
  };

  const resetForm = () => {
    setForm({ name: '', description: '', color: 'blue', isActive: true, conversionRate: 0 });
    setEditingSource(null);
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

  const totalSources = sources.length;
  const activeSources = sources.filter(source => source.isActive).length;
  const totalInquiries = sources.reduce((sum, source) => sum + source.inquiryCount, 0);
  const avgConversionRate = sources.length > 0 
    ? sources.reduce((sum, source) => sum + source.conversionRate, 0) / sources.length 
    : 0;

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Inquiry Sources</CardTitle>
              <CardDescription>Manage inquiry sources and track lead generation channels</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingSource ? 'Edit Source' : 'Add New Source'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Source Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter source name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Source description"
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
                      <Label htmlFor="conversionRate">Conversion Rate (%)</Label>
                      <Input
                        id="conversionRate"
                        type="number"
                        step="0.1"
                        value={form.conversionRate}
                        onChange={(e) => handleChange('conversionRate', parseFloat(e.target.value))}
                        min="0"
                        max="100"
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
                      {editingSource ? 'Update' : 'Create'} Source
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalSources}</div>
              <div className="text-sm text-blue-600">Total Sources</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeSources}</div>
              <div className="text-sm text-green-600">Active Sources</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{totalInquiries}</div>
              <div className="text-sm text-orange-600">Total Inquiries</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{avgConversionRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-600">Avg Conversion</div>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Inquiries</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map(source => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="max-w-xs truncate" title={source.description}>
                    {source.description}
                  </TableCell>
                  <TableCell>
                    <Badge className={getColorClass(source.color)}>
                      {source.color}
                    </Badge>
                  </TableCell>
                  <TableCell>{source.inquiryCount}</TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      {source.conversionRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={source.isActive ? 'default' : 'secondary'}>
                      {source.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(source)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(source.id)}
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
