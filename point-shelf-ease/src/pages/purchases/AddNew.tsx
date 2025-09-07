import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Search, Scan, Plus, X, ShoppingCart } from 'lucide-react';

export default function AddNewPurchasePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    po_number: '',
    order_date: '',
    delivery_date: '',
    supplier_name: '',
    store_location: '',
    payment_status: '',
    notes: '',
    total: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannedItems, setScannedItems] = useState<Array<{id: string; name: string; barcode: string; quantity: number; price: number}>>([]);

  // Sample data for suppliers and stores
  const suppliers = [
    { id: '1', name: 'Acme Wholesalers Inc.' },
    { id: '2', name: 'Global Suppliers Ltd.' },
    { id: '3', name: 'Tech Components Inc.' },
    { id: '4', name: 'Office Supplies Co.' }
  ];

  const stores = [
    { id: '1', name: 'Main Store - Downtown' },
    { id: '2', name: 'Branch Store - Uptown' },
    { id: '3', name: 'Warehouse - Industrial' },
    { id: '4', name: 'Outlet Store - Mall' }
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // Implement search functionality
  };

  const handleBarcodeScann = () => {
    setShowBarcodeScanner(!showBarcodeScanner);
    // Implement barcode scanning functionality
    console.log('Barcode scanner toggled');
  };

  const handleAddScannedItem = () => {
    // Mock adding a scanned item
    const newItem = {
      id: Date.now().toString(),
      name: 'Sample Product',
      barcode: '123456789',
      quantity: 1,
      price: 10.00
    };
    setScannedItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleConvertFromRequest = () => {
    navigate('/purchase-requests?select=true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/purchases');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">New Purchase Order</h1>
            <p className="text-lg text-muted-foreground">Create a new purchase order</p>
          </div>
          <Button 
            onClick={handleConvertFromRequest} 
            variant="gradient"
            className="gap-2 hover:shadow-lg transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Convert from Purchase Request
          </Button>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-teal/5 to-vibrant-blue/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            Purchase Order Details
          </CardTitle>
          <CardDescription className="text-base text-white/90">Fill in the purchase order information</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Purchase Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po_number" className="text-foreground">PO Number</Label>
                <Input 
                  id="po_number" 
                  value={form.po_number} 
                  onChange={(e) => handleChange('po_number', e.target.value)} 
                  placeholder="Auto-generated or manual" 
                  className="border-vibrant-teal/30 focus:ring-vibrant-teal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_date" className="text-foreground">Order Date</Label>
                <Input 
                  id="order_date" 
                  type="date" 
                  value={form.order_date} 
                  onChange={(e) => handleChange('order_date', e.target.value)} 
                  className="border-vibrant-teal/30 focus:ring-vibrant-teal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date" className="text-foreground">Delivery Date</Label>
                <Input 
                  id="delivery_date" 
                  type="date" 
                  value={form.delivery_date} 
                  onChange={(e) => handleChange('delivery_date', e.target.value)} 
                  className="border-vibrant-teal/30 focus:ring-vibrant-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name" className="text-foreground">Supplier Name</Label>
                <Select value={form.supplier_name} onValueChange={(value) => handleChange('supplier_name', value)}>
                  <SelectTrigger className="border-vibrant-teal/30 focus:ring-vibrant-teal">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.name} className="hover:bg-vibrant-teal/10">
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_location" className="text-foreground">Store/Location</Label>
                <Select value={form.store_location} onValueChange={(value) => handleChange('store_location', value)}>
                  <SelectTrigger className="border-vibrant-teal/30 focus:ring-vibrant-teal">
                    <SelectValue placeholder="Select store location" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map(store => (
                      <SelectItem key={store.id} value={store.name} className="hover:bg-vibrant-teal/10">
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status" className="text-foreground">Payment Status</Label>
                <Select value={form.payment_status} onValueChange={(value) => handleChange('payment_status', value)}>
                  <SelectTrigger className="border-vibrant-teal/30 focus:ring-vibrant-teal">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value} className="hover:bg-vibrant-teal/10">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search and Barcode Section */}
            <div className="border-t border-vibrant-teal/20 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-vibrant-teal">Product Search & Barcode Scanning</h3>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search products by name, SKU, or description..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-vibrant-teal/30 focus:ring-vibrant-teal" 
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handleSearch} 
                  variant="outline"
                  className="border-vibrant-teal/30 text-vibrant-teal hover:bg-vibrant-teal/10"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button 
                  type="button" 
                  onClick={handleBarcodeScann} 
                  variant="outline"
                  className="border-vibrant-teal/30 text-vibrant-teal hover:bg-vibrant-teal/10"
                >
                  <Scan className="h-4 w-4 mr-2" />
                  {showBarcodeScanner ? 'Hide Scanner' : 'Scan Barcode'}
                </Button>
              </div>

              {showBarcodeScanner && (
                <div className="bg-vibrant-teal/10 p-4 rounded-lg mb-4 border border-vibrant-teal/20">
                  <div className="text-center">
                    <Scan className="h-12 w-12 mx-auto mb-2 text-vibrant-teal" />
                    <p className="text-vibrant-teal mb-2 font-medium">Barcode Scanner Active</p>
                    <p className="text-sm text-muted-foreground mb-4">Point your camera at a barcode to scan</p>
                    <Button 
                      onClick={handleAddScannedItem} 
                      size="sm"
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      Add Sample Item (Demo)
                    </Button>
                  </div>
                </div>
              )}

              {/* Scanned Items */}
              {scannedItems.length > 0 && (
                <div className="border border-vibrant-teal/20 rounded-lg p-4 bg-white">
                  <h4 className="font-semibold mb-3 text-vibrant-teal">Scanned Items</h4>
                  <div className="space-y-2">
                    {scannedItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-vibrant-teal/5 p-3 rounded border border-vibrant-teal/10">
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{item.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">({item.barcode})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">Qty: {item.quantity}</span>
                          <span className="text-sm font-medium text-vibrant-teal">${item.price.toFixed(2)}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 p-0 border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">Notes</Label>
              <Textarea 
                id="notes" 
                value={form.notes} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                placeholder="Additional notes or comments"
                className="border-vibrant-teal/30 focus:ring-vibrant-teal"
              />
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-vibrant-teal/20">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/purchases')}
                className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-gradient-primary hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Purchase Order'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}