import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Edit, Trash2, Copy, Search, Eye } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SAMPLE_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}',
    category: 'Welcome',
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Password Reset',
    subject: 'Reset Your Password - {{company_name}}',
    category: 'Security',
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'Order Confirmation',
    subject: 'Order Confirmed - #{{order_number}}',
    category: 'Orders',
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '4',
    name: 'Invoice',
    subject: 'Invoice #{{invoice_number}} from {{company_name}}',
    category: 'Billing',
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '5',
    name: 'Newsletter',
    subject: '{{company_name}} Newsletter - {{month_year}}',
    category: 'Marketing',
    is_active: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

const TEMPLATE_CATEGORIES = [
  'Welcome',
  'Security',
  'Orders',
  'Billing',
  'Marketing',
  'Notifications',
  'Custom'
];

export default function EmailTemplatePage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>(SAMPLE_TEMPLATES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [query, setQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    category: 'Custom',
    html_content: '',
    text_content: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        // Update existing template
        const updatedTemplates = templates.map(template => 
          template.id === editingTemplate.id 
            ? { ...template, ...formData, updated_at: new Date().toISOString() }
            : template
        );
        setTemplates(updatedTemplates);
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        // Create new template
        const newTemplate: EmailTemplate = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setTemplates([...templates, newTemplate]);
        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setTemplates(templates.filter(template => template.id !== templateId));
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const duplicatedTemplate: EmailTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTemplates([...templates, duplicatedTemplate]);
      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      category: 'Custom',
      html_content: '',
      text_content: '',
      is_active: true
    });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      category: template.category,
      html_content: '', // In a real app, you'd load the actual content
      text_content: '', // In a real app, you'd load the actual content
      is_active: template.is_active
    });
    setDialogOpen(true);
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      'Welcome': 'bg-blue-100 text-blue-800',
      'Security': 'bg-red-100 text-red-800',
      'Orders': 'bg-green-100 text-green-800',
      'Billing': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-orange-100 text-orange-800',
      'Notifications': 'bg-yellow-100 text-yellow-800',
      'Custom': 'bg-gray-100 text-gray-800'
    };
    return categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(query.toLowerCase()) ||
    template.subject.toLowerCase().includes(query.toLowerCase()) ||
    template.category.toLowerCase().includes(query.toLowerCase())
  );

  const activeTemplates = templates.filter(template => template.is_active).length;
  const inactiveTemplates = templates.filter(template => !template.is_active).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Total Templates</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{templates.length}</div>
            <p className="text-sm text-gray-600">
              Email templates
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Active Templates</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{activeTemplates}</div>
            <p className="text-sm text-gray-600">
              Ready to use
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Categories</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{TEMPLATE_CATEGORIES.length}</div>
            <p className="text-sm text-gray-600">
              Template categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Templates Table */}
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Email Templates
          </CardTitle>
          <CardDescription>Manage your email templates and their content</CardDescription>
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search templates..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="pl-10 w-80" 
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="hover:shadow-lg transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter template name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="html_content">HTML Content</Label>
                    <Textarea
                      id="html_content"
                      value={formData.html_content}
                      onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                      placeholder="Enter HTML content for the email"
                      rows={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text_content">Plain Text Content</Label>
                    <Textarea
                      id="text_content"
                      value={formData.text_content}
                      onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                      placeholder="Enter plain text content for the email"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <Label htmlFor="is_active">Active Template</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="font-medium">{template.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{template.subject}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryBadge(template.category)}>
                      {template.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(template.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No templates found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {query ? 'No templates match your search criteria.' : 'Create your first email template to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
