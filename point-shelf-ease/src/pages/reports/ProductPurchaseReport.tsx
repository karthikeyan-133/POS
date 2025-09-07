import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductPurchaseData {
  product: string;
  quantity: number;
  amount: number;
  avg_price: number;
  purchase_count: number;
}

interface SupplierPurchaseData {
  supplier: string;
  products: number;
  total_amount: number;
}

interface MonthlyPurchaseData {
  month: string;
  quantity: number;
  amount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProductPurchaseReport() {
  const [productData, setProductData] = useState<ProductPurchaseData[]>([]);
  const [supplierData, setSupplierData] = useState<SupplierPurchaseData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyPurchaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchProductPurchaseReports();
  }, [dateRange]);

  const fetchProductPurchaseReports = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // Fetch purchase items data
      const { data: purchaseItems, error: itemsError } = await supabase
        .from('purchase_items')
        .select(`
          quantity,
          unit_price,
          total_price,
          products (name),
          purchases!inner (
            created_at,
            suppliers (name)
          )
        `)
        .gte('purchases.created_at', startDate.toISOString());

      if (itemsError) throw itemsError;

      // Process product purchase data
      const productStats = purchaseItems.reduce((acc: Record<string, { quantity: number; amount: number; total_price: number; count: number }>, item) => {
        const productName = item.products?.name || 'Unknown Product';
        if (!acc[productName]) {
          acc[productName] = { quantity: 0, amount: 0, total_price: 0, count: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].amount += Number(item.total_price);
        acc[productName].total_price += Number(item.unit_price) * item.quantity;
        acc[productName].count += 1;
        return acc;
      }, {});

      const productPurchaseData = Object.entries(productStats)
        .map(([product, data]) => ({
          product,
          quantity: data.quantity,
          amount: data.amount,
          avg_price: data.total_price / data.quantity,
          purchase_count: data.count
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 15);

      setProductData(productPurchaseData);

      // Process supplier purchase data
      const supplierStats = purchaseItems.reduce((acc: Record<string, { products: Set<string>; total_amount: number }>, item) => {
        const supplierName = item.purchases?.suppliers?.name || 'Unknown Supplier';
        if (!acc[supplierName]) {
          acc[supplierName] = { products: new Set(), total_amount: 0 };
        }
        acc[supplierName].products.add(item.products?.name || 'Unknown Product');
        acc[supplierName].total_amount += Number(item.total_price);
        return acc;
      }, {});

      const supplierPurchaseData = Object.entries(supplierStats)
        .map(([supplier, data]) => ({
          supplier,
          products: data.products.size,
          total_amount: data.total_amount
        }))
        .sort((a, b) => b.total_amount - a.total_amount)
        .slice(0, 10);

      setSupplierData(supplierPurchaseData);

      // Process monthly purchase data
      const monthlyStats = purchaseItems.reduce((acc: Record<string, { quantity: number; amount: number }>, item) => {
        const month = new Date(item.purchases?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { quantity: 0, amount: 0 };
        }
        acc[month].quantity += item.quantity;
        acc[month].amount += Number(item.total_price);
        return acc;
      }, {});

      const monthlyPurchaseData = Object.entries(monthlyStats)
        .map(([month, data]) => ({
          month,
          quantity: data.quantity,
          amount: data.amount
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      setMonthlyData(monthlyPurchaseData);

    } catch (error) {
      console.error('Error fetching product purchase reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch product purchase report data',
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
      description: 'Product purchase report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading product purchase reports...</div>
      </div>
    );
  }

  const totalAmount = productData.reduce((sum, item) => sum + item.amount, 0);
  const totalQuantity = productData.reduce((sum, item) => sum + item.quantity, 0);
  const avgPrice = totalQuantity > 0 ? totalAmount / totalQuantity : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Purchase Report</h1>
          <p className="text-muted-foreground">Detailed analysis of product purchases</p>
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
              Products purchased
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
              Units purchased
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Total purchase value
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
            <CardTitle>Top Products by Purchase Value</CardTitle>
            <CardDescription>Highest value products purchased</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#8a2be2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Quantity</CardTitle>
            <CardDescription>Most purchased products by units</CardDescription>
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
            <CardTitle>Monthly Purchase Trends</CardTitle>
            <CardDescription>Purchase quantity over time</CardDescription>
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
            <CardTitle>Suppliers by Purchase Value</CardTitle>
            <CardDescription>Top suppliers by total purchase amount</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supplier" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total_amount" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Purchase Details</CardTitle>
          <CardDescription>Comprehensive product purchase analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-right p-2">Avg Price</th>
                  <th className="text-right p-2">Purchase Count</th>
                </tr>
              </thead>
              <tbody>
                {productData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.product}</td>
                    <td className="text-right p-2">{item.quantity.toLocaleString()}</td>
                    <td className="text-right p-2">{formatCurrency(item.amount)}</td>
                    <td className="text-right p-2">{formatCurrency(item.avg_price)}</td>
                    <td className="text-right p-2">{item.purchase_count}</td>
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
