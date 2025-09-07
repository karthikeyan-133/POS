import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

// Sample data for customers
const CUSTOMERS = [
  { id: 'cus1', name: 'John Smith' },
  { id: 'cus2', name: 'Jane Doe' },
  { id: 'cus3', name: 'ABC Corporation' },
  { id: 'cus4', name: 'XYZ Industries' },
];

// Sample data for sales
const SALES = [
  { id: 'sal1', orderNumber: 'SO-2001', customer: 'John Smith', date: '2025-02-01', total: 1500.0 },
  { id: 'sal2', orderNumber: 'SO-2002', customer: 'Jane Doe', date: '2025-02-05', total: 850.25 },
  { id: 'sal3', orderNumber: 'SO-2003', customer: 'ABC Corporation', date: '2025-02-08', total: 2200.0 },
  { id: 'sal4', orderNumber: 'SO-2004', customer: 'XYZ Industries', date: '2025-02-10', total: 675.50 },
];

export default function AddNewSalesReturnPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    reference: '',
    customerId: '',
    salesId: '',
    date: '',
    notes: '',
    total: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Filter sales by selected customer
  const filteredSales = form.customerId 
    ? SALES.filter(s => {
        const customer = CUSTOMERS.find(c => c.id === form.customerId);
        return customer && s.customer === customer.name;
      })
    : SALES;

  // Get selected customer name
  const getCustomerName = (customerId: string) => {
    const customer = CUSTOMERS.find(c => c.id === customerId);
    return customer?.name || '';
  };

  // Get selected sales info
  const getSelectedSale = () => {
    return SALES.find(s => s.id === form.salesId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/sales-returns');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">New Sales Return</CardTitle>
        <CardDescription>Create a sales return</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" value={form.reference} onChange={(e) => handleChange('reference', e.target.value)} placeholder="Auto or manual" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Select Customer</Label>
              <Select value={form.customerId} onValueChange={(value) => {
                handleChange('customerId', value);
                handleChange('salesId', ''); // Reset sales selection when customer changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMERS.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales">Select Sales Order</Label>
              <Select 
                value={form.salesId} 
                onValueChange={(value) => handleChange('salesId', value)}
                disabled={!form.customerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!form.customerId ? "Select customer first" : "Choose a sales order"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSales.map((sale) => (
                    <SelectItem key={sale.id} value={sale.id}>
                      {sale.orderNumber} - ${sale.total.toFixed(2)} ({sale.date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show sales details if selected */}
          {form.salesId && (
            <div className="p-4 bg-slate-50 rounded-lg border">
              <h4 className="font-semibold mb-2">Selected Sales Order Details</h4>
              {(() => {
                const selectedSale = getSelectedSale();
                if (!selectedSale) return null;
                return (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Order Number:</strong> {selectedSale.orderNumber}</div>
                    <div><strong>Customer:</strong> {selectedSale.customer}</div>
                    <div><strong>Date:</strong> {selectedSale.date}</div>
                    <div><strong>Total:</strong> ${selectedSale.total.toFixed(2)}</div>
                  </div>
                );
              })()} 
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="total">Return Total</Label>
            <Input id="total" type="number" step="0.01" value={form.total} onChange={(e) => handleChange('total', e.target.value)} placeholder="Enter return amount" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/sales-returns')}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Return'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


