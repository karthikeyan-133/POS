import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Loader2, Plus, Edit, Trash2, Users } from 'lucide-react';
import { customerService, withErrorHandling } from '@/integrations/supabase/services';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export default function CustomerListPage() {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customerData = await withErrorHandling(
        () => customerService.getAll(),
        'Failed to load customers'
      );
      setCustomers(customerData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load customers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  }, [query, customers]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '' });
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await withErrorHandling(
          () => customerService.update(editingCustomer.id, formData),
          'Failed to update customer'
        );
        toast({ title: 'Success', description: 'Customer updated successfully' });
      } else {
        await withErrorHandling(
          () => customerService.create(formData),
          'Failed to create customer'
        );
        toast({ title: 'Success', description: 'Customer created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCustomers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save customer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Customers</h1>
            <p className="text-lg text-muted-foreground">Manage your customer database</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => navigate('/customers/add')} className="hover:shadow-lg transition-all duration-300 bg-vibrant-blue hover:bg-vibrant-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }} 
              variant="gradient" 
              className="hover:shadow-lg transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Quick Add
            </Button>
          </div>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-blue/5 to-vibrant-purple/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            Customer List
          </CardTitle>
          <CardDescription className="text-base text-white/90">
            All customers in your database
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
            <Input placeholder="Search customers..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus-visible:ring-white/50" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-vibrant-purple" />
              <span className="ml-2 text-muted-foreground">Loading customers...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-vibrant-blue/10 hover:bg-vibrant-blue/20">
                  <TableHead className="text-vibrant-blue font-semibold">Name</TableHead>
                  <TableHead className="text-vibrant-blue font-semibold">Email</TableHead>
                  <TableHead className="text-vibrant-blue font-semibold">Phone</TableHead>
                  <TableHead className="text-vibrant-blue font-semibold">Address</TableHead>
                  <TableHead className="text-vibrant-blue font-semibold">Created Date</TableHead>
                  <TableHead className="text-vibrant-blue font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(customer => (
                  <TableRow key={customer.id} className="hover:bg-vibrant-blue/5 transition-colors">
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.address || '-'}</TableCell>
                    <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(customer)}
                          className="text-vibrant-blue hover:bg-vibrant-blue/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer)}
                          className="text-vibrant-red hover:bg-vibrant-red/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-vibrant-blue/30" />
              <p className="text-muted-foreground mt-2">No customers found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


