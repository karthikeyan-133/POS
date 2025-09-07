import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PurchaseRequest {
  id: string;
  order_date: string;
  order_number: string;
  store_location: string;
  supplier_name: string;
  total_amount: number;
  total_discount: number;
  total_tax: number;
  delivery_date: string;
  created_by: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Delivered';
}

const SAMPLE: PurchaseRequest[] = [
  {
    id: 'pr1',
    order_date: '2025-01-10',
    order_number: 'PO-2025-001',
    store_location: 'Main Store - Downtown',
    supplier_name: 'Acme Wholesalers Inc.',
    total_amount: 2850.00,
    total_discount: 285.00,
    total_tax: 228.00,
    delivery_date: '2025-01-20',
    created_by: 'John Smith',
    status: 'Pending'
  },
  {
    id: 'pr2',
    order_date: '2025-01-12',
    order_number: 'PO-2025-002',
    store_location: 'Branch Store - Uptown',
    supplier_name: 'Global Suppliers Ltd.',
    total_amount: 4200.00,
    total_discount: 420.00,
    total_tax: 336.00,
    delivery_date: '2025-01-22',
    created_by: 'Sarah Johnson',
    status: 'Approved'
  },
  {
    id: 'pr3',
    order_date: '2025-01-14',
    order_number: 'PO-2025-003',
    store_location: 'Warehouse - Industrial',
    supplier_name: 'Tech Components Inc.',
    total_amount: 6750.00,
    total_discount: 675.00,
    total_tax: 540.00,
    delivery_date: '2025-01-25',
    created_by: 'Mike Davis',
    status: 'Draft'
  }
];

export default function PurchaseRequestListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [items] = useState<PurchaseRequest[]>(SAMPLE);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.order_number.toLowerCase().includes(q) ||
      i.supplier_name.toLowerCase().includes(q) ||
      i.store_location.toLowerCase().includes(q) ||
      i.created_by.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q)
    );
  }, [query, items]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleView = (id: string) => {
    console.log('View purchase request:', id);
  };

  const handleEdit = (id: string) => {
    navigate(`/purchase-requests/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    console.log('Delete purchase request:', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Requests</h1>
          <p className="text-muted-foreground">Manage purchase order requests</p>
        </div>
        <Button onClick={() => navigate('/purchase-requests/add')}>
          Add New Request
        </Button>
      </div>

      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground">Purchase Request List</CardTitle>
          <CardDescription>All purchase order requests with detailed information</CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by order number, supplier, location, or creator..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="pl-10" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Order Date</TableHead>
                  <TableHead className="font-semibold">Order Number</TableHead>
                  <TableHead className="font-semibold">Store/Location</TableHead>
                  <TableHead className="font-semibold">Supplier Name</TableHead>
                  <TableHead className="font-semibold text-right">Total Amount</TableHead>
                  <TableHead className="font-semibold text-right">Total Discount</TableHead>
                  <TableHead className="font-semibold text-right">Total Tax</TableHead>
                  <TableHead className="font-semibold">Delivery Date</TableHead>
                  <TableHead className="font-semibold">Created By</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(item => (
                  <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      {new Date(item.order_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {item.order_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.store_location}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.supplier_name}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      ${item.total_discount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      ${item.total_tax.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(item.delivery_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.created_by}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                      No purchase requests found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


