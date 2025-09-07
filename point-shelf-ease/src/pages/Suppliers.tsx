import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UsersRound, Plus } from 'lucide-react';

export default function Suppliers() {
  const location = useLocation();
  const base = '/suppliers';

  const links = [
    { to: `${base}`, label: 'List', icon: UsersRound, end: true },
    { to: `${base}/add`, label: 'Add New', icon: Plus },
  ];

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">Suppliers</h1>
        <p className="text-lg text-muted-foreground">Manage your suppliers</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end as any} className={({ isActive }) => cn(isActive ? '' : '')}>
              <Button 
                variant={location.pathname === to ? 'gradient' : 'outline'} 
                className="gap-2 hover:shadow-lg transition-all duration-300 border-vibrant-purple/30"
              >
                <Icon className="h-4 w-4 text-vibrant-purple" /> {label}
              </Button>
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
}