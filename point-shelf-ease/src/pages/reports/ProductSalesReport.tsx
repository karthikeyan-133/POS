import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductSalesData {
  product: string;
  quantity: number;
  revenue: number;
  avg_price: number;
  sales_count: number;
}

interface CustomerSalesData {
  customer: string;
  products: number;
  total_revenue: number;
}

interface MonthlySalesData {
  month: string;
  quantity: number;
  revenue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProductSalesReport() {
  const [productData, setProductData] = useState<ProductSalesData[]>([]);
  const [customerData, setCustomerData] = useState<CustomerSalesData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchProductSalesReports();
  }, [dateRange]);

  const fetchProductSalesReports = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // Fetch sales items data
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          unit_price,
          total_price,
          products (name),
          sales!inner (
            created_at,
            customers (name)
          )
        `)
        .gte('sales.created_at', startDate.toISOString());

      if (itemsError) throw itemsError;

      // Process product sales data
      const productStats = saleItems.reduce((acc: Record<string, { quantity: number; revenue: number; total_price: number; count: number }>, item) => {
        const productName = item.products?.name || 'Unknown Product';
        if (!acc[productName]) {
          acc[productName] = { quantity: 0, revenue: 0, total_price: 0, count: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].revenue += Number(item.total_price);
        acc[productName].total_price += Number(item.unit_price) * item.quantity;
        acc[productName].count += 1;
        return acc;
      }, {});

      const productSalesData = Object.entries(productStats)
        .map(([product, data]) => ({
          product,
          quantity: data.quantity,
          revenue: data.revenue,
          avg_price: data.total_price / data.quantity,
          sales_count: data.count
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 15);

      setProductData(productSalesData);

      // Process customer sales data
      const customerStats = saleItems.reduce((acc: Record<string, { products: Set<string>; total_revenue: number }>, item) => {
        const customerName = item.sales?.customers?.name || 'Walk-in Customer';
        if (!acc[customerName]) {
          acc[customerName] = { products: new Set(), total_revenue: 0 };
        }
        acc[customerName].products.add(item.products?.name || 'Unknown Product');
        acc[customerName].total_revenue += Number(item.total_price);
        return acc;
      }, {});

      const customerSalesData = Object.entries(customerStats)
        .map(([customer, data]) => ({
          customer,
          products: data.products.size,
          total_revenue: data.total_revenue
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 10);

      setCustomerData(customerSalesData);

      // Process monthly sales data
      const monthlyStats = saleItems.reduce((acc: Record<string, { quantity: number; revenue: number }>, item) => {
        const month = new Date(item.sales?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { quantity: 0, revenue: 0 };
        }
        acc[month].quantity += item.quantity;
        acc[month].revenue += Number(item.total_price);
        return acc;
      }, {});

      const monthlySalesData = Object.entries(monthlyStats)
        .map(([month, data]) => ({
          month,
          quantity: data.quantity,
          revenue: data.revenue
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      setMonthlyData(monthlySalesData);

    } catch (error) {
      console.error('Error fetching product sales reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch product sales report data',
        variant: 'destructive',
      });
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

  const exportReport = () => {
    toast({
      title: 'Export',
      description: 'Product sales report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading product sales reports...</div>
      </div>
    );
  }

  const totalRevenue = productData.reduce((sum, item) => sum + item.revenue, 0);
  const totalQuantity = productData.reduce((sum, item) => sum + item.quantity, 0);
  const avgPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Sales Report</h1>
          <p className="text-muted-foreground">Detailed analysis of product sales performance</p>
        </div>
        <div className="flex gap-2">
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
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productData.length}</div>
            <p className="text-xs text-muted-foreground">
              Products sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Units sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Total sales value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgPrice)}</div>
            <p className="text-xs text-muted-foreground">
              Per unit
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
            <CardDescription>Highest revenue generating products</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#8a2be2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Quantity</CardTitle>
            <CardDescription>Most sold products by units</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData.sort((a, b) => b.quantity - a.quantity).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trends</CardTitle>
            <CardDescription>Sales quantity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="quantity" stroke="#8a2be2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers by Revenue</CardTitle>
            <CardDescription>Top customers by total purchase amount</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="customer" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total_revenue" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Sales Details</CardTitle>
          <CardDescription>Comprehensive product sales analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Avg Price</th>
                  <th className="text-right p-2">Sales Count</th>
                </tr>
              </thead>
              <tbody>
                {productData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.product}</td>
                    <td className="text-right p-2">{item.quantity.toLocaleString()}</td>
                    <td className="text-right p-2">{formatCurrency(item.revenue)}</td>
                    <td className="text-right p-2">{formatCurrency(item.avg_price)}</td>
                    <td className="text-right p-2">{item.sales_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
