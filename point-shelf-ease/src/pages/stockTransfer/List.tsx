import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface StockTransfer {
  id: string;
  transferDate: string;
  referenceNumber: string;
  fromLocation: string;
  toLocation: string;
  shippingCharge: number;
  total: number;
  status: string;
}

const SAMPLE: StockTransfer[] = [
  { 
    id: 'st1', 
    transferDate: '2025-02-01',
    referenceNumber: 'ST-2025-001', 
    fromLocation: 'Warehouse A', 
    toLocation: 'Store Front', 
    shippingCharge: 25.00,
    total: 2525.00,
    status: 'Completed'
  },
  { 
    id: 'st2', 
    transferDate: '2025-02-03',
    referenceNumber: 'ST-2025-002', 
    fromLocation: 'Warehouse B', 
    toLocation: 'Warehouse A', 
    shippingCharge: 15.00,
    total: 1215.00,
    status: 'In Transit'
  },
  { 
    id: 'st3', 
    transferDate: '2025-02-05',
    referenceNumber: 'ST-2025-003', 
    fromLocation: 'Store Front', 
    toLocation: 'Warehouse C', 
    shippingCharge: 30.00,
    total: 1830.00,
    status: 'Pending'
  },
  { 
    id: 'st4', 
    transferDate: '2025-02-07',
    referenceNumber: 'ST-2025-004', 
    fromLocation: 'Warehouse A', 
    toLocation: 'Warehouse B', 
    shippingCharge: 20.00,
    total: 3220.00,
    status: 'Completed'
  },
];

export default function StockTransferListPage() {
  const [query, setQuery] = useState('');
  const [items] = useState<StockTransfer[]>(SAMPLE);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.referenceNumber.toLowerCase().includes(q) ||
      i.fromLocation.toLowerCase().includes(q) ||
      i.toLocation.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q)
    );
  }, [query, items]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in transit':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">Stock Transfers</CardTitle>
        <CardDescription>All inventory transfer records</CardDescription>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by reference number, locations, or status..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer Date</TableHead>
              <TableHead>Reference Number</TableHead>
              <TableHead>From Location</TableHead>
              <TableHead>To Location</TableHead>
              <TableHead>Shipping Charge</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.transferDate}</TableCell>
                <TableCell>{i.referenceNumber}</TableCell>
                <TableCell>{i.fromLocation}</TableCell>
                <TableCell>{i.toLocation}</TableCell>
                <TableCell className="font-medium">
                  ${i.shippingCharge.toFixed(2)}
                </TableCell>
                <TableCell className="font-medium">
                  ${i.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(i.status) as any}>
                    {i.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
