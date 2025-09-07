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
import { Plus, ArrowLeftRight, Truck, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Warehouse {
  id: string;
  name: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
}

interface Transfer {
  id: string;
  transfer_number: string;
  status: string;
  notes?: string;
  created_at: string;
  from_warehouse?: { name: string } | null;
  to_warehouse?: { name: string } | null;
  transfer_items?: {
    id: string;
    quantity: number;
    products?: { name: string };
  }[];
}

export default function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState<{ product_id: string; quantity: number }[]>([
    { product_id: '', quantity: 1 }
  ]);
  const [formData, setFormData] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch transfers
      const { data: transfersData, error: transfersError } = await supabase
        .from('transfers')
        .select(`
          *,
          from_warehouse:warehouses!from_warehouse_id (name),
          to_warehouse:warehouses!to_warehouse_id (name),
          transfer_items (
            id,
            quantity,
            products (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (transfersError) throw transfersError;
      setTransfers(transfersData || []);

      // Fetch warehouses
      const { data: warehousesData, error: warehousesError } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (warehousesError) throw warehousesError;
      setWarehouses(warehousesData || []);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Generate transfer number
      const { data: transferNumber } = await supabase.rpc('generate_transfer_number');

      // Create transfer
      const { data: transfer, error: transferError } = await supabase
        .from('transfers')
        .insert([{
          transfer_number: transferNumber,
          from_warehouse_id: formData.from_warehouse_id,
          to_warehouse_id: formData.to_warehouse_id,
          notes: formData.notes,
          status: 'pending'
        }])
        .select()
        .single();

      if (transferError) throw transferError;

      // Create transfer items
      const transferItems = items
        .filter(item => item.product_id && item.quantity > 0)
        .map(item => ({
          transfer_id: transfer.id,
          product_id: item.product_id,
          quantity: item.quantity
        }));

      const { error: itemsError } = await supabase
        .from('transfer_items')
        .insert(transferItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Transfer created successfully",
      });

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast({
        title: "Error",
        description: "Failed to create transfer",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (transferId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('transfers')
        .update({ status: newStatus })
        .eq('id', transferId);

      if (error) throw error;

      // If completing the transfer, update inventory
      if (newStatus === 'completed') {
        // Note: In a real application, you would need to handle multi-warehouse inventory
        // For now, we'll just create inventory transactions
        const transfer = transfers.find(t => t.id === transferId);
        if (transfer?.transfer_items) {
          for (const item of transfer.transfer_items) {
            await supabase
              .from('inventory_transactions')
              .insert({
                product_id: item.products ? 
                  (products.find(p => p.name === item.products.name)?.id || '') : '',
                transaction_type: 'transfer',
                quantity_change: 0, // No net change in total inventory
                reference_id: transferId,
                notes: `Transfer: ${transfer.transfer_number}`
              });
          }
        }
      }

      toast({
        title: "Success",
        description: `Transfer ${newStatus} successfully`,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating transfer status:', error);
      toast({
        title: "Error",
        description: "Failed to update transfer status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setItems([{ product_id: '', quantity: 1 }]);
    setFormData({
      from_warehouse_id: '',
      to_warehouse_id: '',
      notes: ''
    });
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
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
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-vibrant-yellow/10 text-vibrant-yellow border border-vibrant-yellow/20',
      in_transit: 'bg-vibrant-blue/10 text-vibrant-blue border border-vibrant-blue/20',
      completed: 'bg-vibrant-green/10 text-vibrant-green border border-vibrant-green/20',
      cancelled: 'bg-vibrant-red/10 text-vibrant-red border border-vibrant-red/20'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-muted text-muted-foreground border border-border';
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
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Stock Transfers</h1>
            <p className="text-lg text-muted-foreground">Manage inventory transfers between warehouses</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="gradient" 
                className="gap-2 hover:shadow-lg transition-all duration-300"
                onClick={resetForm}
              >
                <Plus className="h-4 w-4" /> Create Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-vibrant-purple">Create New Transfer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="from_warehouse" className="text-foreground">From Warehouse *</Label>
                    <Select 
                      value={formData.from_warehouse_id} 
                      onValueChange={(value) => setFormData({...formData, from_warehouse_id: value})}
                      required
                    >
                      <SelectTrigger id="from_warehouse" className="border-vibrant-purple/30 focus:ring-vibrant-purple">
                        <SelectValue placeholder="Select source warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(warehouse => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to_warehouse" className="text-foreground">To Warehouse *</Label>
                    <Select 
                      value={formData.to_warehouse_id} 
                      onValueChange={(value) => setFormData({...formData, to_warehouse_id: value})}
                      required
                    >
                      <SelectTrigger id="to_warehouse" className="border-vibrant-purple/30 focus:ring-vibrant-purple">
                        <SelectValue placeholder="Select destination warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(warehouse => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-vibrant-purple">Items</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addItem}
                      className="border-vibrant-purple/30 text-vibrant-purple hover:bg-vibrant-purple/10"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-8 space-y-2">
                          <Label className="text-foreground">Product *</Label>
                          <Select 
                            value={item.product_id} 
                            onValueChange={(value) => updateItem(index, 'product_id', value)}
                            required
                          >
                            <SelectTrigger className="border-vibrant-purple/30 focus:ring-vibrant-purple">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} (Stock: {product.stock_quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label className="text-foreground">Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="border-vibrant-purple/30 focus:ring-vibrant-purple"
                            required
                          />
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
                  <Label htmlFor="notes" className="text-foreground">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes about this transfer..."
                    className="min-h-[100px] border-vibrant-purple/30 focus:ring-vibrant-purple"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-vibrant-purple/20">
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
                    Create Transfer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-purple/5 to-vibrant-pink/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <ArrowLeftRight className="h-6 w-6 text-white" />
            </div>
            Transfer List
          </CardTitle>
          <CardDescription className="text-base text-white/90">
            All inventory transfers between warehouses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-vibrant-purple/10 hover:bg-vibrant-purple/20">
                <TableHead className="text-vibrant-purple font-semibold">Transfer #</TableHead>
                <TableHead className="text-vibrant-purple font-semibold">From</TableHead>
                <TableHead className="text-vibrant-purple font-semibold">To</TableHead>
                <TableHead className="text-vibrant-purple font-semibold">Date</TableHead>
                <TableHead className="text-vibrant-purple font-semibold">Items</TableHead>
                <TableHead className="text-vibrant-purple font-semibold">Status</TableHead>
                <TableHead className="text-vibrant-purple font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id} className="hover:bg-vibrant-purple/5 transition-colors">
                  <TableCell className="font-medium">{transfer.transfer_number}</TableCell>
                  <TableCell>{transfer.from_warehouse?.name || 'N/A'}</TableCell>
                  <TableCell>{transfer.to_warehouse?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(transfer.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{transfer.transfer_items?.length || 0} items</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(transfer.status)}>
                      {transfer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transfer.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(transfer.id, 'in_transit')}
                        className="text-vibrant-blue hover:bg-vibrant-blue/10"
                      >
                        <Truck className="h-4 w-4" />
                      </Button>
                    )}
                    {transfer.status === 'in_transit' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(transfer.id, 'completed')}
                        className="text-vibrant-green hover:bg-vibrant-green/10"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
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