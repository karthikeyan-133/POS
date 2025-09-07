import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Package, Plus, Layers3, Percent, Ruler, Bookmark, Shapes, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Products() {
  const location = useLocation();
  const base = '/products';

  const links = [
    { to: `${base}`, label: 'List', icon: Package, end: true },
    { to: `${base}/add`, label: 'Add New', icon: Plus },
    { to: `${base}/categories`, label: 'Category', icon: Layers3 },
    { to: `${base}/tax`, label: 'Tax', icon: Percent },
    { to: `${base}/units`, label: 'Unit', icon: Ruler },
    { to: `${base}/brands`, label: 'Brand', icon: Bookmark },
    { to: `${base}/variants`, label: 'Variants', icon: Shapes },
    { to: `${base}/print-labels`, label: 'Print Labels', icon: Printer },
  ];

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">Products</h1>
        <p className="text-lg text-muted-foreground">Manage your product catalog and related settings</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end as any} className={({ isActive }) => cn(isActive ? '' : '')}>
              <Button 
                variant={location.pathname === to ? 'gradient' : 'outline'} 
                className="gap-2 hover:shadow-lg transition-all duration-300 border-vibrant-green/30"
              >
                <Icon className="h-4 w-4 text-vibrant-green" /> {label}
              </Button>
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
}