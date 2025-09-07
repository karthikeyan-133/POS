import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, Users, FileText, Paperclip, Eye, EyeOff } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  is_active: boolean;
}

const SAMPLE_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}',
    category: 'Welcome',
    is_active: true
  },
  {
    id: '2',
    name: 'Password Reset',
    subject: 'Reset Your Password - {{company_name}}',
    category: 'Security',
    is_active: true
  },
  {
    id: '3',
    name: 'Order Confirmation',
    subject: 'Order Confirmed - #{{order_number}}',
    category: 'Orders',
    is_active: true
  },
  {
    id: '4',
    name: 'Invoice',
    subject: 'Invoice #{{invoice_number}} from {{company_name}}',
    category: 'Billing',
    is_active: true
  },
  {
    id: '5',
    name: 'Newsletter',
    subject: '{{company_name}} Newsletter - {{month_year}}',
    category: 'Marketing',
    is_active: true
  }
];

const SAMPLE_RECIPIENTS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', type: 'customer' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', type: 'customer' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', type: 'supplier' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', type: 'customer' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', type: 'employee' }
];

export default function SendEmailPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    template_id: '',
    subject: '',
    recipients: [] as string[],
    cc: [] as string[],
    bcc: [] as string[],
    message: '',
    attachments: [] as File[],
    priority: 'normal' as 'low' | 'normal' | 'high',
    schedule_send: false,
    scheduled_time: '',
    track_opens: true,
    track_clicks: true
  });
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateChange = (templateId: string) => {
    const template = SAMPLE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        subject: template.subject
      }));
    }
  };

  const handleRecipientChange = (recipientId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipients(prev => [...prev, recipientId]);
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, SAMPLE_RECIPIENTS.find(r => r.id === recipientId)?.email || '']
      }));
    } else {
      setSelectedRecipients(prev => prev.filter(id => id !== recipientId));
      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients.filter(email => 
          email !== SAMPLE_RECIPIENTS.find(r => r.id === recipientId)?.email
        )
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      // Validate required fields
      if (!formData.subject || formData.recipients.length === 0) {
        toast({
          title: "Validation Error",
          description: "Subject and at least one recipient are required",
          variant: "destructive",
        });
        return;
      }

      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: `Email sent successfully to ${formData.recipients.length} recipient(s)`,
      });
      
      // Reset form
      setFormData({
        template_id: '',
        subject: '',
        recipients: [],
        cc: [],
        bcc: [],
        message: '',
        attachments: [],
        priority: 'normal',
        schedule_send: false,
        scheduled_time: '',
        track_opens: true,
        track_clicks: true
      });
      setSelectedRecipients([]);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      normal: 'bg-green-100 text-green-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getRecipientTypeBadge = (type: string) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800',
      supplier: 'bg-green-100 text-green-800',
      employee: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Email Composition */}
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground flex items-center">
            <Send className="mr-2 h-5 w-5" />
            Send Email
          </CardTitle>
          <CardDescription>Compose and send emails to your contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Email Template</h3>
              <div className="space-y-2">
                <Label htmlFor="template">Select Template (Optional)</Label>
                <Select value={formData.template_id} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template or compose manually" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Compose Manually</SelectItem>
                    {SAMPLE_TEMPLATES.filter(t => t.is_active).map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Email Details</h3>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Enter email subject"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'normal' | 'high') => handleChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="track_opens">Track Opens</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="track_opens"
                      checked={formData.track_opens}
                      onCheckedChange={(checked) => handleChange('track_opens', checked)}
                    />
                    <Label htmlFor="track_opens" className="text-sm">Enable open tracking</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="track_clicks">Track Clicks</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="track_clicks"
                      checked={formData.track_clicks}
                      onCheckedChange={(checked) => handleChange('track_clicks', checked)}
                    />
                    <Label htmlFor="track_clicks" className="text-sm">Enable click tracking</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Recipients</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Recipients</Label>
                  <div className="grid gap-2 max-h-40 overflow-y-auto border rounded-lg p-4">
                    {SAMPLE_RECIPIENTS.map(recipient => (
                      <div key={recipient.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={recipient.id}
                          checked={selectedRecipients.includes(recipient.id)}
                          onCheckedChange={(checked) => handleRecipientChange(recipient.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{recipient.name}</span>
                            <Badge className={getRecipientTypeBadge(recipient.type)}>
                              {recipient.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{recipient.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cc">CC (Optional)</Label>
                    <Input
                      id="cc"
                      value={formData.cc.join(', ')}
                      onChange={(e) => handleChange('cc', e.target.value.split(',').map(email => email.trim()))}
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bcc">BCC (Optional)</Label>
                    <Input
                      id="bcc"
                      value={formData.bcc.join(', ')}
                      onChange={(e) => handleChange('bcc', e.target.value.split(',').map(email => email.trim()))}
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Message Content</h3>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Enter your email message"
                  rows={8}
                  required
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Attachments</h3>
              <div className="space-y-2">
                <Label htmlFor="attachments">Add Files</Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files:</Label>
                    <div className="space-y-1">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Scheduling</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="schedule_send"
                    checked={formData.schedule_send}
                    onCheckedChange={(checked) => handleChange('schedule_send', checked)}
                  />
                  <Label htmlFor="schedule_send">Schedule for later</Label>
                </div>
                {formData.schedule_send && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time">Scheduled Time</Label>
                    <Input
                      id="scheduled_time"
                      type="datetime-local"
                      value={formData.scheduled_time}
                      onChange={(e) => handleChange('scheduled_time', e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button
                type="submit"
                disabled={sending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email Preview */}
      {showPreview && (
        <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">From:</Label>
                <p className="text-sm text-muted-foreground">noreply@yourcompany.com</p>
              </div>
              <div>
                <Label className="text-sm font-medium">To:</Label>
                <p className="text-sm text-muted-foreground">{formData.recipients.join(', ') || 'No recipients selected'}</p>
              </div>
              {formData.cc.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">CC:</Label>
                  <p className="text-sm text-muted-foreground">{formData.cc.join(', ')}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Subject:</Label>
                <p className="text-sm text-muted-foreground">{formData.subject || 'No subject'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Priority:</Label>
                <Badge className={getPriorityBadge(formData.priority)}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Message:</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{formData.message || 'No message content'}</p>
                </div>
              </div>
              {formData.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Attachments:</Label>
                  <div className="mt-2 space-y-1">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                        <span>{file.name}</span>
                        <span>({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
