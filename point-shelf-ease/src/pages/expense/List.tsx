import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { expenseService, withErrorHandling, type EnhancedExpense } from '@/integrations/supabase/services';
import { useToast } from '@/hooks/use-toast';

export default function ExpenseListPage() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<EnhancedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const expenses = await withErrorHandling(
        () => expenseService.getAll(),
        'Failed to load expenses'
      );
      setItems(expenses);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load expenses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    console.log('Edit expense:', id);
    // Navigate to edit page or open edit dialog
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await withErrorHandling(
        () => expenseService.delete(id),
        'Failed to delete expense'
      );
      toast({
        title: 'Success',
        description: 'Expense deleted successfully',
      });
      loadExpenses();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.reference.toLowerCase().includes(q) ||
      i.expense_category.toLowerCase().includes(q) ||
      i.user_name.toLowerCase().includes(q) ||
      i.store_location.toLowerCase().includes(q) ||
      (i.notes || '').toLowerCase().includes(q)
    );
  }, [query, items]);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'office expenses':
        return 'default';
      case 'utilities':
        return 'secondary';
      case 'marketing':
        return 'outline';
      case 'equipment':
        return 'destructive';
      case 'travel':
        return 'default';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalExpenses = filtered.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-8 p-1" style={{backgroundColor: '#fafbfc'}}>
      <div className="rounded-xl p-6 border-2" style={{backgroundColor: '#ffffff', borderColor: '#e2e8f0'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2" style={{color: '#1e293b'}}>Expenses</h1>
            <p className="text-lg" style={{color: '#64748b'}}>Manage your business expenses</p>
          </div>
          <Button className="hover:shadow-lg transition-all duration-300">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">Expenses</CardTitle>
        <CardDescription>All business expense records</CardDescription>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by reference, category, user, store location..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-destructive">
            Total: ${totalExpenses.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading expenses...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created Date</TableHead>
                <TableHead>Expense Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Expense Category</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Store/Location</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total Tax</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {query ? 'No expenses found matching your search.' : 'No expenses found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{formatDate(i.created_at)}</TableCell>
                    <TableCell>{formatDate(i.expense_date)}</TableCell>
                    <TableCell className="font-medium text-destructive">
                      ${i.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium">{i.reference}</TableCell>
                    <TableCell>
                      <Badge variant={getCategoryColor(i.expense_category) as any}>
                        {i.expense_category}
                      </Badge>
                    </TableCell>
                    <TableCell>{i.user_name}</TableCell>
                    <TableCell>{i.store_location}</TableCell>
                    <TableCell className="font-medium">
                      ${i.tax.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${i.total_tax.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(i.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(i.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
