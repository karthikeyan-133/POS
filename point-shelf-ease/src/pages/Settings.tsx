import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Settings, Building2, MapPin, Globe, HelpCircle, Flag, Map } from 'lucide-react';

export default function Settings() {
  const location = useLocation();
  const base = '/settings';

  const links = [
    { to: `${base}`, label: 'Store/Location', icon: MapPin, end: true },
    { to: `${base}/company`, label: 'Company Profile', icon: Building2 },
    { to: `${base}/language`, label: 'Language', icon: Globe },
    { to: `${base}/helper`, label: 'Page Helper', icon: HelpCircle },
    { to: `${base}/country`, label: 'Country', icon: Flag },
    { to: `${base}/city`, label: 'City', icon: Map },
  ];

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Settings</h1>
        <p className="text-lg text-muted-foreground">Configure your POS system preferences and settings</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end as any} className={({ isActive }) => cn(isActive ? '' : '')}>
              <Button 
                variant={location.pathname === to ? 'gradient' : 'outline'} 
                className="gap-2 hover:shadow-lg transition-all duration-300 border-vibrant-yellow/30"
              >
                <Icon className="h-4 w-4 text-vibrant-yellow" /> {label}
              </Button>
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
}