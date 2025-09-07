import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';

// Sample data for suppliers
const SUPPLIERS = [
  { id: 'sup1', name: 'Acme Corporation' },
  { id: 'sup2', name: 'Global Ltd' },
  { id: 'sup3', name: 'Tech Solutions Inc' },
  { id: 'sup4', name: 'Quality Supplies Co' },
];

// Sample data for purchases
const PURCHASES = [
  { id: 'pur1', orderNumber: 'PO-2001', supplier: 'Acme Corporation', date: '2025-02-01', total: 1500.0 },
  { id: 'pur2', orderNumber: 'PO-2002', supplier: 'Global Ltd', date: '2025-02-05', total: 850.25 },
  { id: 'pur3', orderNumber: 'PO-2003', supplier: 'Tech Solutions Inc', date: '2025-02-08', total: 2200.0 },
  { id: 'pur4', orderNumber: 'PO-2004', supplier: 'Quality Supplies Co', date: '2025-02-10', total: 675.50 },
];

export default function AddNewPurchaseReturnPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    reference: '',
    supplierId: '',
    purchaseId: '',
    date: '',
    notes: '',
    total: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Filter purchases by selected supplier
  const filteredPurchases = form.supplierId 
    ? PURCHASES.filter(p => {
        const supplier = SUPPLIERS.find(s => s.id === form.supplierId);
        return supplier && p.supplier === supplier.name;
      })
    : PURCHASES;

  // Get selected supplier name
  const getSupplierName = (supplierId: string) => {
    const supplier = SUPPLIERS.find(s => s.id === supplierId);
    return supplier?.name || '';
  };

  // Get selected purchase info
  const getSelectedPurchase = () => {
    return PURCHASES.find(p => p.id === form.purchaseId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/purchase-returns');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">New Purchase Return</h1>
            <p className="text-lg text-muted-foreground">Create a purchase return</p>
          </div>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-orange/5 to-vibrant-red/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <RotateCcw className="h-6 w-6 text-white" />
            </div>
            New Purchase Return
          </CardTitle>
          <CardDescription className="text-base text-white/90">Create a purchase return</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-foreground">Reference</Label>
                <Input 
                  id="reference" 
                  value={form.reference} 
                  onChange={(e) => handleChange('reference', e.target.value)} 
                  placeholder="Auto or manual" 
                  className="border-vibrant-orange/30 focus:ring-vibrant-orange"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-foreground">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={form.date} 
                  onChange={(e) => handleChange('date', e.target.value)} 
                  className="border-vibrant-orange/30 focus:ring-vibrant-orange"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-foreground">Select Supplier</Label>
                <Select 
                  value={form.supplierId} 
                  onValueChange={(value) => {
                    handleChange('supplierId', value);
                    handleChange('purchaseId', ''); // Reset purchase selection when supplier changes
                  }}
                >
                  <SelectTrigger className="border-vibrant-orange/30 focus:ring-vibrant-orange">
                    <SelectValue placeholder="Choose a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPLIERS.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id} className="hover:bg-vibrant-orange/10">
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase" className="text-foreground">Select Purchase</Label>
                <Select 
                  value={form.purchaseId} 
                  onValueChange={(value) => handleChange('purchaseId', value)}
                  disabled={!form.supplierId}
                >
                  <SelectTrigger className="border-vibrant-orange/30 focus:ring-vibrant-orange">
                    <SelectValue placeholder={!form.supplierId ? "Select supplier first" : "Choose a purchase"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPurchases.map((purchase) => (
                      <SelectItem key={purchase.id} value={purchase.id} className="hover:bg-vibrant-orange/10">
                        {purchase.orderNumber} - ${purchase.total.toFixed(2)} ({purchase.date})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Show purchase details if selected */}
            {form.purchaseId && (
              <div className="p-4 bg-vibrant-orange/10 rounded-lg border border-vibrant-orange/20">
                <h4 className="font-semibold mb-2 text-vibrant-orange">Selected Purchase Details</h4>
                {(() => {
                  const selectedPurchase = getSelectedPurchase();
                  if (!selectedPurchase) return null;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="text-foreground"><strong>Order Number:</strong> {selectedPurchase.orderNumber}</div>
                      <div className="text-foreground"><strong>Supplier:</strong> {selectedPurchase.supplier}</div>
                      <div className="text-foreground"><strong>Date:</strong> {selectedPurchase.date}</div>
                      <div className="text-foreground"><strong>Total:</strong> <span className="text-vibrant-orange font-medium">${selectedPurchase.total.toFixed(2)}</span></div>
                    </div>
                  );
                })()} 
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="total" className="text-foreground">Return Total</Label>
              <Input 
                id="total" 
                type="number" 
                step="0.01" 
                value={form.total} 
                onChange={(e) => handleChange('total', e.target.value)} 
                placeholder="Enter return amount" 
                className="border-vibrant-orange/30 focus:ring-vibrant-orange"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">Notes</Label>
              <Textarea 
                id="notes" 
                value={form.notes} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                className="border-vibrant-orange/30 focus:ring-vibrant-orange"
              />
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-vibrant-orange/20">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/purchase-returns')}
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
                  'Save Return'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}