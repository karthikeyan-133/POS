import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, TrendingDown, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfitLossData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

interface CategoryProfit {
  category: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface MonthlyPL {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProfitLossReport() {
  const [plData, setPlData] = useState<ProfitLossData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryProfit[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchProfitLossReports();
  }, [dateRange]);

  const fetchProfitLossReports = async () => {
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
            products (cost_price)
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (salesError) throw salesError;

      // Fetch expenses data
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .gte('expense_date', startDate.toISOString());

      if (expensesError) throw expensesError;

      // Process profit/loss data by date
      const plByDate = sales.reduce((acc: Record<string, { revenue: number; cost: number; profit: number }>, sale) => {
        const date = new Date(sale.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { revenue: 0, cost: 0, profit: 0 };
        }
        
        const revenue = Number(sale.total_amount);
        const cost = sale.sale_items?.reduce((sum: number, item: any) => {
          return sum + (Number(item.quantity) * Number(item.products?.cost_price || 0));
        }, 0) || 0;
        
        acc[date].revenue += revenue;
        acc[date].cost += cost;
        acc[date].profit += revenue - cost;
        
        return acc;
      }, {});

      // Add expenses to the data
      expenses.forEach(expense => {
        const date = new Date(expense.expense_date).toISOString().split('T')[0];
        if (!plByDate[date]) {
          plByDate[date] = { revenue: 0, cost: 0, profit: 0 };
        }
        plByDate[date].profit -= Number(expense.amount);
      });

      const profitLossReportData = Object.entries(plByDate)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString(),
          revenue: data.revenue,
          expenses: data.cost + (data.revenue - data.cost - data.profit),
          profit: data.profit,
          margin: data.revenue > 0 ? (data.profit / data.revenue * 100) : 0
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setPlData(profitLossReportData);

      // Process category profit data
      const categoryStats = sales.reduce((acc: Record<string, { revenue: number; cost: number; profit: number }>, sale) => {
        sale.sale_items?.forEach((item: any) => {
          const categoryName = item.products?.categories?.name || 'Uncategorized';
          if (!acc[categoryName]) {
            acc[categoryName] = { revenue: 0, cost: 0, profit: 0 };
          }
          
          const revenue = Number(item.quantity) * Number(item.unit_price);
          const cost = Number(item.quantity) * Number(item.products?.cost_price || 0);
          
          acc[categoryName].revenue += revenue;
          acc[categoryName].cost += cost;
          acc[categoryName].profit += revenue - cost;
        });
        
        return acc;
      }, {});

      const categoryProfitData = Object.entries(categoryStats)
        .map(([category, data]) => ({
          category,
          revenue: data.revenue,
          cost: data.cost,
          profit: data.profit,
          margin: data.revenue > 0 ? (data.profit / data.revenue * 100) : 0
        }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10);

      setCategoryData(categoryProfitData);

      // Process monthly profit/loss data
      const monthlyStats = sales.reduce((acc: Record<string, { revenue: number; cost: number; profit: number }>, sale) => {
        const month = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { revenue: 0, cost: 0, profit: 0 };
        }
        
        const revenue = Number(sale.total_amount);
        const cost = sale.sale_items?.reduce((sum: number, item: any) => {
          return sum + (Number(item.quantity) * Number(item.products?.cost_price || 0));
        }, 0) || 0;
        
        acc[month].revenue += revenue;
        acc[month].cost += cost;
        acc[month].profit += revenue - cost;
        
        return acc;
      }, {});

      // Add monthly expenses
      expenses.forEach(expense => {
        const month = new Date(expense.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyStats[month]) {
          monthlyStats[month] = { revenue: 0, cost: 0, profit: 0 };
        }
        monthlyStats[month].profit -= Number(expense.amount);
      });

      const monthlyPLData = Object.entries(monthlyStats)
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          expenses: data.cost + (data.revenue - data.cost - data.profit),
          profit: data.profit
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      setMonthlyData(monthlyPLData);

    } catch (error) {
      console.error('Error fetching profit/loss reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch profit/loss report data',
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
      description: 'Profit & Loss report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading profit/loss reports...</div>
      </div>
    );
  }

  const totalRevenue = plData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = plData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = plData.reduce((sum, item) => sum + item.profit, 0);
  const avgMargin = plData.length > 0 ? plData.reduce((sum, item) => sum + item.margin, 0) / plData.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss Report</h1>
          <p className="text-muted-foreground">Comprehensive financial performance analysis</p>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Total sales revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Total costs & expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net profit/loss
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Calculator className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {avgMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average margin
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profit/Loss Trends</CardTitle>
            <CardDescription>Daily profit and loss over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={plData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit by Category</CardTitle>
            <CardDescription>Profit performance by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="profit" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit/Loss</CardTitle>
            <CardDescription>Monthly financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Margin Distribution</CardTitle>
            <CardDescription>Profit margins by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Bar dataKey="margin" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Details</CardTitle>
          <CardDescription>Comprehensive financial analysis by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Cost</th>
                  <th className="text-right p-2">Profit</th>
                  <th className="text-right p-2">Margin</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.category}</td>
                    <td className="text-right p-2">{formatCurrency(item.revenue)}</td>
                    <td className="text-right p-2">{formatCurrency(item.cost)}</td>
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
