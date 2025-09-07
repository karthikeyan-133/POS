import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  BarChart3,
  Receipt,
  Plus,
  Eye,
  TrendingDown
} from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  todaySales: number;
  totalProducts: number;
  lowStockProducts: number;
  totalUsers: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    todaySales: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total sales
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount');
      
      const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      // Fetch today's sales
      const today = new Date().toISOString().split('T')[0];
      const { data: todaysSalesData } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', today);
      
      const todaySales = todaysSalesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch low stock products
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('stock_quantity', 10)
        .eq('is_active', true);

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalSales,
        todaySales,
        totalProducts: productsCount || 0,
        lowStockProducts: lowStockCount || 0,
        totalUsers: usersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">QuickPOS Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Overview of your store performance and key metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-blue/10 to-vibrant-purple/10 hover:from-vibrant-blue/20 hover:to-vibrant-purple/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Total Revenue</CardTitle>
            <div className="p-2 bg-vibrant-blue/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-vibrant-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{formatCurrency(stats.totalSales)}</div>
            <p className="text-sm text-muted-foreground">
              Lifetime sales revenue
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-green/10 to-vibrant-teal/10 hover:from-vibrant-green/20 hover:to-vibrant-teal/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Today's Sales</CardTitle>
            <div className="p-2 bg-vibrant-green/10 rounded-lg">
              <Receipt className="h-5 w-5 text-vibrant-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{formatCurrency(stats.todaySales)}</div>
            <p className="text-sm text-muted-foreground">
              Sales made today
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-purple/10 to-vibrant-pink/10 hover:from-vibrant-purple/20 hover:to-vibrant-pink/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Total Products</CardTitle>
            <div className="p-2 bg-vibrant-purple/10 rounded-lg">
              <Package className="h-5 w-5 text-vibrant-purple" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.totalProducts}</div>
            <p className="text-sm text-muted-foreground">
              Active products in inventory
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-orange/10 to-vibrant-red/10 hover:from-vibrant-orange/20 hover:to-vibrant-red/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Low Stock Alert</CardTitle>
            <div className="p-2 bg-vibrant-orange/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-vibrant-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-vibrant-orange mb-1">{stats.lowStockProducts}</div>
            <p className="text-sm text-muted-foreground">
              Products running low
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 border border-border bg-white">
          <CardHeader className="bg-gradient-vibrant rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <div className="p-2 bg-white/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription className="text-base text-white/90">
              Common tasks and shortcuts for your daily operations
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 p-6">
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-vibrant-green/5 border border-vibrant-green/20 hover:bg-vibrant-green/10 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg flex items-center gap-3 text-vibrant-green-900">
                    <div className="p-2 bg-vibrant-green/10 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-vibrant-green" />
                    </div>
                    Start New Sale
                  </h3>
                  <Button variant="ghost" size="icon" className="text-vibrant-green hover:bg-vibrant-green/10">
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">Process customer transactions</p>
                <Button className="mt-4 w-full bg-vibrant-green hover:bg-vibrant-green/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
              </div>
              
              <div className="p-6 rounded-xl bg-vibrant-blue/5 border border-vibrant-blue/20 hover:bg-vibrant-blue/10 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg flex items-center gap-3 text-vibrant-blue-900">
                    <div className="p-2 bg-vibrant-blue/10 rounded-lg">
                      <Package className="h-5 w-5 text-vibrant-blue" />
                    </div>
                    Add Product
                  </h3>
                  <Button variant="ghost" size="icon" className="text-vibrant-blue hover:bg-vibrant-blue/10">
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">Add new products to inventory</p>
                <Button className="mt-4 w-full bg-vibrant-blue hover:bg-vibrant-blue/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-vibrant-purple/5 border border-vibrant-purple/20 hover:bg-vibrant-purple/10 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg flex items-center gap-3 text-vibrant-purple-900">
                    <div className="p-2 bg-vibrant-purple/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-vibrant-purple" />
                    </div>
                    View Reports
                  </h3>
                  <Button variant="ghost" size="icon" className="text-vibrant-purple hover:bg-vibrant-purple/10">
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">Analyze sales performance</p>
                <Button className="mt-4 w-full bg-vibrant-purple hover:bg-vibrant-purple/90 text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </div>
              
              <div className="p-6 rounded-xl bg-vibrant-orange/5 border border-vibrant-orange/20 hover:bg-vibrant-orange/10 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg flex items-center gap-3 text-vibrant-orange-900">
                    <div className="p-2 bg-vibrant-orange/10 rounded-lg">
                      <Users className="h-5 w-5 text-vibrant-orange" />
                    </div>
                    Manage Staff
                  </h3>
                  <Button variant="ghost" size="icon" className="text-vibrant-orange hover:bg-vibrant-orange/10">
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">Add or edit user accounts</p>
                <Button className="mt-4 w-full bg-vibrant-orange hover:bg-vibrant-orange/90 text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Staff
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-white">
          <CardHeader className="bg-gradient-warm rounded-t-lg">
            <CardTitle className="text-xl font-bold text-white">Recent Activity</CardTitle>
            <CardDescription className="text-base text-white/90">Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-vibrant-blue/5 hover:bg-vibrant-blue/10 transition-all duration-300 shadow-sm hover:shadow">
              <div className="h-12 w-12 rounded-full bg-vibrant-blue/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-vibrant-blue" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-vibrant-blue-900">Sale completed</p>
                <p className="text-sm text-muted-foreground">2 minutes ago</p>
              </div>
              <Badge variant="secondary" className="text-sm font-semibold bg-vibrant-blue/10 text-vibrant-blue">Product Badge</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-vibrant-green/5 hover:bg-vibrant-green/10 transition-all duration-300 shadow-sm hover:shadow">
              <div className="h-12 w-12 rounded-full bg-vibrant-green/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-vibrant-green" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-vibrant-green-900">Product added</p>
                <p className="text-sm text-muted-foreground">15 minutes ago</p>
              </div>
              <Badge variant="outline" className="text-sm font-semibold border-vibrant-green/20 text-vibrant-green">New</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-vibrant-orange/5 hover:bg-vibrant-orange/10 transition-all duration-300 shadow-sm hover:shadow">
              <div className="h-12 w-12 rounded-full bg-vibrant-orange/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-vibrant-orange" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-vibrant-orange-900">Low stock alert</p>
                <p className="text-sm text-muted-foreground">1 hour ago</p>
              </div>
              <Badge variant="destructive" className="text-sm font-semibold bg-vibrant-orange/10 text-vibrant-orange">Alert</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-vibrant-purple/5 hover:bg-vibrant-purple/10 transition-all duration-300 shadow-sm hover:shadow">
              <div className="h-12 w-12 rounded-full bg-vibrant-purple/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-vibrant-purple" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-vibrant-purple-900">Return processed</p>
                <p className="text-sm text-muted-foreground">3 hours ago</p>
              </div>
              <Badge variant="secondary" className="text-sm font-semibold bg-vibrant-purple/10 text-vibrant-purple">Return</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}