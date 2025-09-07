import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Mail, Phone, Hash, Globe, MapPin, Building2, 
  Upload, FileText, Check, ArrowLeft, Copy, User
} from 'lucide-react';
import { customerService, uploadFile, withErrorHandling } from '@/integrations/supabase/services';
import { useToast } from '@/hooks/use-toast';

// Countries and major cities data
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Japan', 'South Korea', 'Singapore', 'India', 'China', 'Brazil', 'Mexico',
  'Argentina', 'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'UAE', 'Saudi Arabia'
].sort();

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
  'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Glasgow'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra'],
  'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
  'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xian']
};

export default function AddNewCustomerPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    taxNumber: '',
    website: '',
    billingAddress: '',
    billingCountry: '',
    billingCity: '',
    shippingAddress: '',
    shippingCountry: '',
    shippingCity: '',
    description: '',
  });
  
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      setForm(prev => ({
        ...prev,
        shippingAddress: prev.billingAddress,
        shippingCountry: prev.billingCountry,
        shippingCity: prev.billingCity,
      }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, logo: 'Logo file size must be less than 5MB' }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select a valid image file' }));
        return;
      }
      setLogo(file);
      setErrors(prev => ({ ...prev, logo: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[\+]?[1-9][\d\s\-\(\)]{7,15}$/.test(form.contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (form.website && !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}/.test(form.website.replace(/^https?:\/\//, ''))) {
      newErrors.website = 'Please enter a valid website (e.g., example.com)';
    }
    if (!form.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
    if (!form.billingCountry) newErrors.billingCountry = 'Billing country is required';
    if (!form.billingCity) newErrors.billingCity = 'Billing city is required';
    
    if (!sameAsBilling) {
      if (!form.shippingAddress.trim()) newErrors.shippingAddress = 'Shipping address is required';
      if (!form.shippingCountry) newErrors.shippingCountry = 'Shipping country is required';
      if (!form.shippingCity) newErrors.shippingCity = 'Shipping city is required';
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
      let logoUrl = '';
      
      // Upload logo if provided
      if (logo) {
        try {
          const logoPath = `customer-logos/${Date.now()}-${logo.name}`;
          logoUrl = await uploadFile(logo, 'customer-assets', logoPath);
        } catch (error) {
          console.error('Logo upload failed:', error);
          // Continue without logo if upload fails
        }
      }

      // Prepare customer data for database
      const customerData = {
        name: form.customerName,
        email: form.email,
        phone: form.contactNumber,
        address: sameAsBilling 
          ? `Billing: ${form.billingAddress}, ${form.billingCity}, ${form.billingCountry}` 
          : `Billing: ${form.billingAddress}, ${form.billingCity}, ${form.billingCountry}; Shipping: ${form.shippingAddress}, ${form.shippingCity}, ${form.shippingCountry}`,
        // Note: The current database schema for customers is simple, so we'll store additional info in a structured way
        // In a real application, you'd want to extend the database schema to support all these fields
      };

      await withErrorHandling(
        () => customerService.create(customerData),
        'Failed to create customer'
      );

      toast({
        title: 'Success',
        description: 'Customer created successfully.',
      });

      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create customer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getBillingCities = () => CITIES_BY_COUNTRY[form.billingCountry] || [];
  const getShippingCities = () => CITIES_BY_COUNTRY[form.shippingCountry] || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="card-fintech hover-lift bg-gradient-to-br from-vibrant-blue/5 to-vibrant-purple/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Add New Customer</CardTitle>
              <CardDescription className="text-white/90">
                Create a comprehensive customer profile with complete contact and address information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-vibrant-blue/20">
                <Users className="h-5 w-5 text-vibrant-blue" />
                <h3 className="text-lg font-semibold text-vibrant-blue">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-vibrant-blue" />
                    <Label htmlFor="customerName" className="text-sm font-semibold text-foreground">
                      Customer Name *
                    </Label>
                  </div>
                  <Input 
                    id="customerName" 
                    value={form.customerName} 
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    placeholder="Enter customer name"
                    className={`input-fintech ${errors.customerName ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}
                    required 
                  />
                  {errors.customerName && <p className="text-sm text-vibrant-red">{errors.customerName}</p>}
                </div>

                {/* Contact Number */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-vibrant-blue" />
                    <Label htmlFor="contactNumber" className="text-sm font-semibold text-foreground">
                      Contact Number *
                    </Label>
                  </div>
                  <Input 
                    id="contactNumber" 
                    type="tel" 
                    value={form.contactNumber} 
                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                    placeholder="+1 555-0123"
                    className={`input-fintech ${errors.contactNumber ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}
                    required 
                  />
                  {errors.contactNumber && <p className="text-sm text-vibrant-red">{errors.contactNumber}</p>}
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-vibrant-blue" />
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                      Email Address *
                    </Label>
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="customer@company.com"
                    className={`input-fintech ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}
                    required 
                  />
                  {errors.email && <p className="text-sm text-vibrant-red">{errors.email}</p>}
                </div>

                {/* Tax Number */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-vibrant-blue" />
                    <Label htmlFor="taxNumber" className="text-sm font-semibold text-foreground">
                      Tax Number
                    </Label>
                  </div>
                  <Input 
                    id="taxNumber" 
                    value={form.taxNumber} 
                    onChange={(e) => handleChange('taxNumber', e.target.value)}
                    placeholder="Enter tax identification number"
                    className="input-fintech border-vibrant-blue/30 focus:ring-vibrant-blue"
                  />
                </div>

                {/* Website */}
                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-vibrant-blue" />
                    <Label htmlFor="website" className="text-sm font-semibold text-foreground">
                      Website
                    </Label>
                  </div>
                  <Input 
                    id="website" 
                    type="url" 
                    value={form.website} 
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="www.customer-company.com"
                    className={`input-fintech ${errors.website ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}
                  />
                  {errors.website && <p className="text-sm text-vibrant-red">{errors.website}</p>}
                </div>
              </div>
            </div>

            {/* Logo Upload Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-vibrant-blue/20">
                <Upload className="h-5 w-5 text-vibrant-blue" />
                <h3 className="text-lg font-semibold text-vibrant-blue">Customer Logo</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {logo ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  {logo && (
                    <span className="text-sm text-muted-foreground">
                      {logo.name} ({(logo.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>
                {logoPreview && (
                  <div className="w-32 h-32 border-2 border-dashed border-vibrant-blue/20 rounded-lg overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                )}
                {errors.logo && <p className="text-sm text-vibrant-red">{errors.logo}</p>}
                <p className="text-xs text-muted-foreground">Supported formats: PNG, JPG, GIF. Max size: 5MB</p>
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-vibrant-blue/20">
                <Building2 className="h-5 w-5 text-vibrant-blue" />
                <h3 className="text-lg font-semibold text-vibrant-blue">Billing Address</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-vibrant-blue" />
                    <Label htmlFor="billingAddress" className="text-sm font-semibold text-foreground">
                      Billing Address *
                    </Label>
                  </div>
                  <Textarea 
                    id="billingAddress" 
                    value={form.billingAddress} 
                    onChange={(e) => handleChange('billingAddress', e.target.value)}
                    placeholder="Enter complete billing address"
                    className={`input-fintech min-h-[80px] ${errors.billingAddress ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}
                    required 
                  />
                  {errors.billingAddress && <p className="text-sm text-vibrant-red">{errors.billingAddress}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="billingCountry" className="text-sm font-semibold text-foreground">
                      Country *
                    </Label>
                    <Select 
                      value={form.billingCountry} 
                      onValueChange={(value) => {
                        handleChange('billingCountry', value);
                        handleChange('billingCity', ''); // Reset city when country changes
                        if (sameAsBilling) {
                          handleChange('shippingCountry', value);
                          handleChange('shippingCity', '');
                        }
                      }}
                    >
                      <SelectTrigger className={`input-fintech ${errors.billingCountry ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.billingCountry && <p className="text-sm text-vibrant-red">{errors.billingCountry}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="billingCity" className="text-sm font-semibold text-foreground">
                      City *
                    </Label>
                    <Select 
                      value={form.billingCity} 
                      onValueChange={(value) => {
                        handleChange('billingCity', value);
                        if (sameAsBilling) {
                          handleChange('shippingCity', value);
                        }
                      }}
                      disabled={!form.billingCountry}
                    >
                      <SelectTrigger className={`input-fintech ${errors.billingCity ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}>
                        <SelectValue placeholder={form.billingCountry ? "Select city" : "Select country first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getBillingCities().map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.billingCity && <p className="text-sm text-vibrant-red">{errors.billingCity}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-vibrant-blue/20">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-vibrant-blue" />
                  <h3 className="text-lg font-semibold text-vibrant-blue">Shipping Address</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sameAsBilling" 
                    checked={sameAsBilling}
                    onCheckedChange={handleSameAsBillingChange}
                  />
                  <Label htmlFor="sameAsBilling" className="text-sm text-muted-foreground cursor-pointer">
                    Same as billing address
                  </Label>
                </div>
              </div>
              
              {!sameAsBilling && (
                <div className="space-y-6 animate-slide-in">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-vibrant-blue" />
                      <Label htmlFor="shippingAddress" className="text-sm font-semibold text-foreground">
                        Shipping Address *
                      </Label>
                    </div>
                    <Textarea 
                      id="shippingAddress" 
                      value={form.shippingAddress} 
                      onChange={(e) => handleChange('shippingAddress', e.target.value)}
                      placeholder="Enter complete shipping address"
                      className={`input-fintech min-h-[80px] ${errors.shippingAddress ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}
                      required 
                    />
                    {errors.shippingAddress && <p className="text-sm text-vibrant-red">{errors.shippingAddress}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="shippingCountry" className="text-sm font-semibold text-foreground">
                        Country *
                      </Label>
                      <Select 
                        value={form.shippingCountry} 
                        onValueChange={(value) => {
                          handleChange('shippingCountry', value);
                          handleChange('shippingCity', ''); // Reset city when country changes
                        }}
                      >
                        <SelectTrigger className={`input-fintech ${errors.shippingCountry ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.shippingCountry && <p className="text-sm text-vibrant-red">{errors.shippingCountry}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="shippingCity" className="text-sm font-semibold text-foreground">
                        City *
                      </Label>
                      <Select 
                        value={form.shippingCity} 
                        onValueChange={(value) => handleChange('shippingCity', value)}
                        disabled={!form.shippingCountry}
                      >
                        <SelectTrigger className={`input-fintech ${errors.shippingCity ? 'border-red-500 focus:ring-red-500' : 'border-vibrant-blue/30 focus:ring-vibrant-blue'}`}>
                          <SelectValue placeholder={form.shippingCountry ? "Select city" : "Select country first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {getShippingCities().map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.shippingCity && <p className="text-sm text-vibrant-red">{errors.shippingCity}</p>}
                    </div>
                  </div>
                </div>
              )}
              
              {sameAsBilling && (
                <div className="p-4 bg-vibrant-blue/10 rounded-lg border border-vibrant-blue/20">
                  <div className="flex items-center gap-2 text-vibrant-blue">
                    <Copy className="h-4 w-4" />
                    <span className="text-sm font-medium">Using billing address for shipping</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-vibrant-blue/20">
                <FileText className="h-5 w-5 text-vibrant-blue" />
                <h3 className="text-lg font-semibold text-vibrant-blue">Additional Information</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-vibrant-blue" />
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                    Description
                  </Label>
                </div>
                <Textarea 
                  id="description" 
                  value={form.description} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add any additional notes or description about the customer..."
                  className="input-fintech min-h-[100px] border-vibrant-blue/30 focus:ring-vibrant-blue"
                  rows={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-vibrant-blue/20">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/customers')}
                className="btn-secondary gap-2 hover:bg-vibrant-red/10 hover:text-vibrant-red border-vibrant-blue/30"
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="btn-primary gap-2 min-w-[160px] bg-gradient-primary hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving Customer...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Customer
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
