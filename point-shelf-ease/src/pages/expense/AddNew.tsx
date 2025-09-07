import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, DollarSign } from 'lucide-react';
import { expenseService, uploadFile, withErrorHandling, type ExpenseInsert } from '@/integrations/supabase/services';
import { useToast } from '@/hooks/use-toast';

export default function AddNewExpensePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [form, setForm] = useState({
    expense_date: '',
    store_location: '',
    amount: '',
    expense_category: '',
    user_name: '',
    tax: '',
    notes: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      setReceiptFile(file);
    }
  };

  const removeFile = () => {
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.expense_date || !form.store_location || !form.amount || !form.expense_category || !form.user_name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      let receiptFileUrl = '';
      let receiptFileName = '';

      // Upload receipt file if provided
      if (receiptFile) {
        const filePath = `receipts/${Date.now()}-${receiptFile.name}`;
        receiptFileUrl = await uploadFile(receiptFile, 'receipts', filePath);
        receiptFileName = receiptFile.name;
      }

      // Calculate total tax (for now, just use the tax amount)
      const taxAmount = parseFloat(form.tax) || 0;
      const totalTax = taxAmount;

      // Create expense
      await withErrorHandling(
        () => expenseService.create({
          expense_date: form.expense_date,
          amount: parseFloat(form.amount),
          expense_category: form.expense_category,
          user_name: form.user_name,
          store_location: form.store_location,
          tax: taxAmount,
          total_tax: totalTax,
          receipt_file_url: receiptFileUrl,
          receipt_file_name: receiptFileName,
          notes: form.notes,
        }),
        'Failed to create expense'
      );

      toast({
        title: 'Success',
        description: 'Expense created successfully.',
      });

      navigate('/expense');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const expenseCategories = [
    'Office Expenses',
    'Utilities',
    'Marketing',
    'Equipment',
    'Travel',
    'Insurance',
    'Rent',
    'Salaries',
    'Software',
    'Maintenance',
    'Supplies',
    'Professional Services',
    'Other'
  ];

  const storeLocations = [
    'Main Store',
    'Branch A',
    'Branch B',
    'Warehouse',
    'Office'
  ];

  const users = [
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Sarah Wilson',
    'David Brown',
    'Emily Davis'
  ];

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">New Expense</h1>
            <p className="text-lg text-muted-foreground">Record a new business expense</p>
          </div>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-red/5 to-vibrant-orange/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            New Expense
          </CardTitle>
          <CardDescription className="text-base text-white/90">Record a new business expense</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense_date" className="text-foreground">Expense Date *</Label>
                <Input 
                  id="expense_date" 
                  type="date"
                  value={form.expense_date} 
                  onChange={(e) => handleChange('expense_date', e.target.value)} 
                  required
                  className="border-vibrant-red/30 focus:ring-vibrant-red"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_location" className="text-foreground">Store/Location *</Label>
                <Select value={form.store_location} onValueChange={(value) => handleChange('store_location', value)} required>
                  <SelectTrigger className="border-vibrant-red/30 focus:ring-vibrant-red">
                    <SelectValue placeholder="Select store/location" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeLocations.map(location => (
                      <SelectItem key={location} value={location} className="hover:bg-vibrant-red/10">{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground">Amount ($) *</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  value={form.amount} 
                  onChange={(e) => handleChange('amount', e.target.value)} 
                  placeholder="0.00"
                  required
                  className="border-vibrant-red/30 focus:ring-vibrant-red"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense_category" className="text-foreground">Expense Category *</Label>
                <Select value={form.expense_category} onValueChange={(value) => handleChange('expense_category', value)} required>
                  <SelectTrigger className="border-vibrant-red/30 focus:ring-vibrant-red">
                    <SelectValue placeholder="Select expense category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category} value={category} className="hover:bg-vibrant-red/10">{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_name" className="text-foreground">User *</Label>
                <Select value={form.user_name} onValueChange={(value) => handleChange('user_name', value)} required>
                  <SelectTrigger className="border-vibrant-red/30 focus:ring-vibrant-red">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user} value={user} className="hover:bg-vibrant-red/10">{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax" className="text-foreground">Tax Amount ($)</Label>
                <Input 
                  id="tax" 
                  type="number" 
                  step="0.01" 
                  value={form.tax} 
                  onChange={(e) => handleChange('tax', e.target.value)} 
                  placeholder="0.00"
                  className="border-vibrant-red/30 focus:ring-vibrant-red"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt" className="text-foreground">Receipt Attachment</Label>
              <div className="border-2 border-dashed border-vibrant-red/30 rounded-lg p-6 bg-white">
                {receiptFile ? (
                  <div className="flex items-center justify-between p-3 bg-vibrant-red/5 rounded-lg border border-vibrant-red/10">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-vibrant-red" />
                      <div>
                        <p className="font-medium text-sm text-foreground">{receiptFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                      className="h-8 w-8 p-0 border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-vibrant-red" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-foreground">
                          Click to upload receipt
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          PNG, JPG, PDF up to 5MB
                        </span>
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">Notes</Label>
              <Textarea 
                id="notes" 
                value={form.notes} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                placeholder="Additional notes about this expense..."
                rows={4}
                className="border-vibrant-red/30 focus:ring-vibrant-red"
              />
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-vibrant-red/20">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/expense')}
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
                  'Save Expense'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}