import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Search, Scan, Plus, X } from 'lucide-react';

// Sample product data
const SAMPLE_PRODUCTS = [
  { id: 'p1', name: 'iPhone 15 Pro', unit: 'pcs', currentStock: 50 },
  { id: 'p2', name: 'Samsung Galaxy S24', unit: 'pcs', currentStock: 30 },
  { id: 'p3', name: 'MacBook Air M2', unit: 'pcs', currentStock: 15 },
  { id: 'p4', name: 'iPad Pro 12.9', unit: 'pcs', currentStock: 25 },
  { id: 'p5', name: 'Apple Watch Series 9', unit: 'pcs', currentStock: 40 },
  { id: 'p6', name: 'AirPods Pro', unit: 'pcs', currentStock: 60 },
];

export default function AddNewStockTransferPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    referenceNumber: '',
    transferDate: '',
    status: '',
    fromLocation: '',
    toLocation: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Array<{id: string; name: string; unit: string; currentStock: number; transferQuantity: number}>>([]);

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // Implement search functionality
  };

  const handleBarcodeScann = () => {
    setShowBarcodeScanner(!showBarcodeScanner);
    console.log('Barcode scanner toggled');
  };

  const handleAddProduct = (product: typeof SAMPLE_PRODUCTS[0]) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (!existingProduct) {
      setSelectedProducts(prev => [...prev, {
        ...product,
        transferQuantity: 1
      }]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleUpdateTransferQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, transferQuantity: quantity } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/stock-transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const locations = [
    'Main Store - Downtown',
    'Branch Store - Uptown', 
    'Warehouse - Industrial',
    'Outlet Store - Mall',
    'Storage Room A',
    'Storage Room B'
  ];

  const statuses = [
    'Pending',
    'In Transit',
    'Completed',
    'Cancelled'
  ];

  // Filter products based on search query
  const filteredProducts = SAMPLE_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Stock Transfer</h1>
          <p className="text-muted-foreground">Create a new inventory transfer between locations</p>
        </div>
      </div>

      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground">Product Search & Selection</CardTitle>
          <CardDescription>Search for products or scan barcodes to add to transfer</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Barcode Section */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products by name..." 
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
              </div>
            </div>
          )}

          {/* Available Products Table */}
          {searchQuery && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Available Products</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.currentStock}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddProduct(product)}
                          disabled={selectedProducts.find(p => p.id === product.id) !== undefined}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Selected Products Table */}
          {selectedProducts.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Selected Products for Transfer</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Transfer Quantity</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.currentStock}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min="1" 
                          max={product.currentStock}
                          value={product.transferQuantity}
                          onChange={(e) => handleUpdateTransferQuantity(product.id, parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Details Form */}
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground">Transfer Details</CardTitle>
          <CardDescription>Provide transfer information and details</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input 
                  id="referenceNumber" 
                  value={form.referenceNumber} 
                  onChange={(e) => handleChange('referenceNumber', e.target.value)} 
                  placeholder="ST-2025-XXX" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferDate">Transfer Date</Label>
                <Input 
                  id="transferDate" 
                  type="date"
                  value={form.transferDate} 
                  onChange={(e) => handleChange('transferDate', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromLocation">From Location</Label>
                <Select value={form.fromLocation} onValueChange={(value) => handleChange('fromLocation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toLocation">To Location</Label>
                <Select value={form.toLocation} onValueChange={(value) => handleChange('toLocation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={form.notes} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                placeholder="Additional notes about this transfer..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/stock-transfer')}>Cancel</Button>
              <Button type="submit" disabled={submitting || selectedProducts.length === 0}>
                {submitting ? 'Saving...' : 'Save Transfer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
