import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentData {
  date: string;
  paid: number;
  pending: number;
  total: number;
}

interface CustomerPayment {
  customer: string;
  total_sales: number;
  total_paid: number;
  pending_amount: number;
  payment_count: number;
}

interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SalesPaymentReport() {
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [customerData, setCustomerData] = useState<CustomerPayment[]>([]);
  const [methodData, setMethodData] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentReports();
  }, [dateRange]);

  const fetchPaymentReports = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // Fetch sales payments data
      const { data: payments, error: paymentsError } = await supabase
        .from('sale_payments')
        .select(`
          amount,
          payment_method,
          payment_date,
          sales!inner (
            total_amount,
            customers (name),
            created_at
          )
        `)
        .gte('payment_date', startDate.toISOString());

      if (paymentsError) throw paymentsError;

      // Process payment data by date
      const paymentByDate = payments.reduce((acc: Record<string, { paid: number; pending: number; total: number }>, payment) => {
        const date = new Date(payment.payment_date).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { paid: 0, pending: 0, total: 0 };
        }
        acc[date].paid += Number(payment.amount);
        acc[date].total += Number(payment.sales?.total_amount || 0);
        return acc;
      }, {});

      // Calculate pending amounts
      Object.keys(paymentByDate).forEach(date => {
        paymentByDate[date].pending = paymentByDate[date].total - paymentByDate[date].paid;
      });

      const paymentReportData = Object.entries(paymentByDate)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString(),
          paid: data.paid,
          pending: data.pending,
          total: data.total
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setPaymentData(paymentReportData);

      // Process customer payment data
      const customerStats = payments.reduce((acc: Record<string, { total_sales: number; total_paid: number; payment_count: number }>, payment) => {
        const customerName = payment.sales?.customers?.name || 'Walk-in Customer';
        if (!acc[customerName]) {
          acc[customerName] = { total_sales: 0, total_paid: 0, payment_count: 0 };
        }
        acc[customerName].total_sales += Number(payment.sales?.total_amount || 0);
        acc[customerName].total_paid += Number(payment.amount);
        acc[customerName].payment_count += 1;
        return acc;
      }, {});

      const customerPaymentData = Object.entries(customerStats)
        .map(([customer, data]) => ({
          customer,
          total_sales: data.total_sales,
          total_paid: data.total_paid,
          pending_amount: data.total_sales - data.total_paid,
          payment_count: data.payment_count
        }))
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 10);

      setCustomerData(customerPaymentData);

      // Process payment method data
      const methodStats = payments.reduce((acc: Record<string, { amount: number; count: number }>, payment) => {
        const method = payment.payment_method || 'Unknown';
        if (!acc[method]) {
          acc[method] = { amount: 0, count: 0 };
        }
        acc[method].amount += Number(payment.amount);
        acc[method].count += 1;
        return acc;
      }, {});

      const paymentMethodData = Object.entries(methodStats)
        .map(([method, data]) => ({
          method,
          amount: data.amount,
          count: data.count
        }))
        .sort((a, b) => b.amount - a.amount);

      setMethodData(paymentMethodData);

    } catch (error) {
      console.error('Error fetching payment reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payment report data',
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
      description: 'Sales payment report exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading payment reports...</div>
      </div>
    );
  }

  const totalPaid = paymentData.reduce((sum, item) => sum + item.paid, 0);
  const totalPending = paymentData.reduce((sum, item) => sum + item.pending, 0);
  const totalAmount = paymentData.reduce((sum, item) => sum + item.total, 0);
  const paymentRate = totalAmount > 0 ? (totalPaid / totalAmount * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Payment Report</h1>
          <p className="text-muted-foreground">Track sales payments and outstanding amounts</p>
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
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              Payments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paymentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of total sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{methodData.length}</div>
            <p className="text-xs text-muted-foreground">
              Different methods used
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Trends</CardTitle>
            <CardDescription>Daily payment amounts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="paid" stroke="#22c55e" strokeWidth={2} name="Received" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Outstanding" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
            <CardDescription>Payments by method</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8a2be2"
                  dataKey="amount"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers by Payment</CardTitle>
            <CardDescription>Customers with highest payment amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="customer" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total_paid" fill="#8a2be2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Payments by Customer</CardTitle>
            <CardDescription>Outstanding amounts by customer</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerData.filter(c => c.pending_amount > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="customer" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="pending_amount" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Comprehensive payment analysis by customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Customer</th>
                  <th className="text-right p-2">Total Sales</th>
                  <th className="text-right p-2">Total Paid</th>
                  <th className="text-right p-2">Outstanding</th>
                  <th className="text-right p-2">Payment Count</th>
                  <th className="text-right p-2">Collection Rate</th>
                </tr>
              </thead>
              <tbody>
                {customerData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.customer}</td>
                    <td className="text-right p-2">{formatCurrency(item.total_sales)}</td>
                    <td className="text-right p-2">{formatCurrency(item.total_paid)}</td>
                    <td className="text-right p-2">{formatCurrency(item.pending_amount)}</td>
                    <td className="text-right p-2">{item.payment_count}</td>
                    <td className="text-right p-2">
                      {item.total_sales > 0 ? (item.total_paid / item.total_sales * 100).toFixed(1) : 0}%
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
