import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface Inquiry {
  id: string;
  reference: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  status: string;
  source: string;
  priority: string;
  assignedTo: string;
  createdAt: string;
  lastUpdated: string;
  description?: string;
}

const SAMPLE: Inquiry[] = [
  { 
    id: 'inq1', 
    reference: 'INQ-2025-001', 
    customerName: 'John Smith', 
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    subject: 'Product Information Request',
    status: 'New',
    source: 'Website',
    priority: 'Medium',
    assignedTo: 'Sarah Johnson',
    createdAt: '2025-02-01',
    lastUpdated: '2025-02-01',
    description: 'Interested in bulk pricing for office supplies'
  },
  { 
    id: 'inq2', 
    reference: 'INQ-2025-002', 
    customerName: 'Maria Garcia', 
    email: 'maria.garcia@company.com',
    phone: '+1-555-0456',
    subject: 'Technical Support',
    status: 'In Progress',
    source: 'Phone',
    priority: 'High',
    assignedTo: 'Mike Chen',
    createdAt: '2025-02-02',
    lastUpdated: '2025-02-03',
    description: 'Having issues with software installation'
  },
  { 
    id: 'inq3', 
    reference: 'INQ-2025-003', 
    customerName: 'David Wilson', 
    email: 'david.wilson@business.com',
    phone: '+1-555-0789',
    subject: 'Partnership Inquiry',
    status: 'Pending',
    source: 'Email',
    priority: 'Low',
    assignedTo: 'Lisa Brown',
    createdAt: '2025-02-03',
    lastUpdated: '2025-02-03',
    description: 'Exploring partnership opportunities'
  },
  { 
    id: 'inq4', 
    reference: 'INQ-2025-004', 
    customerName: 'Emily Davis', 
    email: 'emily.davis@startup.com',
    phone: '+1-555-0321',
    subject: 'Custom Solution Request',
    status: 'Resolved',
    source: 'Social Media',
    priority: 'High',
    assignedTo: 'Alex Rodriguez',
    createdAt: '2025-02-04',
    lastUpdated: '2025-02-06',
    description: 'Need custom software development services'
  },
  { 
    id: 'inq5', 
    reference: 'INQ-2025-005', 
    customerName: 'Robert Taylor', 
    email: 'robert.taylor@enterprise.com',
    phone: '+1-555-0654',
    subject: 'Pricing Inquiry',
    status: 'Closed',
    source: 'Referral',
    priority: 'Medium',
    assignedTo: 'Sarah Johnson',
    createdAt: '2025-02-05',
    lastUpdated: '2025-02-07',
    description: 'Requesting enterprise pricing information'
  },
];

export default function InquiryListPage() {
  const [query, setQuery] = useState('');
  const [items] = useState<Inquiry[]>(SAMPLE);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.reference.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.subject.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q) ||
      i.source.toLowerCase().includes(q) ||
      i.priority.toLowerCase().includes(q) ||
      i.assignedTo.toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q)
    );
  }, [query, items]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'default';
      case 'in progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'resolved':
        return 'default';
      case 'closed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'website':
        return 'default';
      case 'phone':
        return 'secondary';
      case 'email':
        return 'outline';
      case 'social media':
        return 'default';
      case 'referral':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const totalInquiries = filtered.length;
  const newInquiries = filtered.filter(i => i.status === 'New').length;
  const inProgressInquiries = filtered.filter(i => i.status === 'In Progress').length;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-foreground">Inquiries</CardTitle>
        <CardDescription>All customer inquiries and leads</CardDescription>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by reference, customer, subject, status, or assigned to..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalInquiries}</div>
            <div className="text-sm text-blue-600">Total Inquiries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{newInquiries}</div>
            <div className="text-sm text-orange-600">New</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{inProgressInquiries}</div>
            <div className="text-sm text-green-600">In Progress</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.reference}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{i.customerName}</div>
                    <div className="text-sm text-muted-foreground">{i.email}</div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate" title={i.subject}>
                  {i.subject}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(i.status) as any}>
                    {i.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(i.priority) as any}>
                    {i.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getSourceColor(i.source) as any}>
                    {i.source}
                  </Badge>
                </TableCell>
                <TableCell>{i.assignedTo}</TableCell>
                <TableCell>{i.createdAt}</TableCell>
                <TableCell className="max-w-xs truncate" title={i.description}>
                  {i.description || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
