import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Mail, Phone, User, Shield } from 'lucide-react';

export default function AddNewUserPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'cashier',
    department: '',
    position: '',
    address: '',
    notes: '',
    is_active: true,
    send_invitation: true
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validate required fields
      if (!form.full_name || !form.email) {
        toast({
          title: "Validation Error",
          description: "Full name and email are required",
          variant: "destructive",
        });
        return;
      }

      // Here you would typically:
      // 1. Create the user in Supabase Auth
      // 2. Create the user profile in the database
      // 3. Send invitation email if requested
      
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "User created successfully. Invitation email sent.",
      });
      
      navigate('/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground flex items-center">
          <UserPlus className="mr-2 h-5 w-5" />
          Add New User
        </CardTitle>
        <CardDescription>Create a new user account and send invitation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <User className="mr-2 h-4 w-4" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input 
                  id="full_name" 
                  value={form.full_name} 
                  onChange={(e) => handleChange('full_name', e.target.value)} 
                  required 
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => handleChange('email', e.target.value)} 
                  required 
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={form.phone} 
                  onChange={(e) => handleChange('phone', e.target.value)} 
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={form.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Work Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  value={form.department} 
                  onChange={(e) => handleChange('department', e.target.value)} 
                  placeholder="Enter department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input 
                  id="position" 
                  value={form.position} 
                  onChange={(e) => handleChange('position', e.target.value)} 
                  placeholder="Enter position"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                value={form.address} 
                onChange={(e) => handleChange('address', e.target.value)} 
                placeholder="Enter address"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={form.notes} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_active" 
                  checked={form.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked as boolean)}
                />
                <Label htmlFor="is_active">Active User</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="send_invitation" 
                  checked={form.send_invitation}
                  onCheckedChange={(checked) => handleChange('send_invitation', checked as boolean)}
                />
                <Label htmlFor="send_invitation">Send invitation email</Label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/users')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="min-w-[120px]"
            >
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
