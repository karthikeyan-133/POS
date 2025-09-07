import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface DamageStock {
  id: string;
  damagedDate: string;
  product: string;
  location: string;
  damagedQuantity: number;
  reason: string;
  reportedBy: string;
}

const SAMPLE: DamageStock[] = [
  { 
    id: 'ds1', 
    damagedDate: '2025-02-01',
    product: 'iPhone 15 Pro', 
    location: 'Warehouse A',
    damagedQuantity: 2, 
    reason: 'Physical Damage - Dropped during handling', 
    reportedBy: 'John Smith'
  },
  { 
    id: 'ds2', 
    damagedDate: '2025-02-03',
    product: 'Samsung Galaxy S24', 
    location: 'Warehouse B',
    damagedQuantity: 1, 
    reason: 'Water Damage - Leak in storage area', 
    reportedBy: 'Jane Doe'
  },
  { 
    id: 'ds3', 
    damagedDate: '2025-02-05',
    product: 'MacBook Air M2', 
    location: 'Store Front',
    damagedQuantity: 1, 
    reason: 'Screen Crack - Customer return', 
    reportedBy: 'Mike Johnson'
  },
  { 
    id: 'ds4', 
    damagedDate: '2025-02-07',
    product: 'iPad Pro 12.9', 
    location: 'Warehouse C',
    damagedQuantity: 3, 
    reason: 'Transportation Damage - Shipping incident', 
    reportedBy: 'Sarah Wilson'
  },
];

export default function DamageStockListPage() {
  const [query, setQuery] = useState('');
  const [items] = useState<DamageStock[]>(SAMPLE);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.product.toLowerCase().includes(q) ||
      i.reason.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.reportedBy.toLowerCase().includes(q)
    );
  }, [query, items]);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">Damage Stock</CardTitle>
        <CardDescription>All damaged inventory items</CardDescription>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by product, reason, location, or reported by..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Damaged Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Damaged Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reported By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.damagedDate}</TableCell>
                <TableCell>{i.product}</TableCell>
                <TableCell>{i.location}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="destructive">
                    {i.damagedQuantity}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={i.reason}>
                    {i.reason}
                  </div>
                </TableCell>
                <TableCell>{i.reportedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
