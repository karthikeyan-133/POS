import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Plus } from 'lucide-react';

export default function DamageStock() {
  const location = useLocation();
  const base = '/damage-stock';

  const links = [
    { to: `${base}`, label: 'List', icon: AlertTriangle, end: true },
    { to: `${base}/add`, label: 'Add New', icon: Plus },
  ];

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Damage Stock</h1>
        <p className="text-lg text-muted-foreground">Manage damaged inventory items</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end as any} className={({ isActive }) => cn(isActive ? '' : '')}>
              <Button 
                variant={location.pathname === to ? 'gradient' : 'outline'} 
                className="gap-2 hover:shadow-lg transition-all duration-300 border-vibrant-red/30"
              >
                <Icon className="h-4 w-4 text-vibrant-red" /> {label}
              </Button>
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
}