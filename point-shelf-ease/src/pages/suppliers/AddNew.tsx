import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Globe, Phone, MapPin, Check, ArrowLeft, User } from 'lucide-react';
import { supplierService, withErrorHandling } from '@/integrations/supabase/services';
import { useToast } from '@/hooks/use-toast';

// List of common countries
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Japan', 'South Korea', 'Singapore', 'India', 'China', 'Brazil', 'Mexico',
  'Argentina', 'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'UAE', 'Saudi Arabia'
].sort();

export default function AddNewSupplierPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = 'Supplier name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (form.phone && !/^[\+]?[1-9][\d\s\-\(\)]{7,15}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await withErrorHandling(
        () => supplierService.create(form),
        'Failed to create supplier'
      );

      toast({
        title: 'Success',
        description: 'Supplier created successfully.',
      });

      navigate('/suppliers');
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to create supplier. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Add New Supplier</h1>
            <p className="text-lg text-muted-foreground">Add a new supplier to your directory with complete contact information</p>
          </div>
        </div>
      </div>

      <Card className="card-fintech hover-lift max-w-4xl mx-auto bg-gradient-to-br from-vibrant-purple/5 to-vibrant-pink/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Add New Supplier</CardTitle>
              <CardDescription className="text-white/90">
                Add a new supplier to your directory with complete contact information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Supplier Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-vibrant-purple" />
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Supplier Name *
                </Label>
              </div>
              <Input 
                id="name" 
                value={form.name} 
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter supplier company name"
                className={`input-fintech ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-purple/30 focus:ring-vibrant-purple'}`}
                required 
              />
              {errors.name && <p className="text-sm text-vibrant-red">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-vibrant-purple" />
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email Address
                  </Label>
                </div>
                <Input 
                  id="email" 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contact@company.com"
                  className={`input-fintech ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-purple/30 focus:ring-vibrant-purple'}`}
                />
                {errors.email && <p className="text-sm text-vibrant-red">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-vibrant-purple" />
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                    Phone Number
                  </Label>
                </div>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={form.phone} 
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 555-0123"
                  className={`input-fintech ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-purple/30 focus:ring-vibrant-purple'}`}
                />
                {errors.phone && <p className="text-sm text-vibrant-red">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Person */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-vibrant-purple" />
                  <Label htmlFor="contact_person" className="text-sm font-semibold text-foreground">
                    Contact Person
                  </Label>
                </div>
                <Input 
                  id="contact_person" 
                  value={form.contact_person} 
                  onChange={(e) => handleChange('contact_person', e.target.value)}
                  placeholder="Primary contact person"
                  className="input-fintech border-vibrant-purple/30 focus:ring-vibrant-purple"
                />
              </div>

              {/* Address */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-vibrant-purple" />
                  <Label htmlFor="address" className="text-sm font-semibold text-foreground">
                    Address
                  </Label>
                </div>
                <Input 
                  id="address" 
                  value={form.address} 
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Company address"
                  className="input-fintech border-vibrant-purple/30 focus:ring-vibrant-purple"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-vibrant-purple/20">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/suppliers')}
                className="btn-secondary gap-2 border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="btn-primary gap-2 min-w-[140px] bg-gradient-primary hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Supplier
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}