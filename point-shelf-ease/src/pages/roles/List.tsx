import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

const SAMPLE: Role[] = [
  { 
    id: 'role1', 
    name: 'Administrator', 
    description: 'Full system access with all permissions',
    permissions: ['Dashboard', 'Products', 'Sales', 'Purchases', 'Reports', 'Users', 'Settings'],
    userCount: 2,
    isActive: true,
    createdAt: '2025-01-01',
    lastUpdated: '2025-02-01'
  },
  { 
    id: 'role2', 
    name: 'Manager', 
    description: 'Store management with limited admin access',
    permissions: ['Dashboard', 'Products', 'Sales', 'Purchases', 'Reports'],
    userCount: 5,
    isActive: true,
    createdAt: '2025-01-02',
    lastUpdated: '2025-02-02'
  },
  { 
    id: 'role3', 
    name: 'Cashier', 
    description: 'Basic sales and customer service operations',
    permissions: ['Dashboard', 'Sales', 'Customers'],
    userCount: 8,
    isActive: true,
    createdAt: '2025-01-03',
    lastUpdated: '2025-02-03'
  },
  { 
    id: 'role4', 
    name: 'Inventory Clerk', 
    description: 'Product and inventory management',
    permissions: ['Dashboard', 'Products', 'Inventory', 'Stock Transfer'],
    userCount: 3,
    isActive: true,
    createdAt: '2025-01-04',
    lastUpdated: '2025-02-04'
  },
  { 
    id: 'role5', 
    name: 'Viewer', 
    description: 'Read-only access to reports and dashboards',
    permissions: ['Dashboard', 'Reports'],
    userCount: 4,
    isActive: false,
    createdAt: '2025-01-05',
    lastUpdated: '2025-02-05'
  },
];

export default function RolesListPage() {
  const [query, setQuery] = useState('');
  const [items] = useState<Role[]>(SAMPLE);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.permissions.some(p => p.toLowerCase().includes(q))
    );
  }, [query, items]);

  const getPermissionColor = (permission: string) => {
    const colorMap: { [key: string]: string } = {
      'Dashboard': 'default',
      'Products': 'secondary',
      'Sales': 'default',
      'Purchases': 'secondary',
      'Reports': 'outline',
      'Users': 'default',
      'Settings': 'secondary',
      'Customers': 'outline',
      'Inventory': 'default',
      'Stock Transfer': 'secondary'
    };
    return colorMap[permission] || 'outline';
  };

  const totalRoles = filtered.length;
  const activeRoles = filtered.filter(i => i.isActive).length;
  const totalUsers = filtered.reduce((sum, role) => sum + role.userCount, 0);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">Roles</CardTitle>
        <CardDescription>All user roles and their permissions</CardDescription>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by role name, description, or permissions..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalRoles}</div>
            <div className="text-sm text-blue-600">Total Roles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeRoles}</div>
            <div className="text-sm text-green-600">Active Roles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalUsers}</div>
            <div className="text-sm text-purple-600">Total Users</div>
          </div>
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
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell className="max-w-xs truncate" title={i.description}>
                  {i.description}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {i.permissions.slice(0, 3).map(permission => (
                      <Badge key={permission} variant={getPermissionColor(permission) as any} className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                    {i.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{i.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-blue-600">{i.userCount}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={i.isActive ? 'default' : 'secondary'}>
                    {i.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{i.createdAt}</TableCell>
                <TableCell>{i.lastUpdated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
