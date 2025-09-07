import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Search, Scan, Plus, X, AlertTriangle } from 'lucide-react';

// Sample product data
const SAMPLE_PRODUCTS = [
  { id: 'p1', name: 'iPhone 15 Pro', unit: 'pcs', currentStock: 50 },
  { id: 'p2', name: 'Samsung Galaxy S24', unit: 'pcs', currentStock: 30 },
  { id: 'p3', name: 'MacBook Air M2', unit: 'pcs', currentStock: 15 },
  { id: 'p4', name: 'iPad Pro 12.9', unit: 'pcs', currentStock: 25 },
  { id: 'p5', name: 'Apple Watch Series 9', unit: 'pcs', currentStock: 40 },
  { id: 'p6', name: 'AirPods Pro', unit: 'pcs', currentStock: 60 },
];

export default function AddNewDamageStockPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    damageDate: '',
    storeLocation: '',
    reportedBy: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Array<{id: string; name: string; unit: string; currentStock: number; damagedQuantity: number}>>([]);

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
        damagedQuantity: 1
      }]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleUpdateDamagedQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, damagedQuantity: quantity } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/damage-stock');
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

  // Filter products based on search query
  const filteredProducts = SAMPLE_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">New Damage Stock Entry</h1>
            <p className="text-lg text-muted-foreground">Record damaged inventory items</p>
          </div>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-red/5 to-vibrant-orange/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Search className="h-6 w-6 text-white" />
            </div>
            Product Search & Selection
          </CardTitle>
          <CardDescription className="text-base text-white/90">Search for products or scan barcodes to add to damage report</CardDescription>
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
                className="pl-10 border-vibrant-red/30 focus:ring-vibrant-red" 
              />
            </div>
            <Button 
              type="button" 
              onClick={handleSearch} 
              variant="outline"
              className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              type="button" 
              onClick={handleBarcodeScann} 
              variant="outline"
              className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
            >
              <Scan className="h-4 w-4 mr-2" />
              {showBarcodeScanner ? 'Hide Scanner' : 'Scan Barcode'}
            </Button>
          </div>

          {showBarcodeScanner && (
            <div className="bg-vibrant-red/10 p-4 rounded-lg mb-4 border border-vibrant-red/20">
              <div className="text-center">
                <Scan className="h-12 w-12 mx-auto mb-2 text-vibrant-red" />
                <p className="text-vibrant-red mb-2 font-medium">Barcode Scanner Active</p>
                <p className="text-sm text-muted-foreground mb-4">Point your camera at a barcode to scan</p>
              </div>
            </div>
          )}

          {/* Available Products Table */}
          {searchQuery && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-vibrant-red">Available Products</h4>
              <Table>
                <TableHeader>
                  <TableRow className="bg-vibrant-red/10 hover:bg-vibrant-red/20">
                    <TableHead className="text-vibrant-red font-semibold">Product</TableHead>
                    <TableHead className="text-vibrant-red font-semibold">Unit</TableHead>
                    <TableHead className="text-vibrant-red font-semibold">Current Stock</TableHead>
                    <TableHead className="text-vibrant-red font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id} className="hover:bg-vibrant-red/5 transition-colors">
                      <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                      <TableCell className="text-foreground">{product.unit}</TableCell>
                      <TableCell className="text-foreground">{product.currentStock}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddProduct(product)}
                          disabled={selectedProducts.find(p => p.id === product.id) !== undefined}
                          className="bg-gradient-primary hover:opacity-90"
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
              <h4 className="font-semibold mb-3 text-vibrant-red">Selected Products for Damage Report</h4>
              <Table>
                <TableHeader>
                  <TableRow className="bg-vibrant-red/10 hover:bg-vibrant-red/20">
                    <TableHead className="text-vibrant-red font-semibold">Product</TableHead>
                    <TableHead className="text-vibrant-red font-semibold">Unit</TableHead>
                    <TableHead className="text-vibrant-red font-semibold">Stock</TableHead>
                    <TableHead className="text-vibrant-red font-semibold">Damaged Quantity</TableHead>
                    <TableHead className="text-vibrant-red font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map(product => (
                    <TableRow key={product.id} className="hover:bg-vibrant-red/5 transition-colors">
                      <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                      <TableCell className="text-foreground">{product.unit}</TableCell>
                      <TableCell className="text-foreground">{product.currentStock}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min="1" 
                          max={product.currentStock}
                          value={product.damagedQuantity}
                          onChange={(e) => handleUpdateDamagedQuantity(product.id, parseInt(e.target.value) || 1)}
                          className="w-20 border-vibrant-red/30 focus:ring-vibrant-red"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRemoveProduct(product.id)}
                          className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
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

      {/* Damage Details Form */}
      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-red/5 to-vibrant-orange/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            Damage Details
          </CardTitle>
          <CardDescription className="text-base text-white/90">Provide damage information and details</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="damageDate" className="text-foreground">Damage Date</Label>
                <Input 
                  id="damageDate" 
                  type="date"
                  value={form.damageDate} 
                  onChange={(e) => handleChange('damageDate', e.target.value)} 
                  placeholder="Select date" 
                  className="border-vibrant-red/30 focus:ring-vibrant-red"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeLocation" className="text-foreground">Store/Location</Label>
                <Select value={form.storeLocation} onValueChange={(value) => handleChange('storeLocation', value)}>
                  <SelectTrigger className="border-vibrant-red/30 focus:ring-vibrant-red">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location} className="hover:bg-vibrant-red/10">{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportedBy" className="text-foreground">Reported By</Label>
                <Input 
                  id="reportedBy" 
                  value={form.reportedBy} 
                  onChange={(e) => handleChange('reportedBy', e.target.value)} 
                  placeholder="Employee name"
                  className="border-vibrant-red/30 focus:ring-vibrant-red"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-foreground">Reason</Label>
              <Textarea 
                id="reason" 
                value={form.reason} 
                onChange={(e) => handleChange('reason', e.target.value)} 
                placeholder="Detailed description of the damage reason..."
                rows={4}
                className="border-vibrant-red/30 focus:ring-vibrant-red"
              />
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-vibrant-red/20">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/damage-stock')}
                className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || selectedProducts.length === 0}
                className="bg-gradient-primary hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Damage Report'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}