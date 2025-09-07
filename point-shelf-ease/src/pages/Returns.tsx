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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Return {
  id: string;
  return_number: string;
  type: string;
  total_amount: number;
  reason?: string;
  status: string;
  created_at: string;
  customers?: { name: string };
  suppliers?: { name: string };
  return_items?: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: { name: string };
  }[];
}

interface Sale {
  id: string;
  sale_number: string;
  customer_name?: string;
  total_amount: number;
}

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id?: string;
  total_amount: number;
}

interface Customer {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  selling_price: number;
  purchase_price: number;
}

export default function Returns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [returnType, setReturnType] = useState<'sale_return' | 'purchase_return'>('sale_return');
  const [items, setItems] = useState<{ product_id: string; quantity: number; unit_price: number }[]>([
    { product_id: '', quantity: 1, unit_price: 0 }
  ]);
  const [formData, setFormData] = useState({
    reference_id: '',
    customer_id: '',
    supplier_id: '',
    reason: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: returnsData, error: returnsError } = await supabase
        .from('returns')
        .select(`
          *,
          customers (name),
          suppliers (name),
          return_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (returnsError) throw returnsError;
      setReturns(returnsData || []);

      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, sale_number, customer_name, total_amount')
        .order('created_at', { ascending: false })
        .limit(50);

      if (salesError) throw salesError;
      setSales(salesData || []);

      const { data: purchaseOrdersData, error: poError } = await supabase
        .from('purchase_orders')
        .select('id, order_number, supplier_id, total_amount')
        .order('created_at', { ascending: false })
        .limit(50);

      if (poError) throw poError;
      setPurchaseOrders(purchaseOrdersData || []);

      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (customersError) throw customersError;
      setCustomers(customersData || []);

      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (suppliersError) throw suppliersError;
      setSuppliers(suppliersData || []);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, selling_price, purchase_price')
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

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      if (item.product_id && item.quantity > 0) {
        return sum + (item.quantity * item.unit_price);
      }
      return sum;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const total = calculateTotal();
      const { data: returnNumber } = await supabase.rpc('generate_return_number');

      const { data: returnRecord, error: returnError } = await supabase
        .from('returns')
        .insert([{
          return_number: returnNumber,
          type: returnType,
          reference_id: formData.reference_id || null,
          customer_id: returnType === 'sale_return' ? formData.customer_id || null : null,
          supplier_id: returnType === 'purchase_return' ? formData.supplier_id || null : null,
          total_amount: total,
          reason: formData.reason,
          status: 'pending'
        }])
        .select()
        .single();

      if (returnError) throw returnError;

      const returnItems = items
        .filter(item => item.product_id && item.quantity > 0)
        .map(item => ({
          return_id: returnRecord.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }));

      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Return created successfully",
      });

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating return:', error);
      toast({
        title: "Error",
        description: "Failed to create return",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
    setFormData({
      reference_id: '',
      customer_id: '',
      supplier_id: '',
      reason: ''
    });
    setReturnType('sale_return');
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
        newItems[index].unit_price = returnType === 'sale_return' 
          ? product.selling_price 
          : product.purchase_price;
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-vibrant-yellow/10 text-vibrant-yellow border border-vibrant-yellow/20',
      approved: 'bg-vibrant-blue/10 text-vibrant-blue border border-vibrant-blue/20',
      processed: 'bg-vibrant-green/10 text-vibrant-green border border-vibrant-green/20',
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

  const total = calculateTotal();

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Returns Management</h1>
            <p className="text-lg text-muted-foreground">Manage product returns and refunds</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="gradient" 
                className="gap-2 hover:shadow-lg transition-all duration-300"
                onClick={resetForm}
              >
                <Plus className="h-4 w-4" /> Create Return
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-vibrant-red">Create New Return</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-foreground">Return Type</Label>
                  <Tabs value={returnType} onValueChange={(value) => setReturnType(value as 'sale_return' | 'purchase_return')}>
                    <TabsList className="grid w-full grid-cols-2 bg-white border border-vibrant-red/30">
                      <TabsTrigger 
                        value="sale_return" 
                        className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-md"
                      >
                        Sale Return
                      </TabsTrigger>
                      <TabsTrigger 
                        value="purchase_return" 
                        className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-md"
                      >
                        Purchase Return
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {returnType === 'sale_return' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sale_reference" className="text-foreground">Sale Reference</Label>
                        <Select 
                          value={formData.reference_id} 
                          onValueChange={(value) => setFormData({...formData, reference_id: value})}
                        >
                          <SelectTrigger id="sale_reference" className="border-vibrant-red/30 focus:ring-vibrant-red">
                            <SelectValue placeholder="Select sale" />
                          </SelectTrigger>
                          <SelectContent>
                            {sales.map(sale => (
                              <SelectItem key={sale.id} value={sale.id}>
                                {sale.sale_number} - {sale.customer_name || 'N/A'} ({formatCurrency(sale.total_amount)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer" className="text-foreground">Customer</Label>
                        <Select 
                          value={formData.customer_id} 
                          onValueChange={(value) => setFormData({...formData, customer_id: value})}
                        >
                          <SelectTrigger id="customer" className="border-vibrant-red/30 focus:ring-vibrant-red">
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
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="purchase_reference" className="text-foreground">Purchase Reference</Label>
                        <Select 
                          value={formData.reference_id} 
                          onValueChange={(value) => setFormData({...formData, reference_id: value})}
                        >
                          <SelectTrigger id="purchase_reference" className="border-vibrant-red/30 focus:ring-vibrant-red">
                            <SelectValue placeholder="Select purchase order" />
                          </SelectTrigger>
                          <SelectContent>
                            {purchaseOrders.map(order => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.order_number} - {suppliers.find(s => s.id === order.supplier_id)?.name || 'N/A'} ({formatCurrency(order.total_amount)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplier" className="text-foreground">Supplier</Label>
                        <Select 
                          value={formData.supplier_id} 
                          onValueChange={(value) => setFormData({...formData, supplier_id: value})}
                        >
                          <SelectTrigger id="supplier" className="border-vibrant-red/30 focus:ring-vibrant-red">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map(supplier => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-vibrant-red">Items</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addItem}
                      className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
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
                            <SelectTrigger className="border-vibrant-red/30 focus:ring-vibrant-red">
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
                            className="border-vibrant-red/30 focus:ring-vibrant-red"
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
                            className="border-vibrant-red/30 focus:ring-vibrant-red"
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

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-foreground">Reason for Return</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Enter reason for return..."
                    className="min-h-[100px] border-vibrant-red/30 focus:ring-vibrant-red"
                  />
                </div>

                <div className="space-y-2 p-4 bg-vibrant-red/5 rounded-lg">
                  <div className="flex justify-between pt-2 border-t border-vibrant-red/20">
                    <span className="font-semibold">Total Refund:</span>
                    <span className="font-bold text-lg text-vibrant-red">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-vibrant-red/20">
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
                    Create Return
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-red/5 to-vibrant-orange/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <RefreshCw className="h-6 w-6 text-white" />
            </div>
            Return List
          </CardTitle>
          <CardDescription className="text-base text-white/90">
            All product returns and their status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-vibrant-red/10 hover:bg-vibrant-red/20">
                <TableHead className="text-vibrant-red font-semibold">Return #</TableHead>
                <TableHead className="text-vibrant-red font-semibold">Type</TableHead>
                <TableHead className="text-vibrant-red font-semibold">Reference</TableHead>
                <TableHead className="text-vibrant-red font-semibold">Party</TableHead>
                <TableHead className="text-vibrant-red font-semibold">Date</TableHead>
                <TableHead className="text-vibrant-red font-semibold">Amount</TableHead>
                <TableHead className="text-vibrant-red font-semibold">Status</TableHead>
                <TableHead className="text-vibrant-red font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((returnItem) => (
                <TableRow key={returnItem.id} className="hover:bg-vibrant-red/5 transition-colors">
                  <TableCell className="font-medium">{returnItem.return_number}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-vibrant-red/10 text-vibrant-red border border-vibrant-red/20">
                      {returnItem.type === 'sale_return' ? 'Sale Return' : 'Purchase Return'}
                    </Badge>
                  </TableCell>
                  <TableCell>{returnItem.reference_id || 'N/A'}</TableCell>
                  <TableCell>
                    {returnItem.type === 'sale_return' 
                      ? returnItem.customers?.name || 'N/A' 
                      : returnItem.suppliers?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{new Date(returnItem.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(returnItem.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(returnItem.status)}>
                      {returnItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-vibrant-red hover:bg-vibrant-red/10"
                    >
                      View
                    </Button>
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