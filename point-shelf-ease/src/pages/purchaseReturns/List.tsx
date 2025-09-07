import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

interface PurchaseReturn {
  id: string;
  lastModifiedAt: string;
  orderNumber: string;
  paymentStatus: string;
  storeLocation: string;
  supplierName: string;
  totalDiscount: number;
  totalTax: number;
  total: number;
  totalPaid: number;
  orderDate: string;
  deliveryDate: string;
}

const SAMPLE: PurchaseReturn[] = [
  {
    id: 'pru1',
    lastModifiedAt: '2025-02-15 14:30:00',
    orderNumber: 'PRN-2001',
    paymentStatus: 'Paid',
    storeLocation: 'Main Store',
    supplierName: 'Acme Corporation',
    totalDiscount: 15.0,
    totalTax: 12.0,
    total: 150.0,
    totalPaid: 150.0,
    orderDate: '2025-02-01',
    deliveryDate: '2025-02-10'
  },
  {
    id: 'pru2',
    lastModifiedAt: '2025-02-16 09:15:00',
    orderNumber: 'PRN-2002',
    paymentStatus: 'Partial',
    storeLocation: 'Branch Store',
    supplierName: 'Global Ltd',
    totalDiscount: 7.5,
    totalTax: 6.0,
    total: 75.25,
    totalPaid: 50.0,
    orderDate: '2025-02-05',
    deliveryDate: '2025-02-12'
  },
];

export default function PurchaseReturnListPage() {
  const [query, setQuery] = useState('');
  const [items] = useState<PurchaseReturn[]>(SAMPLE);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.orderNumber.toLowerCase().includes(q) ||
      i.supplierName.toLowerCase().includes(q) ||
      i.storeLocation.toLowerCase().includes(q) ||
      i.paymentStatus.toLowerCase().includes(q)
    );
  }, [query, items]);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">Purchase Returns</CardTitle>
        <CardDescription>All purchase return entries</CardDescription>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order number, supplier, store, or payment status..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Last Modified At</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Store/Location</TableHead>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Total Discount</TableHead>
              <TableHead>Total Tax</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Total Paid</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Delivery Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.lastModifiedAt}</TableCell>
                <TableCell>{i.orderNumber}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    i.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                    i.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {i.paymentStatus}
                  </span>
                </TableCell>
                <TableCell>{i.storeLocation}</TableCell>
                <TableCell>{i.supplierName}</TableCell>
                <TableCell>${i.totalDiscount.toFixed(2)}</TableCell>
                <TableCell>${i.totalTax.toFixed(2)}</TableCell>
                <TableCell className="font-semibold">${i.total.toFixed(2)}</TableCell>
                <TableCell>${i.totalPaid.toFixed(2)}</TableCell>
                <TableCell>{i.orderDate}</TableCell>
                <TableCell>{i.deliveryDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


