import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Plus, Edit, Trash2, Users, Search, Settings } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const SAMPLE_PERMISSIONS: Permission[] = [
  // Sales permissions
  { id: 'sales_view', name: 'View Sales', description: 'View sales records', category: 'Sales' },
  { id: 'sales_create', name: 'Create Sales', description: 'Create new sales', category: 'Sales' },
  { id: 'sales_edit', name: 'Edit Sales', description: 'Edit existing sales', category: 'Sales' },
  { id: 'sales_delete', name: 'Delete Sales', description: 'Delete sales records', category: 'Sales' },
  
  // Inventory permissions
  { id: 'inventory_view', name: 'View Inventory', description: 'View inventory items', category: 'Inventory' },
  { id: 'inventory_create', name: 'Create Inventory', description: 'Add new inventory items', category: 'Inventory' },
  { id: 'inventory_edit', name: 'Edit Inventory', description: 'Edit inventory items', category: 'Inventory' },
  { id: 'inventory_delete', name: 'Delete Inventory', description: 'Delete inventory items', category: 'Inventory' },
  
  // User management permissions
  { id: 'users_view', name: 'View Users', description: 'View user accounts', category: 'Users' },
  { id: 'users_create', name: 'Create Users', description: 'Create new user accounts', category: 'Users' },
  { id: 'users_edit', name: 'Edit Users', description: 'Edit user accounts', category: 'Users' },
  { id: 'users_delete', name: 'Delete Users', description: 'Delete user accounts', category: 'Users' },
  
  // Reports permissions
  { id: 'reports_view', name: 'View Reports', description: 'View system reports', category: 'Reports' },
  { id: 'reports_export', name: 'Export Reports', description: 'Export reports to files', category: 'Reports' },
  
  // Settings permissions
  { id: 'settings_view', name: 'View Settings', description: 'View system settings', category: 'Settings' },
  { id: 'settings_edit', name: 'Edit Settings', description: 'Modify system settings', category: 'Settings' },
];

const SAMPLE_ROLES: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access with all permissions',
    permissions: SAMPLE_PERMISSIONS.map(p => p.id),
    user_count: 2,
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Management level access with most permissions',
    permissions: ['sales_view', 'sales_create', 'sales_edit', 'inventory_view', 'inventory_create', 'inventory_edit', 'users_view', 'reports_view', 'reports_export', 'settings_view'],
    user_count: 3,
    created_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'Cashier',
    description: 'Basic sales and inventory access',
    permissions: ['sales_view', 'sales_create', 'inventory_view'],
    user_count: 5,
    created_at: '2024-01-01'
  },
  {
    id: '4',
    name: 'Supervisor',
    description: 'Supervisory access with limited management',
    permissions: ['sales_view', 'sales_create', 'sales_edit', 'inventory_view', 'inventory_create', 'reports_view'],
    user_count: 2,
    created_at: '2024-01-01'
  }
];

export default function UserRolePage() {
  const [roles, setRoles] = useState<Role[]>(SAMPLE_ROLES);
  const [permissions] = useState<Permission[]>(SAMPLE_PERMISSIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [query, setQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        // Update existing role
        const updatedRoles = roles.map(role => 
          role.id === editingRole.id 
            ? { ...role, ...formData }
            : role
        );
        setRoles(updatedRoles);
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      } else {
        // Create new role
        const newRole: Role = {
          id: Date.now().toString(),
          ...formData,
          user_count: 0,
          created_at: new Date().toISOString()
        };
        setRoles([...roles, newRole]);
        toast({
          title: "Success",
          description: "Role created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: "Error",
        description: "Failed to save role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const roleToDelete = roles.find(r => r.id === roleId);
      if (roleToDelete && roleToDelete.user_count > 0) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete role that has assigned users",
          variant: "destructive",
        });
        return;
      }

      setRoles(roles.filter(role => role.id !== roleId));
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', permissions: [] });
    setEditingRole(null);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setDialogOpen(true);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permissionId)
      }));
    }
  };

  const getPermissionCategory = (category: string) => {
    const categoryColors = {
      'Sales': 'bg-blue-100 text-blue-800',
      'Inventory': 'bg-green-100 text-green-800',
      'Users': 'bg-purple-100 text-purple-800',
      'Reports': 'bg-orange-100 text-orange-800',
      'Settings': 'bg-red-100 text-red-800'
    };
    return categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(query.toLowerCase()) ||
    role.description.toLowerCase().includes(query.toLowerCase())
  );

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Total Roles</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{roles.length}</div>
            <p className="text-sm text-gray-600">
              Defined user roles
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Total Permissions</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <Settings className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{permissions.length}</div>
            <p className="text-sm text-gray-600">
              Available permissions
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Active Users</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {roles.reduce((sum, role) => sum + role.user_count, 0)}
            </div>
            <p className="text-sm text-gray-600">
              Users with roles assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            User Roles
          </CardTitle>
          <CardDescription>Manage user roles and their permissions</CardDescription>
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search roles..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="pl-10 w-80" 
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="hover:shadow-lg transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter role name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter role description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="font-semibold text-sm text-foreground">{category}</h4>
                          <div className="space-y-2">
                            {categoryPermissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission.id}
                                  checked={formData.permissions.includes(permission.id)}
                                  onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                                />
                                <Label htmlFor={permission.id} className="text-sm">
                                  {permission.name}
                                  <span className="text-muted-foreground ml-1">- {permission.description}</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingRole ? 'Update Role' : 'Create Role'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="font-medium">{role.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{role.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map(permissionId => {
                        const permission = permissions.find(p => p.id === permissionId);
                        return permission ? (
                          <Badge key={permissionId} className={getPermissionCategory(permission.category)}>
                            {permission.name}
                          </Badge>
                        ) : null;
                      })}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.user_count} users</Badge>
                  </TableCell>
                  <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.user_count > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredRoles.length === 0 && (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No roles found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {query ? 'No roles match your search criteria.' : 'Create your first role to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
