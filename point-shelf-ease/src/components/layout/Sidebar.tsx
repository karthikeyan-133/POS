import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Users, 
  Settings,
  Store,
  Receipt,
  TrendingUp,
  Truck,
  ShoppingCart,
  AlertTriangle,
  ArrowLeftRight,
  DollarSign,
  MessageSquare,
  Bell,
  Shield,
  Mail
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

// Define colorful variants for icons
const getIconVariant = (title: string) => {
  const variants: Record<string, string> = {
    'Dashboard': 'text-vibrant-blue',
    'Products': 'text-vibrant-green',
    'Suppliers': 'text-vibrant-purple',
    'Customers': 'text-vibrant-teal',
    'Purchase Requests': 'text-vibrant-orange',
    'Purchases': 'text-vibrant-blue',
    'Purchase Returns': 'text-vibrant-red',
    'Quotations': 'text-vibrant-pink',
    'Sales': 'text-vibrant-green',
    'Sales Returns': 'text-vibrant-yellow',
    'Damage Stock': 'text-vibrant-red',
    'Stock Transfer': 'text-vibrant-purple',
    'Expenses': 'text-vibrant-orange',
    'Inquiries': 'text-vibrant-blue',
    'Reminders': 'text-vibrant-teal',
    'Roles': 'text-vibrant-pink',
    'Email': 'text-vibrant-indigo',
    'Inventory': 'text-vibrant-green',
    'Reports': 'text-vibrant-purple',
    'Users': 'text-vibrant-blue',
    'Settings': 'text-vibrant-gray',
  };
  return variants[title] || 'text-sidebar-foreground';
};

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Products', url: '/products', icon: Package },
  { title: 'Suppliers', url: '/suppliers', icon: Truck },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Purchase Requests', url: '/purchase-requests', icon: Receipt },
  { title: 'Purchases', url: '/purchases', icon: ShoppingCart },
  { title: 'Purchase Returns', url: '/purchase-returns', icon: TrendingUp },
  { title: 'Quotations', url: '/quotations', icon: Receipt },
  { title: 'Sales', url: '/sales', icon: Receipt },
  { title: 'Sales Returns', url: '/sales-returns', icon: TrendingUp },
  { title: 'Damage Stock', url: '/damage-stock', icon: AlertTriangle },
  { title: 'Stock Transfer', url: '/stock-transfer', icon: ArrowLeftRight },
  { title: 'Expenses', url: '/expense', icon: DollarSign },
  { title: 'Inquiries', url: '/inquiry', icon: MessageSquare },
  { title: 'Reminders', url: '/reminder', icon: Bell },
  { title: 'Roles', url: '/roles', icon: Shield },
  { title: 'Email', url: '/email', icon: Mail },
  { title: 'Inventory', url: '/inventory', icon: Store },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Users', url: '/users', icon: Users },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "w-full justify-start transition-all duration-200",
      isActive 
        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
        : "text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground"
    );

  return (
    <Sidebar 
      className="transition-all duration-300 ease-in-out bg-sidebar border-r border-sidebar-border"
      collapsible="icon"
    >
      {/* Clickable rail to quickly expand/collapse on desktop */}
      <SidebarRail />
      <SidebarContent className="bg-sidebar">
        <div 
          className="flex items-center gap-2 px-6 py-4 border-b border-sidebar-border bg-sidebar"
        >
          <div 
            className="rounded-lg p-2 bg-gradient-primary shadow-md"
          >
            <Store className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground bg-gradient-primary bg-clip-text text-transparent">QuickPOS</h1>
              <p className="text-xs text-sidebar-foreground/70">Point of Sale</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-sidebar-foreground/80 font-semibold tracking-wide", collapsed ? "sr-only" : "")}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="bg-sidebar">
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                       className={({ isActive }) =>
                         cn(
                           "w-full justify-start transition-all duration-200 flex items-center gap-3 px-3 py-2 rounded-lg",
                           isActive 
                             ? "bg-gradient-primary text-white font-medium shadow-md" 
                             : "text-sidebar-foreground hover:bg-white/10"
                         )
                       }
                      onClick={() => { if (isMobile) setOpenMobile(false); }}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={cn("h-5 w-5", getIconVariant(item.title))} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}