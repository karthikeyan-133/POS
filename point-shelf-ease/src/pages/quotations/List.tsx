import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Quotation {
  id: string;
  created_at: string;
  quotation_number: string;
  customer_name?: string;
  total_amount: number;
  status: string;
  valid_until?: string;
  notes?: string;
}

export default function QuotationListPage() {
  const [query, setQuery] = useState('');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast({
        title: "Error",
        description: "Failed to load quotations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;

    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Quotation deleted successfully",
      });
      fetchQuotations();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast({
        title: "Error",
        description: "Failed to delete quotation",
        variant: "destructive",
      });
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return quotations.filter(quote =>
      quote.quotation_number.toLowerCase().includes(q) ||
      (quote.customer_name || '').toLowerCase().includes(q) ||
      quote.status.toLowerCase().includes(q)
    );
  }, [query, quotations]);

  return (
    <div className="space-y-8 p-1" style={{backgroundColor: '#fafbfc'}}>
      <div className="rounded-xl p-6 border-2" style={{backgroundColor: '#ffffff', borderColor: '#e2e8f0'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2" style={{color: '#1e293b'}}>Quotations</h1>
            <p className="text-lg" style={{color: '#64748b'}}>Manage your customer quotations</p>
          </div>
          <Button className="hover:shadow-lg transition-all duration-300">
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </div>
      </div>

      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground">Quotations</CardTitle>
          <CardDescription>All quotation entries</CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by quote number, customer, or status..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="pl-10" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote Date</TableHead>
                    <TableHead>Quote Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(quote => (
                    <TableRow key={quote.id}>
                      <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{quote.quotation_number}</TableCell>
                      <TableCell>{quote.customer_name || 'Walk-in Customer'}</TableCell>
                      <TableCell className="font-semibold">${quote.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                          quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {quote.status}
                        </span>
                      </TableCell>
                      <TableCell>{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(quote.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No quotations found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


