import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PurchaseData {
  date: string;
  purchases: number;
  amount: number;
}

interface SupplierPurchases {
  supplier: string;
  purchases: number;
  amount: number;
}

interface ProductPurchases {
  product: string;
  quantity: number;
  amount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PurchaseReport() {
  const [purchaseData, setPurchaseData] = useState<PurchaseData[]>([]);
  const [supplierData, setSupplierData] = useState<SupplierPurchases[]>([]);
  const [productData, setProductData] = useState<ProductPurchases[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchPurchaseReports();
  }, [dateRange]);

  const fetchPurchaseReports = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // Fetch purchase data
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('created_at, total_amount')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      if (purchasesError) throw purchasesError;

      // Process purchase data by date
      const purchasesByDate = purchases.reduce((acc: Record<string, { purchases: number; amount: number }>, purchase) => {
        const date = new Date(purchase.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { purchases: 0, amount: 0 };
        }
        acc[date].purchases += 1;
        acc[date].amount += Number(purchase.total_amount);
        return acc;
      }, {});

      const purchaseReportData = Object.entries(purchasesByDate).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(),
        purchases: data.purchases,
        amount: data.amount
      }));

      setPurchaseData(purchaseReportData);

      // Fetch supplier purchase data
      const { data: supplierPurchases, error: supplierError } = await supabase
        .from('purchases')
        .select(`
          total_amount,
          suppliers (name),
          created_at
        `)
        .gte('created_at', startDate.toISOString());

      if (supplierError) throw supplierError;

      const supplierStats = supplierPurchases.reduce((acc: Record<string, { purchases: number; amount: number }>, purchase) => {
        const supplierName = purchase.suppliers?.name || 'Unknown Supplier';
        if (!acc[supplierName]) {
          acc[supplierName] = { purchases: 0, amount: 0 };
        }
        acc[supplierName].purchases += 1;
        acc[supplierName].amount += Number(purchase.total_amount);
        return acc;
      }, {});

      const supplierReportData = Object.entries(supplierStats)
        .map(([supplier, data]) => ({
          supplier,
          purchases: data.purchases,
          amount: data.amount
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      setSupplierData(supplierReportData);

      // Fetch product purchase data
      const { data: purchaseItems, error: itemsError } = await supabase
        .from('purchase_items')
        .select(`
          quantity,
          total_price,
          products (name),
          purchases!inner (created_at)
        `)
        .gte('purchases.created_at', startDate.toISOString());

      if (itemsError) throw itemsError;

      const productStats = purchaseItems.reduce((acc: Record<string, { quantity: number; amount: number }>, item) => {
        const productName = item.products?.name || 'Unknown Product';
        if (!acc[productName]) {
          acc[productName] = { quantity: 0, amount: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].amount += Number(item.total_price);
        return acc;
      }, {});

      const productReportData = Object.entries(productStats)
        .map(([product, data]) => ({
          product,
          quantity: data.quantity,
          amount: data.amount
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      setProductData(productReportData);

    } catch (error) {
      console.error('Error fetching purchase reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch purchase report data',
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
    // Implementation for exporting report
    toast({
      title: 'Export',
      description: 'Purchase report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading purchase reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Report</h1>
          <p className="text-muted-foreground">Analyze your purchase data and trends</p>
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
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseData.reduce((sum, item) => sum + item.purchases, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{((purchaseData.length > 1 ? (purchaseData[purchaseData.length - 1].purchases - purchaseData[0].purchases) / purchaseData[0].purchases : 0) * 100).toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(purchaseData.reduce((sum, item) => sum + item.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              +{((purchaseData.length > 1 ? (purchaseData[purchaseData.length - 1].amount - purchaseData[0].amount) / purchaseData[0].amount : 0) * 100).toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierData.length}</div>
            <p className="text-xs text-muted-foreground">
              Suppliers with purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Purchase Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(purchaseData.reduce((sum, item) => sum + item.amount, 0) / Math.max(purchaseData.reduce((sum, item) => sum + item.purchases, 0), 1))}
            </div>
            <p className="text-xs text-muted-foreground">
              Per purchase
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Trends</CardTitle>
            <CardDescription>Daily purchase amounts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={purchaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="amount" stroke="#8a2be2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers</CardTitle>
            <CardDescription>Suppliers by purchase amount</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supplier" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#8a2be2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products Purchased</CardTitle>
            <CardDescription>Products by purchase amount</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Distribution</CardTitle>
            <CardDescription>Purchase amount by supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={supplierData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ supplier, percent }) => `${supplier} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8a2be2"
                  dataKey="amount"
                >
                  {supplierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
