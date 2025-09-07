import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';

export default function AddNewRolePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/roles');
    } finally {
      setSubmitting(false);
    }
  };

  const permissionGroups = [
    {
      name: 'Core Modules',
      permissions: [
        { id: 'dashboard', label: 'Dashboard', description: 'Access to main dashboard' },
        { id: 'products', label: 'Products', description: 'Manage products and inventory' },
        { id: 'sales', label: 'Sales', description: 'Process sales and transactions' },
        { id: 'purchases', label: 'Purchases', description: 'Manage purchase orders' },
      ]
    },
    {
      name: 'Management',
      permissions: [
        { id: 'customers', label: 'Customers', description: 'Manage customer information' },
        { id: 'suppliers', label: 'Suppliers', description: 'Manage supplier information' },
        { id: 'inventory', label: 'Inventory', description: 'Inventory management' },
        { id: 'stock-transfer', label: 'Stock Transfer', description: 'Transfer stock between locations' },
      ]
    },
    {
      name: 'Reports & Analytics',
      permissions: [
        { id: 'reports', label: 'Reports', description: 'View and generate reports' },
        { id: 'analytics', label: 'Analytics', description: 'Access to analytics dashboard' },
      ]
    },
    {
      name: 'System Administration',
      permissions: [
        { id: 'users', label: 'Users', description: 'Manage user accounts' },
        { id: 'roles', label: 'Roles', description: 'Manage user roles and permissions' },
        { id: 'settings', label: 'Settings', description: 'System configuration' },
        { id: 'backup', label: 'Backup', description: 'System backup and restore' },
      ]
    },
    {
      name: 'Additional Features',
      permissions: [
        { id: 'expenses', label: 'Expenses', description: 'Manage business expenses' },
        { id: 'inquiries', label: 'Inquiries', description: 'Manage customer inquiries' },
        { id: 'reminders', label: 'Reminders', description: 'Manage system reminders' },
        { id: 'damage-stock', label: 'Damage Stock', description: 'Manage damaged inventory' },
      ]
    }
  ];

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">New Role</CardTitle>
        <CardDescription>Create a new user role with specific permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input 
                id="name" 
                value={form.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g., Store Manager"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isActive" 
                  checked={form.isActive} 
                  onCheckedChange={(checked) => handleChange('isActive', checked as boolean)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={form.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Describe the role and its responsibilities..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Permissions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {permissionGroups.map(group => (
                <div key={group.name} className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground border-b pb-1">
                    {group.name}
                  </h4>
                  <div className="space-y-2">
                    {group.permissions.map(permission => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.label)}
                          onCheckedChange={(checked) => handlePermissionChange(permission.label, checked as boolean)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor={permission.id} className="text-sm font-medium">
                            {permission.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-blue-800">
                Selected Permissions: {selectedPermissions.length}
              </div>
            </div>
            {selectedPermissions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedPermissions.map(permission => (
                  <span key={permission} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {permission}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/roles')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || selectedPermissions.length === 0}>
              {submitting ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
