import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SalesData {
  date: string;
  sales: number;
  revenue: number;
}

interface CustomerSales {
  customer: string;
  sales: number;
  revenue: number;
}

interface ProductSales {
  product: string;
  quantity: number;
  revenue: number;
}

export default function SalesReport() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [customerData, setCustomerData] = useState<CustomerSales[]>([]);
  const [productData, setProductData] = useState<ProductSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesReports();
  }, [dateRange]);

  const fetchSalesReports = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // Fetch sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('created_at, total_amount')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      if (salesError) throw salesError;

      // Process sales data by date
      const salesByDate = sales.reduce((acc: Record<string, { sales: number; revenue: number }>, sale) => {
        const date = new Date(sale.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { sales: 0, revenue: 0 };
        }
        acc[date].sales += 1;
        acc[date].revenue += Number(sale.total_amount);
        return acc;
      }, {});

      const salesReportData = Object.entries(salesByDate).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(),
        sales: data.sales,
        revenue: data.revenue
      }));

      setSalesData(salesReportData);

      // Fetch customer sales data
      const { data: customerSales, error: customerError } = await supabase
        .from('sales')
        .select(`
          total_amount,
          customers (name),
          created_at
        `)
        .gte('created_at', startDate.toISOString());

      if (customerError) throw customerError;

      const customerStats = customerSales.reduce((acc: Record<string, { sales: number; revenue: number }>, sale) => {
        const customerName = sale.customers?.name || 'Walk-in Customer';
        if (!acc[customerName]) {
          acc[customerName] = { sales: 0, revenue: 0 };
        }
        acc[customerName].sales += 1;
        acc[customerName].revenue += Number(sale.total_amount);
        return acc;
      }, {});

      const customerReportData = Object.entries(customerStats)
        .map(([customer, data]) => ({
          customer,
          sales: data.sales,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setCustomerData(customerReportData);

      // Fetch product sales data
      const { data: productSales, error: productError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          total_price,
          products (name),
          sales!inner (created_at)
        `)
        .gte('sales.created_at', startDate.toISOString());

      if (productError) throw productError;

      const productStats = productSales.reduce((acc: Record<string, { quantity: number; revenue: number }>, item) => {
        const productName = item.products?.name || 'Unknown';
        if (!acc[productName]) {
          acc[productName] = { quantity: 0, revenue: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].revenue += Number(item.total_price);
        return acc;
      }, {});

      const productReportData = Object.entries(productStats)
        .map(([product, data]) => ({
          product,
          quantity: data.quantity,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setProductData(productReportData);

    } catch (error) {
      console.error('Error fetching sales reports:', error);
      toast({
        title: "Error",
        description: "Failed to load sales reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  const COLORS = ['#8a2be2', '#22c55e', '#3b82f6', '#ef4444', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1" style={{backgroundColor: '#fafbfc'}}>
      <div className="rounded-xl p-6 border-2" style={{backgroundColor: '#ffffff', borderColor: '#e2e8f0'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2" style={{color: '#1e293b'}}>Sales Report</h1>
            <p className="text-lg" style={{color: '#64748b'}}>Analyze your sales performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Last {dateRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Transactions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSale)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productData.reduce((sum, product) => sum + product.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Items sold
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
            <CardDescription>Revenue trends over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#8a2be2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Count</CardTitle>
            <CardDescription>Number of transactions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8a2be2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Revenue by customer</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="customer" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Revenue by product</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
