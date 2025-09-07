import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt, Search, Eye, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Sale {
  id: string;
  sale_number: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  cashier_id?: string;
  sale_items?: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
    };
  }[];
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (name)
          )
        `)
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

  const filteredSales = sales.filter(sale =>
    sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer_phone?.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-vibrant-green/10 text-vibrant-green border border-vibrant-green/20',
      pending: 'bg-vibrant-blue/10 text-vibrant-blue border border-vibrant-blue/20',
      cancelled: 'bg-vibrant-red/10 text-vibrant-red border border-vibrant-red/20'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-muted text-muted-foreground border border-border';
  };

  const showSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">Sales History</h1>
            <p className="text-lg text-muted-foreground">View and manage all sales transactions</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-blue/10 to-vibrant-purple/10 hover:from-vibrant-blue/20 hover:to-vibrant-purple/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Total Sales</CardTitle>
            <div className="p-2 bg-vibrant-blue/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-vibrant-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatCurrency(sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0))}
            </div>
            <p className="text-sm text-muted-foreground">
              {sales.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-green/10 to-vibrant-teal/10 hover:from-vibrant-green/20 hover:to-vibrant-teal/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Today's Sales</CardTitle>
            <div className="p-2 bg-vibrant-green/10 rounded-lg">
              <Calendar className="h-5 w-5 text-vibrant-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatCurrency(
                sales
                  .filter(sale => new Date(sale.created_at).toDateString() === new Date().toDateString())
                  .reduce((sum, sale) => sum + Number(sale.total_amount), 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {sales.filter(sale => new Date(sale.created_at).toDateString() === new Date().toDateString()).length} today
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-purple/10 to-vibrant-pink/10 hover:from-vibrant-purple/20 hover:to-vibrant-pink/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Average Sale</CardTitle>
            <div className="p-2 bg-vibrant-purple/10 rounded-lg">
              <Receipt className="h-5 w-5 text-vibrant-purple" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatCurrency(
                sales.length > 0 
                  ? sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0) / sales.length
                  : 0
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-blue/5 to-vibrant-purple/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            Sales Transactions
          </CardTitle>
          <CardDescription className="text-base text-white/90">
            All sales transactions and their details
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
            <Input
              placeholder="Search by sale number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus-visible:ring-white/50"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-vibrant-blue/10 hover:bg-vibrant-blue/20">
                <TableHead className="text-vibrant-blue font-semibold">Sale #</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Customer</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Date</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Amount</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Status</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-vibrant-blue/5 transition-colors">
                  <TableCell className="font-medium">{sale.sale_number}</TableCell>
                  <TableCell>
                    <div>{sale.customer_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{sale.customer_phone || ''}</div>
                  </TableCell>
                  <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(sale.total_amount))}</TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusBadge(sale.payment_status)}>
                      {sale.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showSaleDetails(sale)}
                      className="text-vibrant-blue hover:bg-vibrant-blue/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-vibrant-blue">Sale Details</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sale Number</p>
                  <p className="font-medium">{selectedSale.sale_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedSale.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedSale.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedSale.customer_phone || 'N/A'}</p>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-vibrant-blue/10">
                      <TableHead className="text-vibrant-blue">Product</TableHead>
                      <TableHead className="text-vibrant-blue">Quantity</TableHead>
                      <TableHead className="text-vibrant-blue">Price</TableHead>
                      <TableHead className="text-vibrant-blue">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.sale_items?.map((item) => (
                      <TableRow key={item.id} className="hover:bg-vibrant-blue/5">
                        <TableCell>{item.products?.name || 'Unknown Product'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(Number(item.unit_price))}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(Number(item.total_price))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(selectedSale.total_amount) - Number(selectedSale.tax_amount) + Number(selectedSale.discount_amount))}</span>
                </div>
                {selectedSale.discount_amount > 0 && (
                  <div className="flex justify-between text-vibrant-red">
                    <span>Discount</span>
                    <span>-{formatCurrency(Number(selectedSale.discount_amount))}</span>
                  </div>
                )}
                {selectedSale.tax_amount > 0 && (
                  <div className="flex justify-between text-vibrant-green">
                    <span>Tax</span>
                    <span>+{formatCurrency(Number(selectedSale.tax_amount))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(Number(selectedSale.total_amount))}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}