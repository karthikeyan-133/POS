import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp, DollarSign, Package, Users, FileText, ShoppingCart, Warehouse, Calculator, Receipt, Building, CreditCard, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Import all report components
import PurchaseReport from './reports/PurchaseReport';
import SalesReport from './reports/SalesReport';
import DailyStockReport from './reports/DailyStockReport';
import ProductPurchaseReport from './reports/ProductPurchaseReport';
import ProductSalesReport from './reports/ProductSalesReport';
import StockReport from './reports/StockReport';
import PurchasePaymentReport from './reports/PurchasePaymentReport';
import SalesPaymentReport from './reports/SalesPaymentReport';
import ExpenseReport from './reports/ExpenseReport';
import ProfitLossReport from './reports/ProfitLossReport';
import SalesVsPurchaseReport from './reports/SalesVsPurchaseReport';
import SupplierPaymentReport from './reports/SupplierPaymentReport';
import CustomerPaymentReport from './reports/CustomerPaymentReport';
import InputTaxReport from './reports/InputTaxReport';
import OutputTaxReport from './reports/OutputTaxReport';
import ExpenseTaxReport from './reports/ExpenseTaxReport';

interface SalesReportData {
  date: string;
  sales: number;
  revenue: number;
}

interface ProductReportData {
  name: string;
  quantity_sold: number;
  revenue: number;
}

interface CategoryReportData {
  category: string;
  sales: number;
  revenue: number;
}

export default function Reports() {
  const [activeReport, setActiveReport] = useState<string>('overview');
  const [salesData, setSalesData] = useState<SalesReportData[]>([]);
  const [productData, setProductData] = useState<ProductReportData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // days
  const { toast } = useToast();

  const reportsList = [
    { key: 'overview', name: 'Overview', icon: TrendingUp, component: null },
    { key: 'purchase', name: 'Purchase Report', icon: ShoppingCart, component: PurchaseReport },
    { key: 'sales', name: 'Sales Report', icon: TrendingUp, component: SalesReport },
    { key: 'daily-stock', name: 'Daily Stock Report', icon: Warehouse, component: DailyStockReport },
    { key: 'product-purchase', name: 'Product Purchase Report', icon: Package, component: ProductPurchaseReport },
    { key: 'product-sales', name: 'Product Sales Report', icon: Package, component: ProductSalesReport },
    { key: 'stock', name: 'Stock Report', icon: Warehouse, component: StockReport },
    { key: 'purchase-payment', name: 'Purchase Payment Report', icon: CreditCard, component: PurchasePaymentReport },
    { key: 'sales-payment', name: 'Sales Payment Report', icon: CreditCard, component: SalesPaymentReport },
    { key: 'expense', name: 'Expense Report', icon: Receipt, component: ExpenseReport },
    { key: 'profit-loss', name: 'Profit & Loss Report', icon: Calculator, component: ProfitLossReport },
    { key: 'sales-vs-purchase', name: 'Sales vs Purchase', icon: TrendingUp, component: SalesVsPurchaseReport },
    { key: 'supplier-payment', name: 'Supplier Payment Report', icon: Building, component: SupplierPaymentReport },
    { key: 'customer-payment', name: 'Customer Payment Report', icon: Users, component: CustomerPaymentReport },
    { key: 'input-tax', name: 'Input Tax Report', icon: FileText, component: InputTaxReport },
    { key: 'output-tax', name: 'Output Tax Report', icon: FileText, component: OutputTaxReport },
    { key: 'expense-tax', name: 'Expense Tax Report', icon: FileText, component: ExpenseTaxReport },
  ];

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
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

      // Fetch product sales data
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          total_price,
          products (name),
          sales!inner (created_at)
        `)
        .gte('sales.created_at', startDate.toISOString());

      if (itemsError) throw itemsError;

      // Process product data
      const productSales = saleItems.reduce((acc: Record<string, { quantity: number; revenue: number }>, item) => {
        const productName = item.products?.name || 'Unknown';
        if (!acc[productName]) {
          acc[productName] = { quantity: 0, revenue: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].revenue += Number(item.total_price);
        return acc;
      }, {});

      const productReportData = Object.entries(productSales)
        .map(([name, data]) => ({
          name,
          quantity_sold: data.quantity,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setProductData(productReportData);

      // Fetch category data
      const { data: categoryItems, error: categoryError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          total_price,
          products!inner (
            categories (name)
          ),
          sales!inner (created_at)
        `)
        .gte('sales.created_at', startDate.toISOString());

      if (categoryError) throw categoryError;

      // Process category data
      const categorySales = categoryItems.reduce((acc: Record<string, { sales: number; revenue: number }>, item) => {
        const categoryName = item.products?.categories?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = { sales: 0, revenue: 0 };
        }
        acc[categoryName].sales += item.quantity;
        acc[categoryName].revenue += Number(item.total_price);
        return acc;
      }, {});

      const categoryReportData = Object.entries(categorySales).map(([category, data]) => ({
        category,
        sales: data.sales,
        revenue: data.revenue
      }));

      setCategoryData(categoryReportData);

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">Reports & Analytics</h1>
            <p className="text-lg text-muted-foreground">Comprehensive business insights and performance metrics</p>
          </div>
          <Button variant="gradient" className="gap-2 hover:shadow-lg transition-all duration-300">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeReport} onValueChange={setActiveReport} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 bg-white p-1 rounded-lg border border-border">
          {reportsList.map((report) => {
            const Icon = report.icon;
            return (
              <TabsTrigger 
                key={report.key} 
                value={report.key}
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-md transition-all duration-300"
              >
                <Icon className="h-4 w-4 mr-2" />
                {report.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-blue/5 to-vibrant-purple/5">
            <CardHeader className="bg-gradient-primary rounded-t-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  Business Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-white/90">Time Range:</span>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[120px] bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription className="text-base text-white/90">
                Key performance indicators and business metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-blue/10 to-vibrant-purple/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-foreground">Total Revenue</CardTitle>
                    <DollarSign className="h-5 w-5 text-vibrant-blue" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(salesData.reduce((sum, day) => sum + day.revenue, 0))}
                    </div>
                    <p className="text-xs text-muted-foreground">Across all sales</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-green/10 to-vibrant-teal/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-foreground">Total Sales</CardTitle>
                    <ShoppingCart className="h-5 w-5 text-vibrant-green" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {salesData.reduce((sum, day) => sum + day.sales, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Transactions completed</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-purple/10 to-vibrant-pink/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-foreground">Top Product</CardTitle>
                    <Package className="h-5 w-5 text-vibrant-purple" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {productData.length > 0 ? productData[0].name : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {productData.length > 0 ? `${productData[0].quantity_sold} sold` : 'No data'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-orange/10 to-vibrant-red/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-foreground">Top Category</CardTitle>
                    <AlertTriangle className="h-5 w-5 text-vibrant-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {categoryData.length > 0 
                        ? categoryData.reduce((max, cat) => cat.revenue > max.revenue ? cat : max, categoryData[0]).category 
                        : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {categoryData.length > 0 
                        ? formatCurrency(categoryData.reduce((max, cat) => cat.revenue > max.revenue ? cat : max, categoryData[0]).revenue)
                        : 'No data'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 mt-6 md:grid-cols-2">
                <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vibrant-blue">
                      <TrendingUp className="h-5 w-5" />
                      Sales Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-vibrant-green">
                      <Package className="h-5 w-5" />
                      Top Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {reportsList.filter(r => r.key !== 'overview').map((report) => {
          if (report.component) {
            const ReportComponent = report.component;
            return (
              <TabsContent key={report.key} value={report.key}>
                <ReportComponent />
              </TabsContent>
            );
          }
          return null;
        })}
      </Tabs>
    </div>
  );
}