import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export default function AddNewInquiryPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    reference: '',
    customerName: '',
    email: '',
    phone: '',
    subject: '',
    status: '',
    source: '',
    priority: '',
    assignedTo: '',
    description: '',
    company: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const statuses = [
    'New',
    'In Progress',
    'Pending',
    'Resolved',
    'Closed'
  ];

  const sources = [
    'Website',
    'Phone',
    'Email',
    'Social Media',
    'Referral',
    'Trade Show',
    'Advertisement',
    'Other'
  ];

  const priorities = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ];

  const teamMembers = [
    'Sarah Johnson',
    'Mike Chen',
    'Lisa Brown',
    'Alex Rodriguez',
    'David Kim',
    'Emma Wilson'
  ];

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">New Inquiry</h1>
            <p className="text-lg text-muted-foreground">Create a new customer inquiry or lead</p>
          </div>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-teal/5 to-vibrant-blue/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            New Inquiry
          </CardTitle>
          <CardDescription className="text-base text-white/90">Create a new customer inquiry or lead</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-foreground">Reference Number</Label>
                <Input 
                  id="reference" 
                  value={form.reference} 
                  onChange={(e) => handleChange('reference', e.target.value)} 
                  placeholder="INQ-2025-XXX" 
                  className="border-vibrant-teal/30 focus:ring-vibrant-teal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-foreground">Subject</Label>
                <Input 
                  id="subject" 
                  value={form.subject} 
                  onChange={(e) => handleChange('subject', e.target.value)} 
                  placeholder="Inquiry subject"
                  className="border-vibrant-teal/30 focus:ring-vibrant-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-foreground">Customer Name</Label>
                <Input 
                  id="customerName" 
                  value={form.customerName} 
                  onChange={(e) => handleChange('customerName', e.target.value)} 
                  placeholder="Full name"
                  className="border-vibrant-teal/30 focus:ring-vibrant-teal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-foreground">Company</Label>
                <Input 
                  id="company" 
                  value={form.company} 
                  onChange={(e) => handleChange('company', e.target.value)} 
                  placeholder="Company name"
                  className="border-vibrant-teal/30 focus:ring-vibrant-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => handleChange('email', e.target.value)} 
                  placeholder="customer@email.com"
                  className="border-vibrant-teal/30 focus:ring-vibrant-teal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone</Label>
                <Input 
                  id="phone" 
                  value={form.phone} 
                  onChange={(e) => handleChange('phone', e.target.value)} 
                  placeholder="+1-555-0123"
                  className="border-vibrant-teal/30 focus:ring-vibrant-teal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground">Address</Label>
              <Textarea 
                id="address" 
                value={form.address} 
                onChange={(e) => handleChange('address', e.target.value)} 
                placeholder="Customer address"
                rows={2}
                className="border-vibrant-teal/30 focus:ring-vibrant-teal"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-foreground">Status</Label>
                <Select value={form.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="border-vibrant-teal/30 focus:ring-vibrant-teal">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status} className="hover:bg-vibrant-teal/10">{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-foreground">Priority</Label>
                <Select value={form.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger className="border-vibrant-teal/30 focus:ring-vibrant-teal">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority} value={priority} className="hover:bg-vibrant-teal/10">{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source" className="text-foreground">Source</Label>
                <Select value={form.source} onValueChange={(value) => handleChange('source', value)}>
                  <SelectTrigger className="border-vibrant-teal/30 focus:ring-vibrant-teal">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map(source => (
                      <SelectItem key={source} value={source} className="hover:bg-vibrant-teal/10">{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo" className="text-foreground">Assigned To</Label>
                <Select value={form.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                  <SelectTrigger className="border-vibrant-teal/30 focus:ring-vibrant-teal">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member} value={member} className="hover:bg-vibrant-teal/10">{member}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea 
                id="description" 
                value={form.description} 
                onChange={(e) => handleChange('description', e.target.value)} 
                placeholder="Detailed description of the inquiry..."
                rows={4}
                className="border-vibrant-teal/30 focus:ring-vibrant-teal"
              />
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-vibrant-teal/20">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/inquiry')}
                className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-gradient-primary hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Inquiry'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}