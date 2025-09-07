import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Search, Scan, Plus, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface StoreLocation {
  id: string;
  name: string;
  code: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  barcode: string;
  selling_price: number;
  purchase_price: number;
  stock_quantity: number;
  unit: string;
}

interface SelectedItem extends Product {
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  total: number;
}

// Sample data
const SAMPLE_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Acme Wholesalers Inc.', email: 'orders@acme.com', phone: '+1-555-0123' },
  { id: 's2', name: 'Global Suppliers Ltd.', email: 'sales@global.com', phone: '+1-555-0456' },
  { id: 's3', name: 'Tech Components Inc.', email: 'procurement@tech.com', phone: '+1-555-0789' },
];

const SAMPLE_STORES: StoreLocation[] = [
  { id: 'st1', name: 'Main Store', code: 'MS001', address: 'Downtown Location' },
  { id: 'st2', name: 'Branch Store', code: 'BS002', address: 'Uptown Location' },
  { id: 'st3', name: 'Warehouse', code: 'WH003', address: 'Industrial Area' },
];

const SAMPLE_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', barcode: '1234567890123', selling_price: 25.99, purchase_price: 15.00, stock_quantity: 50, unit: 'pcs' },
  { id: 'p2', name: 'USB Cable', barcode: '2345678901234', selling_price: 12.99, purchase_price: 8.00, stock_quantity: 100, unit: 'pcs' },
  { id: 'p3', name: 'Bluetooth Headphones', barcode: '3456789012345', selling_price: 89.99, purchase_price: 55.00, stock_quantity: 25, unit: 'pcs' },
  { id: 'p4', name: 'Phone Charger', barcode: '4567890123456', selling_price: 19.99, purchase_price: 12.00, stock_quantity: 75, unit: 'pcs' },
];

export default function AddNewPurchaseRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    po_number: 'PO-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6),
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    supplier_id: '',
    store_id: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => 
    setForm(prev => ({ ...prev, [field]: value }));

  const filteredProducts = SAMPLE_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  const handleBarcodeSearch = () => {
    const product = SAMPLE_PRODUCTS.find(p => p.barcode === barcodeInput);
    if (product) {
      addToSelectedItems(product);
      setBarcodeInput('');
      toast.success(`Added ${product.name} to items`);
    } else {
      toast.error('Product not found with this barcode');
    }
  };

  const addToSelectedItems = (product: Product) => {
    const existingItem = selectedItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setSelectedItems(prev => prev.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      const newItem: SelectedItem = {
        ...product,
        quantity: 1,
        unit_price: product.purchase_price,
        discount: 0,
        tax_rate: 10, // Default 10% tax
        total: product.purchase_price
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
  };

  const updateSelectedItem = (id: string, field: keyof SelectedItem, value: number) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total
        const subtotal = updatedItem.quantity * updatedItem.unit_price;
        const discountAmount = subtotal * (updatedItem.discount / 100);
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (updatedItem.tax_rate / 100);
        updatedItem.total = afterDiscount + taxAmount;
        return updatedItem;
      }
      return item;
    }));
  };

  const removeSelectedItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const totalDiscount = selectedItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      return sum + (itemSubtotal * (item.discount / 100));
    }, 0);
    const afterDiscount = subtotal - totalDiscount;
    const totalTax = selectedItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const discountAmount = itemSubtotal * (item.discount / 100);
      const afterItemDiscount = itemSubtotal - discountAmount;
      return sum + (afterItemDiscount * (item.tax_rate / 100));
    }, 0);
    const grandTotal = afterDiscount + totalTax;

    return { subtotal, totalDiscount, totalTax, grandTotal };
  };

  const { subtotal, totalDiscount, totalTax, grandTotal } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.supplier_id) {
      toast.error('Please select a supplier');
      return;
    }
    
    if (!form.store_id) {
      toast.error('Please select a store/location');
      return;
    }
    
    if (selectedItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Purchase request created successfully');
      navigate('/purchase-requests');
    } catch (error) {
      toast.error('Failed to create purchase request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Create Purchase Request</h1>
            <p className="text-lg text-muted-foreground">Generate a new purchase order request</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/purchase-requests')}
            className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
          >
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-green/5 to-vibrant-teal/5">
          <CardHeader className="bg-gradient-primary rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              Request Information
            </CardTitle>
            <CardDescription className="text-base text-white/90">Basic purchase order details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po_number" className="text-foreground">PO Purchase Request Number *</Label>
                <Input 
                  id="po_number" 
                  value={form.po_number} 
                  onChange={(e) => handleChange('po_number', e.target.value)} 
                  required 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_date" className="text-foreground">Order Date *</Label>
                <Input 
                  id="order_date" 
                  type="date" 
                  value={form.order_date} 
                  onChange={(e) => handleChange('order_date', e.target.value)} 
                  required 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date" className="text-foreground">Delivery Date *</Label>
                <Input 
                  id="delivery_date" 
                  type="date" 
                  value={form.delivery_date} 
                  onChange={(e) => handleChange('delivery_date', e.target.value)} 
                  required 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-foreground">Supplier Name *</Label>
                <Select value={form.supplier_id} onValueChange={(value) => handleChange('supplier_id', value)}>
                  <SelectTrigger className="border-vibrant-green/30 focus:ring-vibrant-green">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_SUPPLIERS.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id} className="hover:bg-vibrant-green/10">
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store" className="text-foreground">Store/Location *</Label>
                <Select value={form.store_id} onValueChange={(value) => handleChange('store_id', value)}>
                  <SelectTrigger className="border-vibrant-green/30 focus:ring-vibrant-green">
                    <SelectValue placeholder="Select store/location" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_STORES.map((store) => (
                      <SelectItem key={store.id} value={store.id} className="hover:bg-vibrant-green/10">
                        {store.name} ({store.code}) - {store.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Search & Selection */}
        <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-green/5 to-vibrant-teal/5">
          <CardHeader className="bg-gradient-primary rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <div className="p-2 bg-white/20 rounded-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              Product Selection
            </CardTitle>
            <CardDescription className="text-base text-white/90">Search products or scan barcode to add items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Search & Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-vibrant-green/30 focus:ring-vibrant-green"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Scan Barcode</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Scan className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Scan or enter barcode..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                      className="pl-10 border-vibrant-green/30 focus:ring-vibrant-green"
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleBarcodeSearch}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {searchQuery && (
              <div>
                <Label className="text-sm font-medium text-foreground">Available Products</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="cursor-pointer hover:shadow-md transition-all border border-vibrant-green/20 bg-white"
                      onClick={() => addToSelectedItems(product)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-center h-12 bg-vibrant-green/10 rounded-md mb-2">
                          <Package className="h-6 w-6 text-vibrant-green" />
                        </div>
                        <h4 className="font-medium text-sm truncate text-foreground">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">#{product.barcode}</p>
                        <p className="text-sm font-bold text-vibrant-green">${product.purchase_price.toFixed(2)}</p>
                        <Badge variant="secondary" className="text-xs bg-vibrant-green/10 text-vibrant-green border border-vibrant-green/20">
                          Stock: {product.stock_quantity}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-green/5 to-vibrant-teal/5">
            <CardHeader className="bg-gradient-primary rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                Selected Items
              </CardTitle>
              <CardDescription className="text-base text-white/90">Review and modify selected products</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-vibrant-green/10 hover:bg-vibrant-green/20">
                      <TableHead className="text-vibrant-green font-semibold">Product</TableHead>
                      <TableHead className="text-vibrant-green font-semibold">Barcode</TableHead>
                      <TableHead className="text-center text-vibrant-green font-semibold">Quantity</TableHead>
                      <TableHead className="text-right text-vibrant-green font-semibold">Unit Price</TableHead>
                      <TableHead className="text-right text-vibrant-green font-semibold">Discount %</TableHead>
                      <TableHead className="text-right text-vibrant-green font-semibold">Tax %</TableHead>
                      <TableHead className="text-right text-vibrant-green font-semibold">Total</TableHead>
                      <TableHead className="text-center text-vibrant-green font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-vibrant-green/5 transition-colors">
                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.barcode}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateSelectedItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 text-center border-vibrant-green/30 focus:ring-vibrant-green"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateSelectedItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-24 text-right border-vibrant-green/30 focus:ring-vibrant-green"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => updateSelectedItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-20 text-right border-vibrant-green/30 focus:ring-vibrant-green"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.tax_rate}
                            onChange={(e) => updateSelectedItem(item.id, 'tax_rate', parseFloat(e.target.value) || 0)}
                            className="w-20 text-right border-vibrant-green/30 focus:ring-vibrant-green"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          ${item.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeSelectedItem(item.id)}
                            className="h-8 w-8 p-0 border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Totals */}
              <div className="p-6 bg-vibrant-green/5 border-t border-vibrant-green/20">
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-vibrant-green">
                      <span>Total Discount:</span>
                      <span>-${totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-vibrant-blue">
                      <span>Total Tax:</span>
                      <span>+${totalTax.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-vibrant-green/20" />
                    <div className="flex justify-between font-bold text-lg text-foreground">
                      <span>Grand Total:</span>
                      <span className="text-vibrant-green">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/purchase-requests')}
            className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={submitting || selectedItems.length === 0}
            className="bg-gradient-primary hover:opacity-90"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Purchase Request'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}