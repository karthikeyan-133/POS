import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
  selling_price: number;
  categories?: { name: string };
}

interface InventoryTransaction {
  id: string;
  transaction_type: string;
  quantity_change: number;
  notes?: string;
  created_at: string;
  products?: { name: string };
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    product_id: '',
    transaction_type: 'adjustment',
    quantity_change: 0,
    notes: ''
  });
  const [managementForm, setManagementForm] = useState({
    product_id: '',
    store_location: '',
    stock_action: 'add',
    quantity_change: 0,
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products with stock info
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock_quantity,
          min_stock_level,
          selling_price,
          categories (name)
        `)
        .eq('is_active', true)
        .order('name');

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch inventory transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('inventory_transactions')
        .select(`
          id,
          transaction_type,
          quantity_change,
          notes,
          created_at,
          products (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create inventory transaction
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert([{
          product_id: adjustmentForm.product_id,
          transaction_type: adjustmentForm.transaction_type,
          quantity_change: adjustmentForm.quantity_change,
          notes: adjustmentForm.notes
        }]);

      if (transactionError) throw transactionError;

      // Get current stock and update
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', adjustmentForm.product_id)
        .single();

      if (currentProduct) {
        const newStock = currentProduct.stock_quantity + adjustmentForm.quantity_change;
        const { error: productError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', adjustmentForm.product_id);

        if (productError) throw productError;
      }

      toast({
        title: "Success",
        description: "Stock adjustment completed successfully",
      });

      setDialogOpen(false);
      setAdjustmentForm({
        product_id: '',
        transaction_type: 'adjustment',
        quantity_change: 0,
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
    }
  };

  const handleManagementInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quantityChange = managementForm.stock_action === 'add' ? managementForm.quantity_change : -managementForm.quantity_change;
      
      // Create inventory transaction
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert([{
          product_id: managementForm.product_id,
          transaction_type: 'adjustment',
          quantity_change: quantityChange,
          notes: `${managementForm.stock_action === 'add' ? 'Added' : 'Removed'} stock via Management - Store: ${managementForm.store_location}`
        }]);

      if (transactionError) throw transactionError;

      // Get current stock and update
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', managementForm.product_id)
        .single();

      if (currentProduct) {
        const newStock = currentProduct.stock_quantity + quantityChange;
        const { error: productError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', managementForm.product_id);

        if (productError) throw productError;
      }

      toast({
        title: "Success",
        description: "Inventory management completed successfully",
      });

      setManagementDialogOpen(false);
      setManagementForm({
        product_id: '',
        store_location: '',
        stock_action: 'add',
        quantity_change: 0,
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error managing inventory:', error);
      toast({
        title: "Error",
        description: "Failed to manage inventory",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (stock: number, minLevel: number) => {
    if (stock <= minLevel) return 'low';
    if (stock <= minLevel * 1.5) return 'warning';
    return 'good';
  };

  const getStockBadge = (status: string) => {
    const badgeStyles = {
      low: 'bg-vibrant-red/10 text-vibrant-red border border-vibrant-red/20',
      warning: 'bg-vibrant-yellow/10 text-vibrant-yellow border border-vibrant-yellow/20',
      good: 'bg-vibrant-green/10 text-vibrant-green border border-vibrant-green/20'
    };
    return badgeStyles[status as keyof typeof badgeStyles] || 'bg-muted text-muted-foreground border border-border';
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

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Inventory Management</h1>
            <p className="text-lg text-muted-foreground">Track and manage your product inventory</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="gradient" 
                  className="gap-2 hover:shadow-lg transition-all duration-300"
                  onClick={() => setAdjustmentForm({
                    product_id: '',
                    transaction_type: 'adjustment',
                    quantity_change: 0,
                    notes: ''
                  })}
                >
                  <TrendingUp className="h-4 w-4" /> Stock Adjustment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle className="text-vibrant-blue">Stock Adjustment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleStockAdjustment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product" className="text-foreground">Product *</Label>
                    <Select 
                      value={adjustmentForm.product_id} 
                      onValueChange={(value) => setAdjustmentForm({...adjustmentForm, product_id: value})}
                      required
                    >
                      <SelectTrigger id="product" className="border-vibrant-blue/30 focus:ring-vibrant-blue">
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
                  <div className="space-y-2">
                    <Label htmlFor="transaction_type" className="text-foreground">Transaction Type *</Label>
                    <Select 
                      value={adjustmentForm.transaction_type} 
                      onValueChange={(value) => setAdjustmentForm({...adjustmentForm, transaction_type: value})}
                      required
                    >
                      <SelectTrigger id="transaction_type" className="border-vibrant-blue/30 focus:ring-vibrant-blue">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                        <SelectItem value="damage">Damage</SelectItem>
                        <SelectItem value="theft">Theft</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity_change" className="text-foreground">Quantity Change *</Label>
                    <Input
                      id="quantity_change"
                      type="number"
                      value={adjustmentForm.quantity_change}
                      onChange={(e) => setAdjustmentForm({...adjustmentForm, quantity_change: parseInt(e.target.value) || 0})}
                      required
                      className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-foreground">Notes</Label>
                    <Input
                      id="notes"
                      value={adjustmentForm.notes}
                      onChange={(e) => setAdjustmentForm({...adjustmentForm, notes: e.target.value})}
                      placeholder="Enter notes..."
                      className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                    />
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
                      Adjust Stock
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={managementDialogOpen} onOpenChange={setManagementDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2 border-vibrant-purple/30 text-vibrant-purple hover:bg-vibrant-purple/10 hover:shadow-lg transition-all duration-300"
                  onClick={() => setManagementForm({
                    product_id: '',
                    store_location: '',
                    stock_action: 'add',
                    quantity_change: 0,
                    notes: ''
                  })}
                >
                  <Package className="h-4 w-4" /> Manage Inventory
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle className="text-vibrant-purple">Manage Inventory</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleManagementInventory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manage_product" className="text-foreground">Product *</Label>
                    <Select 
                      value={managementForm.product_id} 
                      onValueChange={(value) => setManagementForm({...managementForm, product_id: value})}
                      required
                    >
                      <SelectTrigger id="manage_product" className="border-vibrant-purple/30 focus:ring-vibrant-purple">
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
                  <div className="space-y-2">
                    <Label htmlFor="store_location" className="text-foreground">Store Location *</Label>
                    <Input
                      id="store_location"
                      value={managementForm.store_location}
                      onChange={(e) => setManagementForm({...managementForm, store_location: e.target.value})}
                      required
                      placeholder="Enter store location"
                      className="border-vibrant-purple/30 focus:ring-vibrant-purple"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_action" className="text-foreground">Action *</Label>
                    <Select 
                      value={managementForm.stock_action} 
                      onValueChange={(value) => setManagementForm({...managementForm, stock_action: value})}
                      required
                    >
                      <SelectTrigger id="stock_action" className="border-vibrant-purple/30 focus:ring-vibrant-purple">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Add Stock</SelectItem>
                        <SelectItem value="remove">Remove Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manage_quantity" className="text-foreground">Quantity *</Label>
                    <Input
                      id="manage_quantity"
                      type="number"
                      min="1"
                      value={managementForm.quantity_change}
                      onChange={(e) => setManagementForm({...managementForm, quantity_change: parseInt(e.target.value) || 0})}
                      required
                      className="border-vibrant-purple/30 focus:ring-vibrant-purple"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manage_notes" className="text-foreground">Notes</Label>
                    <Input
                      id="manage_notes"
                      value={managementForm.notes}
                      onChange={(e) => setManagementForm({...managementForm, notes: e.target.value})}
                      placeholder="Enter notes..."
                      className="border-vibrant-purple/30 focus:ring-vibrant-purple"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t border-vibrant-purple/20">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setManagementDialogOpen(false)}
                      className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      Manage Inventory
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-lg border border-border">
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-md transition-all duration-300"
          >
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger 
            value="transactions" 
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-md transition-all duration-300"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-blue/5 to-vibrant-purple/5">
            <CardHeader className="bg-gradient-primary rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                Product Inventory
              </CardTitle>
              <CardDescription className="text-base text-white/90">
                Current stock levels and product information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-vibrant-blue/10 hover:bg-vibrant-blue/20">
                    <TableHead className="text-vibrant-blue font-semibold">Product</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Category</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Current Stock</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Min Level</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Status</TableHead>
                    <TableHead className="text-vibrant-blue font-semibold">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const status = getStockStatus(product.stock_quantity, product.min_stock_level);
                    return (
                      <TableRow key={product.id} className="hover:bg-vibrant-blue/5 transition-colors">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.categories?.name || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{product.stock_quantity}</TableCell>
                        <TableCell>{product.min_stock_level}</TableCell>
                        <TableCell>
                          <Badge className={getStockBadge(status)}>
                            {status === 'low' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(product.selling_price)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-purple/5 to-vibrant-pink/5">
            <CardHeader className="bg-gradient-primary rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                Inventory Transactions
              </CardTitle>
              <CardDescription className="text-base text-white/90">
                Recent inventory movements and adjustments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-vibrant-purple/10 hover:bg-vibrant-purple/20">
                    <TableHead className="text-vibrant-purple font-semibold">Date</TableHead>
                    <TableHead className="text-vibrant-purple font-semibold">Product</TableHead>
                    <TableHead className="text-vibrant-purple font-semibold">Type</TableHead>
                    <TableHead className="text-vibrant-purple font-semibold">Quantity</TableHead>
                    <TableHead className="text-vibrant-purple font-semibold">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-vibrant-purple/5 transition-colors">
                      <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.products?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-vibrant-purple/10 text-vibrant-purple border border-vibrant-purple/20">
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.quantity_change > 0 ? (
                          <div className="flex items-center text-vibrant-green">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            +{transaction.quantity_change}
                          </div>
                        ) : (
                          <div className="flex items-center text-vibrant-red">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            {transaction.quantity_change}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{transaction.notes || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}