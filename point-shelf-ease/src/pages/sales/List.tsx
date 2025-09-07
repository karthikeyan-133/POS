import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Sale {
  id: string;
  created_at: string;
  sale_number: string;
  customer_name?: string;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  notes?: string;
}

export default function SaleListPage() {
  const [query, setQuery] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Error",
        description: "Failed to load sales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
      fetchSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return sales.filter(s =>
      s.sale_number.toLowerCase().includes(q) ||
      (s.customer_name || '').toLowerCase().includes(q) ||
      s.payment_status.toLowerCase().includes(q) ||
      s.payment_method.toLowerCase().includes(q)
    );
  }, [query, sales]);

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Sales</h1>
            <p className="text-lg text-muted-foreground">Manage your sales transactions</p>
          </div>
          <Button 
            onClick={() => navigate('/sales/add')} 
            className="hover:shadow-lg transition-all duration-300 bg-vibrant-blue hover:bg-vibrant-blue/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-blue/5 to-vibrant-purple/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="text-xl font-bold text-white">Sales</CardTitle>
          <CardDescription className="text-base text-white/90">All sales entries</CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
            <Input 
              placeholder="Search by order number, customer, or payment status..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus-visible:ring-white/50" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-purple"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-vibrant-blue/10 hover:bg-vibrant-blue/20">
                    <TableHead className="text-vibrant-blue font-semibold">Sale Date</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Sale Number</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Customer</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Total Amount</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Payment Status</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Payment Method</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(sale => (
                    <TableRow key={sale.id} className="hover:bg-vibrant-blue/5 transition-colors">
                      <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{sale.sale_number}</TableCell>
                      <TableCell>{sale.customer_name || 'Walk-in Customer'}</TableCell>
                      <TableCell className="font-semibold">${sale.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sale.payment_status === 'paid' ? 'bg-vibrant-green/10 text-vibrant-green' :
                          sale.payment_status === 'partial' ? 'bg-vibrant-yellow/10 text-vibrant-yellow' :
                          'bg-vibrant-red/10 text-vibrant-red'
                        }`}>
                          {sale.payment_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sale.payment_method === 'cash' ? 'bg-vibrant-green/10 text-vibrant-green' :
                          sale.payment_method === 'card' ? 'bg-vibrant-blue/10 text-vibrant-blue' :
                          'bg-vibrant-purple/10 text-vibrant-purple'
                        }`}>
                          {sale.payment_method}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-vibrant-blue hover:bg-vibrant-blue/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-vibrant-purple hover:bg-vibrant-purple/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(sale.id)}
                            className="text-vibrant-red hover:bg-vibrant-red/10"
                          >
                            <Trash2 className="h-4 w-4" />
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
              <p className="text-muted-foreground">No sales found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}