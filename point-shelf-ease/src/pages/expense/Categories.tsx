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

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  totalExpenses: number;
  expenseCount: number;
  isActive: boolean;
}

const SAMPLE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'cat1',
    name: 'Office Expenses',
    description: 'General office supplies and materials',
    color: 'blue',
    totalExpenses: 1250.00,
    expenseCount: 15,
    isActive: true
  },
  {
    id: 'cat2',
    name: 'Utilities',
    description: 'Electricity, water, internet, and phone bills',
    color: 'green',
    totalExpenses: 890.50,
    expenseCount: 8,
    isActive: true
  },
  {
    id: 'cat3',
    name: 'Marketing',
    description: 'Advertising, promotions, and marketing campaigns',
    color: 'purple',
    totalExpenses: 2500.00,
    expenseCount: 12,
    isActive: true
  },
  {
    id: 'cat4',
    name: 'Equipment',
    description: 'Computers, furniture, and office equipment',
    color: 'orange',
    totalExpenses: 3200.00,
    expenseCount: 6,
    isActive: true
  },
  {
    id: 'cat5',
    name: 'Travel',
    description: 'Business trips, transportation, and accommodation',
    color: 'red',
    totalExpenses: 1800.00,
    expenseCount: 10,
    isActive: true
  },
  {
    id: 'cat6',
    name: 'Insurance',
    description: 'Business insurance policies',
    color: 'gray',
    totalExpenses: 1200.00,
    expenseCount: 3,
    isActive: false
  }
];

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>(SAMPLE_CATEGORIES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: 'blue',
    isActive: true
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Update existing category
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...form }
          : cat
      ));
    } else {
      // Add new category
      const newCategory: ExpenseCategory = {
        id: `cat${Date.now()}`,
        ...form,
        totalExpenses: 0,
        expenseCount: 0
      };
      setCategories(prev => [...prev, newCategory]);
    }
    
    setForm({ name: '', description: '', color: 'blue', isActive: true });
    setEditingCategory(null);
    setDialogOpen(false);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description,
      color: category.color,
      isActive: category.isActive
    });
    setDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const resetForm = () => {
    setForm({ name: '', description: '', color: 'blue', isActive: true });
    setEditingCategory(null);
  };

  const colorOptions = [
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
    { value: 'red', label: 'Red' },
    { value: 'gray', label: 'Gray' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'pink', label: 'Pink' }
  ];

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      pink: 'bg-pink-100 text-pink-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const totalExpenses = categories.reduce((sum, cat) => sum + cat.totalExpenses, 0);

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Expense Categories</CardTitle>
              <CardDescription>Manage expense categories and classifications</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Category description"
                      rows={3}
                    />
                  </div>
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
                      {editingCategory ? 'Update' : 'Create'} Category
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
              <div className="text-2xl font-bold text-blue-600">{totalCategories}</div>
              <div className="text-sm text-blue-600">Total Categories</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeCategories}</div>
              <div className="text-sm text-green-600">Active Categories</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
              <div className="text-sm text-red-600">Total Expenses</div>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-xs truncate" title={category.description}>
                    {category.description}
                  </TableCell>
                  <TableCell>
                    <Badge className={getColorClass(category.color)}>
                      {category.color}
                    </Badge>
                  </TableCell>
                  <TableCell>{category.expenseCount}</TableCell>
                  <TableCell className="font-medium text-destructive">
                    ${category.totalExpenses.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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
