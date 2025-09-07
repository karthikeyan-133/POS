import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Search, Scan, Plus, X } from 'lucide-react';

// Sample data for customers and stores
const customers = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Jane Doe' },
  { id: '3', name: 'ABC Corporation' },
  { id: '4', name: 'XYZ Industries' }
];

const stores = [
  { id: '1', name: 'Main Store - Downtown' },
  { id: '2', name: 'Branch Store - Uptown' },
  { id: '3', name: 'Warehouse - Industrial' },
  { id: '4', name: 'Outlet Store - Mall' }
];

export default function AddNewQuotationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    quotation_number: '',
    order_date: '',
    delivery_date: '',
    customer_name: '',
    store_location: '',
    valid_until: '',
    notes: '',
    total: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannedItems, setScannedItems] = useState<Array<{id: string; name: string; barcode: string; quantity: number; price: number}>>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/quotations');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Quotation</h1>
          <p className="text-muted-foreground">Create a new sales quotation</p>
        </div>
      </div>

      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground">Quotation Details</CardTitle>
          <CardDescription>Fill in the quotation information</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Quotation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quotation_number">Quotation Number</Label>
                <Input 
                  id="quotation_number" 
                  value={form.quotation_number} 
                  onChange={(e) => handleChange('quotation_number', e.target.value)} 
                  placeholder="Auto-generated or manual" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_date">Order Date</Label>
                <Input 
                  id="order_date" 
                  type="date" 
                  value={form.order_date} 
                  onChange={(e) => handleChange('order_date', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Delivery Date</Label>
                <Input 
                  id="delivery_date" 
                  type="date" 
                  value={form.delivery_date} 
                  onChange={(e) => handleChange('delivery_date', e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Select value={form.customer_name} onValueChange={(value) => handleChange('customer_name', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.name}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_location">Store/Location</Label>
                <Select value={form.store_location} onValueChange={(value) => handleChange('store_location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store location" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map(store => (
                      <SelectItem key={store.id} value={store.name}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input 
                  id="valid_until" 
                  type="date" 
                  value={form.valid_until} 
                  onChange={(e) => handleChange('valid_until', e.target.value)} 
                />
              </div>
            </div>

            {/* Search and Barcode Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Product Search & Barcode Scanning</h3>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search products by name, SKU, or description..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10" 
                  />
                </div>
                <Button type="button" onClick={handleSearch} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button type="button" onClick={handleBarcodeScann} variant="outline">
                  <Scan className="h-4 w-4 mr-2" />
                  {showBarcodeScanner ? 'Hide Scanner' : 'Scan Barcode'}
                </Button>
              </div>

              {showBarcodeScanner && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="text-center">
                    <Scan className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-600 mb-2">Barcode Scanner Active</p>
                    <p className="text-sm text-gray-500 mb-4">Point your camera at a barcode to scan</p>
                    <Button onClick={handleAddScannedItem} size="sm">
                      Add Sample Item (Demo)
                    </Button>
                  </div>
                </div>
              )}

              {/* Scanned Items */}
              {scannedItems.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Selected Items</h4>
                  <div className="space-y-2">
                    {scannedItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex-1">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({item.barcode})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 p-0 text-red-600"
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={form.notes} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                placeholder="Additional notes or comments"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/quotations')}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Quotation'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


