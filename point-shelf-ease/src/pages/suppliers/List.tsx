import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2, Plus, Edit, Trash2, Truck } from 'lucide-react';
import { supplierService, withErrorHandling } from '@/integrations/supabase/services';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  created_at: string;
  updated_at: string;
}

export default function SupplierListPage() {
  const [query, setQuery] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const supplierData = await withErrorHandling(
        () => supplierService.getAll(),
        'Failed to load suppliers'
      );
      setSuppliers(supplierData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load suppliers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, formData);
        toast({
          title: 'Success',
          description: 'Supplier updated successfully',
        });
      } else {
        await supplierService.create(formData);
        toast({
          title: 'Success',
          description: 'Supplier created successfully',
        });
      }
      setDialogOpen(false);
      resetForm();
      loadSuppliers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save supplier',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      await supplierService.delete(id);
      toast({
        title: 'Success',
        description: 'Supplier deleted successfully',
      });
      loadSuppliers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete supplier',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '', contact_person: '' });
    setEditingSupplier(null);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      contact_person: supplier.contact_person || ''
    });
    setDialogOpen(true);
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q) ||
      (s.contact_person || '').toLowerCase().includes(q)
    );
  }, [query, suppliers]);

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Suppliers</h1>
            <p className="text-lg text-muted-foreground">Manage your supplier contacts and information</p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }} 
            className="hover:shadow-lg transition-all duration-300 bg-vibrant-purple hover:bg-vibrant-purple/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-purple/5 to-vibrant-pink/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              Supplier Directory
              <span className="text-sm font-normal bg-white/20 text-white px-2 py-1 rounded-full">
                {filtered.length} of {suppliers.length}
              </span>
            </CardTitle>
          </div>
          <CardDescription className="text-white/90">
            Manage your supplier contacts and information
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
            <Input 
              placeholder="Search by name, email, contact person, phone, or address..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus-visible:ring-white/50" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-vibrant-purple" />
              <span className="ml-2 text-muted-foreground">Loading suppliers...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-vibrant-purple/10 hover:bg-vibrant-purple/20">
                  <TableHead className="font-semibold text-vibrant-purple">Name</TableHead>
                  <TableHead className="font-semibold text-vibrant-purple">Contact Person</TableHead>
                  <TableHead className="font-semibold text-vibrant-purple">Email</TableHead>
                  <TableHead className="font-semibold text-vibrant-purple">Phone</TableHead>
                  <TableHead className="font-semibold text-vibrant-purple">Address</TableHead>
                  <TableHead className="font-semibold text-vibrant-purple">Created Date</TableHead>
                  <TableHead className="font-semibold text-vibrant-purple">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {query ? 'No suppliers found matching your search.' : 'No suppliers found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(s => (
                    <TableRow key={s.id} className="hover:bg-vibrant-purple/5 transition-colors">
                      <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.contact_person || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.email ? (
                          <a href={`mailto:${s.email}`} className="text-vibrant-purple hover:underline transition-colors">
                            {s.email}
                          </a>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.phone ? (
                          <a href={`tel:${s.phone}`} className="text-vibrant-purple hover:underline transition-colors">
                            {s.phone}
                          </a>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.address || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(s)}
                            className="text-vibrant-blue hover:bg-vibrant-blue/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(s.id)}
                            className="text-vibrant-red hover:bg-vibrant-red/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-vibrant-purple">
              {editingSupplier ? 'Edit Supplier' : 'Create New Supplier'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-vibrant-purple/30 focus:ring-vibrant-purple"
              />
            </div>
            <div>
              <Label htmlFor="contact_person" className="text-foreground">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="border-vibrant-purple/30 focus:ring-vibrant-purple"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-vibrant-purple/30 focus:ring-vibrant-purple"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-foreground">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-vibrant-purple/30 focus:ring-vibrant-purple"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-foreground">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border-vibrant-purple/30 focus:ring-vibrant-purple"
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
                {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}