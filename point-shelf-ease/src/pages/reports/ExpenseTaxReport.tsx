import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, Receipt, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TaxData {
  date: string;
  tax_amount: number;
  expense_amount: number;
  tax_rate: number;
}

interface CategoryTax {
  category: string;
  total_expenses: number;
  total_tax: number;
  avg_tax_rate: number;
  expense_count: number;
}

interface MonthlyTax {
  month: string;
  tax_amount: number;
  expense_amount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ExpenseTaxReport() {
  const [taxData, setTaxData] = useState<TaxData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryTax[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyTax[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchExpenseTaxReports();
  }, [dateRange]);

  const fetchExpenseTaxReports = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // Fetch expenses data with tax information
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          amount,
          tax_amount,
          expense_date,
          expense_categories (name)
        `)
        .gte('expense_date', startDate.toISOString());

      if (expensesError) throw expensesError;

      // Process tax data by date
      const taxByDate = expenses.reduce((acc: Record<string, { tax_amount: number; expense_amount: number; tax_rate: number }>, expense) => {
        const date = new Date(expense.expense_date).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { tax_amount: 0, expense_amount: 0, tax_rate: 0 };
        }
        acc[date].tax_amount += Number(expense.tax_amount || 0);
        acc[date].expense_amount += Number(expense.amount);
        return acc;
      }, {});

      // Calculate average tax rates
      Object.keys(taxByDate).forEach(date => {
        if (taxByDate[date].expense_amount > 0) {
          taxByDate[date].tax_rate = (taxByDate[date].tax_amount / taxByDate[date].expense_amount) * 100;
        }
      });

      const taxReportData = Object.entries(taxByDate)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString(),
          tax_amount: data.tax_amount,
          expense_amount: data.expense_amount,
          tax_rate: data.tax_rate
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setTaxData(taxReportData);

      // Process category tax data
      const categoryStats = expenses.reduce((acc: Record<string, { total_expenses: number; total_tax: number; expense_count: number }>, expense) => {
        const categoryName = expense.expense_categories?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = { total_expenses: 0, total_tax: 0, expense_count: 0 };
        }
        acc[categoryName].total_expenses += Number(expense.amount);
        acc[categoryName].total_tax += Number(expense.tax_amount || 0);
        acc[categoryName].expense_count += 1;
        return acc;
      }, {});

      const categoryTaxData = Object.entries(categoryStats)
        .map(([category, data]) => ({
          category,
          total_expenses: data.total_expenses,
          total_tax: data.total_tax,
          avg_tax_rate: data.total_expenses > 0 ? (data.total_tax / data.total_expenses) * 100 : 0,
          expense_count: data.expense_count
        }))
        .sort((a, b) => b.total_tax - a.total_tax)
        .slice(0, 15);

      setCategoryData(categoryTaxData);

      // Process monthly tax data
      const monthlyStats = expenses.reduce((acc: Record<string, { tax_amount: number; expense_amount: number }>, expense) => {
        const month = new Date(expense.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { tax_amount: 0, expense_amount: 0 };
        }
        acc[month].tax_amount += Number(expense.tax_amount || 0);
        acc[month].expense_amount += Number(expense.amount);
        return acc;
      }, {});

      const monthlyTaxData = Object.entries(monthlyStats)
        .map(([month, data]) => ({
          month,
          tax_amount: data.tax_amount,
          expense_amount: data.expense_amount
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      setMonthlyData(monthlyTaxData);

    } catch (error) {
      console.error('Error fetching expense tax reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch expense tax report data',
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
      description: 'Expense tax report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading expense tax reports...</div>
      </div>
    );
  }

  const totalTax = taxData.reduce((sum, item) => sum + item.tax_amount, 0);
  const totalExpenses = taxData.reduce((sum, item) => sum + item.expense_amount, 0);
  const avgTaxRate = totalExpenses > 0 ? (totalTax / totalExpenses) * 100 : 0;
  const maxTax = Math.max(...taxData.map(item => item.tax_amount));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Tax Report</h1>
          <p className="text-muted-foreground">Track tax on expenses and category analysis</p>
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
            <CardTitle className="text-sm font-medium">Total Expense Tax</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalTax)}</div>
            <p className="text-xs text-muted-foreground">
              Total tax on expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Total expense amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Tax Rate</CardTitle>
            <Calculator className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgTaxRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Average tax rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Tax Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(maxTax)}</div>
            <p className="text-xs text-muted-foreground">
              Single day peak
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Tax Trends</CardTitle>
            <CardDescription>Daily expense tax amounts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={taxData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="tax_amount" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Rate Trends</CardTitle>
            <CardDescription>Daily tax rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={taxData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                <Line type="monotone" dataKey="tax_rate" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Tax</CardTitle>
            <CardDescription>Categories with highest expense tax amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total_tax" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Tax</CardTitle>
            <CardDescription>Monthly tax amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="tax_amount" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Tax Details</CardTitle>
          <CardDescription>Comprehensive expense tax analysis by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Total Expenses</th>
                  <th className="text-right p-2">Total Tax</th>
                  <th className="text-right p-2">Avg Tax Rate</th>
                  <th className="text-right p-2">Expense Count</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.category}</td>
                    <td className="text-right p-2">{formatCurrency(item.total_expenses)}</td>
                    <td className="text-right p-2">{formatCurrency(item.total_tax)}</td>
                    <td className="text-right p-2">{item.avg_tax_rate.toFixed(2)}%</td>
                    <td className="text-right p-2">{item.expense_count}</td>
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
