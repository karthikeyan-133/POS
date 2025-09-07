import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Map, Plus, Edit, Trash2, Search, Save } from 'lucide-react';

interface City {
  id: string;
  name: string;
  country: string;
  state: string;
  timezone: string;
  is_active: boolean;
}

const SAMPLE_CITIES: City[] = [
  { id: '1', name: 'New York', country: 'United States', state: 'New York', timezone: 'America/New_York', is_active: true },
  { id: '2', name: 'Los Angeles', country: 'United States', state: 'California', timezone: 'America/Los_Angeles', is_active: true },
  { id: '3', name: 'Chicago', country: 'United States', state: 'Illinois', timezone: 'America/Chicago', is_active: true },
  { id: '4', name: 'Toronto', country: 'Canada', state: 'Ontario', timezone: 'America/Toronto', is_active: true },
  { id: '5', name: 'London', country: 'United Kingdom', state: 'England', timezone: 'Europe/London', is_active: true },
  { id: '6', name: 'Berlin', country: 'Germany', state: 'Berlin', timezone: 'Europe/Berlin', is_active: true },
  { id: '7', name: 'Paris', country: 'France', state: 'Île-de-France', timezone: 'Europe/Paris', is_active: true },
  { id: '8', name: 'Sydney', country: 'Australia', state: 'New South Wales', timezone: 'Australia/Sydney', is_active: false },
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'India'
];

const STATES = {
  'United States': ['New York', 'California', 'Illinois', 'Texas', 'Florida', 'Pennsylvania'],
  'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'Germany': ['Berlin', 'Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg'],
  'France': ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia']
};

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
];

export default function CityPage() {
  const { toast } = useToast();
  const [cities, setCities] = useState<City[]>(SAMPLE_CITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState<Omit<City, 'id'>>({
    name: '',
    country: '',
    state: '',
    timezone: '',
    is_active: true
  });

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.country) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingCity) {
      setCities(prev => prev.map(city => 
        city.id === editingCity.id ? { ...formData, id: editingCity.id } : city
      ));
      toast({
        title: "Success",
        description: "City updated successfully",
      });
    } else {
      const newCity = { ...formData, id: Date.now().toString() };
      setCities(prev => [...prev, newCity]);
      toast({
        title: "Success",
        description: "City added successfully",
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCities(prev => prev.filter(city => city.id !== id));
    toast({
      title: "Success",
      description: "City deleted successfully",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      state: '',
      timezone: '',
      is_active: true
    });
    setEditingCity(null);
  };

  const openEditDialog = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      country: city.country,
      state: city.state,
      timezone: city.timezone,
      is_active: city.is_active
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCountryChange = (country: string) => {
    setFormData(prev => ({ 
      ...prev, 
      country,
      state: '' // Reset state when country changes
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground flex items-center">
            <Map className="mr-2 h-5 w-5" />
            City Management
          </CardTitle>
          <CardDescription>Manage cities and their location settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add City
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCity ? 'Edit City' : 'Add New City'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">City Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="New York"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select value={formData.country} onValueChange={handleCountryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Select 
                        value={formData.state} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                        disabled={!formData.country}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.country && STATES[formData.country as keyof typeof STATES]?.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map(timezone => (
                          <SelectItem key={timezone} value={timezone}>{timezone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      {editingCity ? 'Update' : 'Add'} City
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>State/Province</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{city.country}</TableCell>
                  <TableCell>{city.state}</TableCell>
                  <TableCell>{city.timezone}</TableCell>
                  <TableCell>
                    <Badge variant={city.is_active ? "default" : "secondary"}>
                      {city.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(city)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(city.id)}
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
