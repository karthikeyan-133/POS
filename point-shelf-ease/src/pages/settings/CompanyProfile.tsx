import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save, Upload, Globe, Phone, Mail } from 'lucide-react';

interface CompanyProfile {
  id: string;
  company_name: string;
  legal_name: string;
  business_type: string;
  industry: string;
  founded_year: string;
  tax_id: string;
  registration_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
  description: string;
  mission: string;
  vision: string;
}

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const [company, setCompany] = useState<CompanyProfile>({
    id: '1',
    company_name: 'QuickPOS Solutions',
    legal_name: 'QuickPOS Solutions Inc.',
    business_type: 'Corporation',
    industry: 'Technology',
    founded_year: '2020',
    tax_id: '12-3456789',
    registration_number: 'REG123456',
    address: '123 Business Street, Suite 100',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postal_code: '10001',
    phone: '+1 (555) 123-4567',
    email: 'info@quickpos.com',
    website: 'https://quickpos.com',
    logo_url: '',
    description: 'Leading provider of point-of-sale solutions for modern businesses.',
    mission: 'To empower businesses with innovative and reliable POS solutions.',
    vision: 'To be the most trusted POS provider globally.'
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Company profile saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save company profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>Basic company details and legal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={company.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal_name">Legal Name</Label>
              <Input
                id="legal_name"
                value={company.legal_name}
                onChange={(e) => handleChange('legal_name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select value={company.business_type} onValueChange={(value) => handleChange('business_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="LLC">LLC</SelectItem>
                  <SelectItem value="Corporation">Corporation</SelectItem>
                  <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={company.industry} onValueChange={(value) => handleChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded_year">Founded Year</Label>
              <Input
                id="founded_year"
                value={company.founded_year}
                onChange={(e) => handleChange('founded_year', e.target.value)}
                placeholder="2020"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID / EIN</Label>
              <Input
                id="tax_id"
                value={company.tax_id}
                onChange={(e) => handleChange('tax_id', e.target.value)}
                placeholder="12-3456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={company.registration_number}
                onChange={(e) => handleChange('registration_number', e.target.value)}
                placeholder="REG123456"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={company.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={company.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={company.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={company.country}
                onChange={(e) => handleChange('country', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={company.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={company.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={company.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@quickpos.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={company.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://quickpos.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            Company Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo_url">Company Logo URL</Label>
            <Input
              id="logo_url"
              value={company.logo_url}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
          {company.logo_url && (
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 border rounded-lg flex items-center justify-center">
                <img src={company.logo_url} alt="Company Logo" className="max-w-full max-h-full" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Logo Preview</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Company Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              value={company.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder="Brief description of your company..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mission">Mission Statement</Label>
            <Textarea
              id="mission"
              value={company.mission}
              onChange={(e) => handleChange('mission', e.target.value)}
              rows={2}
              placeholder="Your company's mission..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vision">Vision Statement</Label>
            <Textarea
              id="vision"
              value={company.vision}
              onChange={(e) => handleChange('vision', e.target.value)}
              rows={2}
              placeholder="Your company's vision..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
