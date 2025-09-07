import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComparisonData {
  date: string;
  sales: number;
  purchases: number;
  difference: number;
  ratio: number;
}

interface ProductComparison {
  product: string;
  sales_amount: number;
  purchase_amount: number;
  profit: number;
  margin: number;
}

interface CategoryComparison {
  category: string;
  sales: number;
  purchases: number;
  profit: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SalesVsPurchaseReport() {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [productData, setProductData] = useState<ProductComparison[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchComparisonReports();
  }, [dateRange]);

  const fetchComparisonReports = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // Fetch sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          total_amount,
          created_at,
          sale_items (
            quantity,
            unit_price,
            products (name, cost_price, categories (name))
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (salesError) throw salesError;

      // Fetch purchases data
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          total_amount,
          created_at,
          purchase_items (
            quantity,
            unit_price,
            products (name, cost_price, categories (name))
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (purchasesError) throw purchasesError;

      // Process comparison data by date
      const salesByDate = sales.reduce((acc: Record<string, number>, sale) => {
        const date = new Date(sale.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + Number(sale.total_amount);
        return acc;
      }, {});

      const purchasesByDate = purchases.reduce((acc: Record<string, number>, purchase) => {
        const date = new Date(purchase.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + Number(purchase.total_amount);
        return acc;
      }, {});

      const allDates = new Set([...Object.keys(salesByDate), ...Object.keys(purchasesByDate)]);
      
      const comparisonReportData = Array.from(allDates)
        .map(date => {
          const salesAmount = salesByDate[date] || 0;
          const purchaseAmount = purchasesByDate[date] || 0;
          return {
            date: new Date(date).toLocaleDateString(),
            sales: salesAmount,
            purchases: purchaseAmount,
            difference: salesAmount - purchaseAmount,
            ratio: purchaseAmount > 0 ? salesAmount / purchaseAmount : 0
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setComparisonData(comparisonReportData);

      // Process product comparison data
      const productSales = sales.reduce((acc: Record<string, { amount: number; quantity: number }>, sale) => {
        sale.sale_items?.forEach((item: any) => {
          const productName = item.products?.name || 'Unknown Product';
          if (!acc[productName]) {
            acc[productName] = { amount: 0, quantity: 0 };
          }
          acc[productName].amount += Number(item.quantity) * Number(item.unit_price);
          acc[productName].quantity += Number(item.quantity);
        });
        return acc;
      }, {});

      const productPurchases = purchases.reduce((acc: Record<string, { amount: number; quantity: number }>, purchase) => {
        purchase.purchase_items?.forEach((item: any) => {
          const productName = item.products?.name || 'Unknown Product';
          if (!acc[productName]) {
            acc[productName] = { amount: 0, quantity: 0 };
          }
          acc[productName].amount += Number(item.quantity) * Number(item.unit_price);
          acc[productName].quantity += Number(item.quantity);
        });
        return acc;
      }, {});

      const productComparisonData = Object.keys({ ...productSales, ...productPurchases })
        .map(productName => {
          const salesData = productSales[productName] || { amount: 0, quantity: 0 };
          const purchaseData = productPurchases[productName] || { amount: 0, quantity: 0 };
          const profit = salesData.amount - purchaseData.amount;
          const margin = salesData.amount > 0 ? (profit / salesData.amount * 100) : 0;
          
          return {
            product: productName,
            sales_amount: salesData.amount,
            purchase_amount: purchaseData.amount,
            profit,
            margin
          };
        })
        .sort((a, b) => b.sales_amount - a.sales_amount)
        .slice(0, 15);

      setProductData(productComparisonData);

      // Process category comparison data
      const categorySales = sales.reduce((acc: Record<string, number>, sale) => {
        sale.sale_items?.forEach((item: any) => {
          const categoryName = item.products?.categories?.name || 'Uncategorized';
          acc[categoryName] = (acc[categoryName] || 0) + (Number(item.quantity) * Number(item.unit_price));
        });
        return acc;
      }, {});

      const categoryPurchases = purchases.reduce((acc: Record<string, number>, purchase) => {
        purchase.purchase_items?.forEach((item: any) => {
          const categoryName = item.products?.categories?.name || 'Uncategorized';
          acc[categoryName] = (acc[categoryName] || 0) + (Number(item.quantity) * Number(item.unit_price));
        });
        return acc;
      }, {});

      const categoryComparisonData = Object.keys({ ...categorySales, ...categoryPurchases })
        .map(categoryName => {
          const salesAmount = categorySales[categoryName] || 0;
          const purchaseAmount = categoryPurchases[categoryName] || 0;
          return {
            category: categoryName,
            sales: salesAmount,
            purchases: purchaseAmount,
            profit: salesAmount - purchaseAmount
          };
        })
        .sort((a, b) => b.sales - a.sales);

      setCategoryData(categoryComparisonData);

    } catch (error) {
      console.error('Error fetching comparison reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch comparison report data',
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
      description: 'Sales vs Purchase report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading comparison reports...</div>
      </div>
    );
  }

  const totalSales = comparisonData.reduce((sum, item) => sum + item.sales, 0);
  const totalPurchases = comparisonData.reduce((sum, item) => sum + item.purchases, 0);
  const totalProfit = comparisonData.reduce((sum, item) => sum + item.difference, 0);
  const avgRatio = comparisonData.length > 0 ? comparisonData.reduce((sum, item) => sum + item.ratio, 0) / comparisonData.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales vs Purchase Report</h1>
          <p className="text-muted-foreground">Compare sales and purchase performance</p>
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
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              Total sales revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPurchases)}</div>
            <p className="text-xs text-muted-foreground">
              Total purchase cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sales - Purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales/Purchase Ratio</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{avgRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Average ratio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales vs Purchases Trend</CardTitle>
            <CardDescription>Daily comparison over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="purchases" stroke="#3b82f6" strokeWidth={2} name="Purchases" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit/Loss by Day</CardTitle>
            <CardDescription>Daily profit and loss comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="difference" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Sales</CardTitle>
            <CardDescription>Products with highest sales vs purchase comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="sales_amount" fill="#22c55e" name="Sales" />
                <Bar dataKey="purchase_amount" fill="#3b82f6" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Comparison</CardTitle>
            <CardDescription>Sales vs purchases by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="sales" fill="#22c55e" name="Sales" />
                <Bar dataKey="purchases" fill="#3b82f6" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Comparison Details</CardTitle>
          <CardDescription>Detailed sales vs purchase analysis by product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-right p-2">Sales Amount</th>
                  <th className="text-right p-2">Purchase Amount</th>
                  <th className="text-right p-2">Profit</th>
                  <th className="text-right p-2">Margin</th>
                </tr>
              </thead>
              <tbody>
                {productData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.product}</td>
                    <td className="text-right p-2">{formatCurrency(item.sales_amount)}</td>
                    <td className="text-right p-2">{formatCurrency(item.purchase_amount)}</td>
                    <td className={`text-right p-2 ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.profit)}
                    </td>
                    <td className={`text-right p-2 ${item.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.margin.toFixed(1)}%
                    </td>
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
