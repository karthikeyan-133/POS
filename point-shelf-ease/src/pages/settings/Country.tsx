import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Flag, Plus, Edit, Trash2, Search, Save } from 'lucide-react';

interface Country {
  id: string;
  name: string;
  code: string;
  phone_code: string;
  currency: string;
  is_active: boolean;
}

const SAMPLE_COUNTRIES: Country[] = [
  { id: '1', name: 'United States', code: 'US', phone_code: '+1', currency: 'USD', is_active: true },
  { id: '2', name: 'Canada', code: 'CA', phone_code: '+1', currency: 'CAD', is_active: true },
  { id: '3', name: 'United Kingdom', code: 'GB', phone_code: '+44', currency: 'GBP', is_active: true },
  { id: '4', name: 'Germany', code: 'DE', phone_code: '+49', currency: 'EUR', is_active: true },
  { id: '5', name: 'France', code: 'FR', phone_code: '+33', currency: 'EUR', is_active: true },
  { id: '6', name: 'Australia', code: 'AU', phone_code: '+61', currency: 'AUD', is_active: true },
  { id: '7', name: 'Japan', code: 'JP', phone_code: '+81', currency: 'JPY', is_active: true },
  { id: '8', name: 'India', code: 'IN', phone_code: '+91', currency: 'INR', is_active: false },
];

export default function CountryPage() {
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>(SAMPLE_COUNTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState<Omit<Country, 'id'>>({
    name: '',
    code: '',
    phone_code: '',
    currency: '',
    is_active: true
  });

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingCountry) {
      setCountries(prev => prev.map(country => 
        country.id === editingCountry.id ? { ...formData, id: editingCountry.id } : country
      ));
      toast({
        title: "Success",
        description: "Country updated successfully",
      });
    } else {
      const newCountry = { ...formData, id: Date.now().toString() };
      setCountries(prev => [...prev, newCountry]);
      toast({
        title: "Success",
        description: "Country added successfully",
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCountries(prev => prev.filter(country => country.id !== id));
    toast({
      title: "Success",
      description: "Country deleted successfully",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      phone_code: '',
      currency: '',
      is_active: true
    });
    setEditingCountry(null);
  };

  const openEditDialog = (country: Country) => {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      code: country.code,
      phone_code: country.phone_code,
      currency: country.currency,
      is_active: country.is_active
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground flex items-center">
            <Flag className="mr-2 h-5 w-5" />
            Country Management
          </CardTitle>
          <CardDescription>Manage countries and their settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Country
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCountry ? 'Edit Country' : 'Add New Country'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Country Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="United States"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Country Code *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="US"
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_code">Phone Code</Label>
                      <Input
                        id="phone_code"
                        value={formData.phone_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone_code: e.target.value }))}
                        placeholder="+1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                      placeholder="USD"
                      maxLength={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="gap-2">
                      <Save className="h-4 w-4" />
                      {editingCountry ? 'Update' : 'Add'} Country
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Phone Code</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCountries.map((country) => (
                <TableRow key={country.id}>
                  <TableCell className="font-medium">{country.name}</TableCell>
                  <TableCell>{country.code}</TableCell>
                  <TableCell>{country.phone_code}</TableCell>
                  <TableCell>{country.currency}</TableCell>
                  <TableCell>
                    <Badge variant={country.is_active ? "default" : "secondary"}>
                      {country.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(country)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(country.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
