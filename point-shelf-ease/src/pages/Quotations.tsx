import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Send, Copy, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
  selling_price: number;
}

interface QuotationItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: { name: string };
}

interface Quotation {
  id: string;
  quotation_number: string;
  customer_id?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  valid_until?: string;
  notes?: string;
  created_at: string;
  customers?: { name: string };
  quotation_items?: QuotationItem[];
}

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState<{ product_id: string; quantity: number; unit_price: number }[]>([
    { product_id: '', quantity: 1, unit_price: 0 }
  ]);
  const [formData, setFormData] = useState({
    customer_id: '',
    notes: '',
    valid_until: '',
    discount_amount: 0,
    tax_rate: 10
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch quotations
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select(`
          *,
          customers (name),
          quotation_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            products (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (quotationsError) throw quotationsError;
      setQuotations(quotationsData || []);

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (customersError) throw customersError;
      setCustomers(customersData || []);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, selling_price')
        .eq('is_active', true)
        .order('name');

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      if (item.product_id && item.quantity > 0) {
        return sum + (item.quantity * item.unit_price);
      }
      return sum;
    }, 0);

    const taxAmount = (subtotal * formData.tax_rate) / 100;
    const total = subtotal + taxAmount - formData.discount_amount;

    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { subtotal, taxAmount, total } = calculateTotals();

      // Generate quotation number
      const { data: quotationNumber } = await supabase.rpc('generate_quotation_number');

      // Create quotation
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert([{
          quotation_number: quotationNumber,
          customer_id: formData.customer_id || null,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: formData.discount_amount,
          total_amount: total,
          valid_until: formData.valid_until || null,
          notes: formData.notes
        }])
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Create quotation items
      const quotationItems = items
        .filter(item => item.product_id && item.quantity > 0)
        .map(item => ({
          quotation_id: quotation.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(quotationItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Quotation created successfully",
      });

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        title: "Error",
        description: "Failed to create quotation",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
    setFormData({
      customer_id: '',
      notes: '',
      valid_until: '',
      discount_amount: 0,
      tax_rate: 10
    });
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'product_id') {
      newItems[index].product_id = value as string;
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unit_price = product.selling_price;
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-vibrant-yellow/10 text-vibrant-yellow border border-vibrant-yellow/20',
      sent: 'bg-vibrant-blue/10 text-vibrant-blue border border-vibrant-blue/20',
      accepted: 'bg-vibrant-green/10 text-vibrant-green border border-vibrant-green/20',
      rejected: 'bg-vibrant-red/10 text-vibrant-red border border-vibrant-red/20'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-muted text-muted-foreground border border-border';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Quotations</h1>
            <p className="text-lg text-muted-foreground">Manage customer quotations and proposals</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="gradient" 
                className="gap-2 hover:shadow-lg transition-all duration-300"
                onClick={resetForm}
              >
                <Plus className="h-4 w-4" /> Create Quotation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-vibrant-blue">Create New Quotation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="text-foreground">Customer</Label>
                    <Select 
                      value={formData.customer_id} 
                      onValueChange={(value) => setFormData({...formData, customer_id: value})}
                    >
                      <SelectTrigger id="customer" className="border-vibrant-blue/30 focus:ring-vibrant-blue">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valid_until" className="text-foreground">Valid Until</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                      className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-vibrant-blue">Items</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addItem}
                      className="border-vibrant-blue/30 text-vibrant-blue hover:bg-vibrant-blue/10"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5 space-y-2">
                          <Label className="text-foreground">Product</Label>
                          <Select 
                            value={item.product_id} 
                            onValueChange={(value) => updateItem(index, 'product_id', value)}
                          >
                            <SelectTrigger className="border-vibrant-blue/30 focus:ring-vibrant-blue">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-foreground">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                          />
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label className="text-foreground">Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                          />
                        </div>
                        <div className="col-span-1 space-y-2">
                          <Label className="text-foreground">Total</Label>
                          <div className="font-medium">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </div>
                        </div>
                        <div className="col-span-1">
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-vibrant-red hover:bg-vibrant-red/10"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-foreground">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes or terms..."
                      className="min-h-[100px] border-vibrant-blue/30 focus:ring-vibrant-blue"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discount" className="text-foreground">Discount</Label>
                        <Input
                          id="discount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.discount_amount}
                          onChange={(e) => setFormData({...formData, discount_amount: parseFloat(e.target.value) || 0})}
                          className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax" className="text-foreground">Tax Rate (%)</Label>
                        <Input
                          id="tax"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.tax_rate}
                          onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
                          className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 p-4 bg-vibrant-blue/5 rounded-lg">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({formData.tax_rate}%):</span>
                        <span className="font-medium">{formatCurrency(taxAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span className="font-medium text-vibrant-red">-{formatCurrency(formData.discount_amount)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-vibrant-blue/20">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg text-vibrant-blue">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-vibrant-blue/20">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Create Quotation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-blue/5 to-vibrant-purple/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            Quotation List
          </CardTitle>
          <CardDescription className="text-base text-white/90">
            All customer quotations and their status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-vibrant-blue/10 hover:bg-vibrant-blue/20">
                <TableHead className="text-vibrant-blue font-semibold">Quotation #</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Customer</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Date</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Valid Until</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Amount</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Status</TableHead>
                <TableHead className="text-vibrant-blue font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation) => (
                <TableRow key={quotation.id} className="hover:bg-vibrant-blue/5 transition-colors">
                  <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                  <TableCell>{quotation.customers?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(quotation.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(quotation.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(quotation.status)}>
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-vibrant-blue hover:bg-vibrant-blue/10"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-vibrant-green hover:bg-vibrant-green/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-vibrant-purple hover:bg-vibrant-purple/10"
                      >
                        <Download className="h-4 w-4" />
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