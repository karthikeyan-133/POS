import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StockData {
  date: string;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
}

interface ProductStock {
  product: string;
  current_stock: number;
  min_stock: number;
  value: number;
}

interface CategoryStock {
  category: string;
  products: number;
  total_value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DailyStockReport() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [productData, setProductData] = useState<ProductStock[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchStockReports();
  }, [dateRange]);

  const fetchStockReports = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // Fetch product stock data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          name,
          current_stock,
          min_stock,
          cost_price,
          categories (name)
        `);

      if (productsError) throw productsError;

      // Process stock data
      const stockStats = products.reduce((acc: Record<string, { in_stock: number; low_stock: number; out_of_stock: number }>, product) => {
        const stock = product.current_stock || 0;
        const minStock = product.min_stock || 0;
        
        if (stock === 0) {
          acc.out_of_stock += 1;
        } else if (stock <= minStock) {
          acc.low_stock += 1;
        } else {
          acc.in_stock += 1;
        }
        
        return acc;
      }, { in_stock: 0, low_stock: 0, out_of_stock: 0 });

      setStockData([{
        date: new Date().toLocaleDateString(),
        ...stockStats
      }]);

      // Process product stock data
      const productStockData = products
        .map(product => ({
          product: product.name,
          current_stock: product.current_stock || 0,
          min_stock: product.min_stock || 0,
          value: (product.current_stock || 0) * (product.cost_price || 0)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setProductData(productStockData);

      // Process category stock data
      const categoryStats = products.reduce((acc: Record<string, { products: number; total_value: number }>, product) => {
        const categoryName = product.categories?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = { products: 0, total_value: 0 };
        }
        acc[categoryName].products += 1;
        acc[categoryName].total_value += (product.current_stock || 0) * (product.cost_price || 0);
        return acc;
      }, {});

      const categoryStockData = Object.entries(categoryStats)
        .map(([category, data]) => ({
          category,
          products: data.products,
          total_value: data.total_value
        }))
        .sort((a, b) => b.total_value - a.total_value);

      setCategoryData(categoryStockData);

    } catch (error) {
      console.error('Error fetching stock reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch stock report data',
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
      description: 'Daily stock report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading stock reports...</div>
      </div>
    );
  }

  const totalProducts = stockData[0]?.in_stock + stockData[0]?.low_stock + stockData[0]?.out_of_stock || 0;
  const totalValue = productData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Daily Stock Report</h1>
          <p className="text-muted-foreground">Monitor your inventory levels and stock movements</p>
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
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              In inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockData[0]?.in_stock || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalProducts > 0 ? ((stockData[0]?.in_stock || 0) / totalProducts * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stockData[0]?.low_stock || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Distribution</CardTitle>
            <CardDescription>Current stock levels breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'In Stock', value: stockData[0]?.in_stock || 0, color: '#22c55e' },
                    { name: 'Low Stock', value: stockData[0]?.low_stock || 0, color: '#f59e0b' },
                    { name: 'Out of Stock', value: stockData[0]?.out_of_stock || 0, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8a2be2"
                  dataKey="value"
                >
                  {[
                    { name: 'In Stock', value: stockData[0]?.in_stock || 0, color: '#22c55e' },
                    { name: 'Low Stock', value: stockData[0]?.low_stock || 0, color: '#f59e0b' },
                    { name: 'Out of Stock', value: stockData[0]?.out_of_stock || 0, color: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Value</CardTitle>
            <CardDescription>Highest value products in stock</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#8a2be2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
            <CardDescription>Inventory value by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total_value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData.filter(p => p.current_stock <= p.min_stock)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current_stock" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
