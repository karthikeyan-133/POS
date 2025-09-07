import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Settings, Mail, TestTube, Save, RefreshCw } from 'lucide-react';

interface SMTPConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  encryption: 'none' | 'ssl' | 'tls';
  from_email: string;
  from_name: string;
  auth_required: boolean;
  verify_ssl: boolean;
}

export default function SMTPSettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SMTPConfig>({
    host: '',
    port: '587',
    username: '',
    password: '',
    encryption: 'tls',
    from_email: '',
    from_name: '',
    auth_required: true,
    verify_ssl: true
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleChange = (field: keyof SMTPConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate saving to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "SMTP settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SMTP settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      // Simulate testing SMTP connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: "SMTP connection test successful!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "SMTP connection test failed. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTesting(true);
    try {
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: "Test email sent successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>Configure your SMTP server settings for sending emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Server Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Server Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">SMTP Host *</Label>
                <Input
                  id="host"
                  value={config.host}
                  onChange={(e) => handleChange('host', e.target.value)}
                  placeholder="e.g., smtp.gmail.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port *</Label>
                <Input
                  id="port"
                  value={config.port}
                  onChange={(e) => handleChange('port', e.target.value)}
                  placeholder="587"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="encryption">Encryption</Label>
                <Select value={config.encryption} onValueChange={(value: 'none' | 'ssl' | 'tls') => handleChange('encryption', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="verify_ssl">Verify SSL Certificate</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verify_ssl"
                    checked={config.verify_ssl}
                    onCheckedChange={(checked) => handleChange('verify_ssl', checked as boolean)}
                  />
                  <Label htmlFor="verify_ssl" className="text-sm">Enable SSL verification</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Authentication</h3>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="auth_required"
                checked={config.auth_required}
                onCheckedChange={(checked) => handleChange('auth_required', checked as boolean)}
              />
              <Label htmlFor="auth_required">Authentication Required</Label>
            </div>
            {config.auth_required && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username/Email *</Label>
                  <Input
                    id="username"
                    value={config.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="your-email@gmail.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password/App Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={config.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Enter password or app password"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* From Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">From Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_email">From Email *</Label>
                <Input
                  id="from_email"
                  type="email"
                  value={config.from_email}
                  onChange={(e) => handleChange('from_email', e.target.value)}
                  placeholder="noreply@yourcompany.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from_name">From Name *</Label>
                <Input
                  id="from_name"
                  value={config.from_name}
                  onChange={(e) => handleChange('from_name', e.target.value)}
                  placeholder="Your Company Name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendTestEmail}
              disabled={testing}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              {testing ? 'Sending...' : 'Send Test Email'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popular SMTP Providers */}
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Popular SMTP Providers</CardTitle>
          <CardDescription>Quick setup guides for popular email providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-foreground">Gmail</h4>
              <p className="text-sm text-muted-foreground mb-2">SMTP Host: smtp.gmail.com</p>
              <p className="text-sm text-muted-foreground mb-2">Port: 587</p>
              <p className="text-sm text-muted-foreground">Encryption: TLS</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-foreground">Outlook/Hotmail</h4>
              <p className="text-sm text-muted-foreground mb-2">SMTP Host: smtp-mail.outlook.com</p>
              <p className="text-sm text-muted-foreground mb-2">Port: 587</p>
              <p className="text-sm text-muted-foreground">Encryption: TLS</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-foreground">Yahoo</h4>
              <p className="text-sm text-muted-foreground mb-2">SMTP Host: smtp.mail.yahoo.com</p>
              <p className="text-sm text-muted-foreground mb-2">Port: 587</p>
              <p className="text-sm text-muted-foreground">Encryption: TLS</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-foreground">SendGrid</h4>
              <p className="text-sm text-muted-foreground mb-2">SMTP Host: smtp.sendgrid.net</p>
              <p className="text-sm text-muted-foreground mb-2">Port: 587</p>
              <p className="text-sm text-muted-foreground">Encryption: TLS</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-foreground">Mailgun</h4>
              <p className="text-sm text-muted-foreground mb-2">SMTP Host: smtp.mailgun.org</p>
              <p className="text-sm text-muted-foreground mb-2">Port: 587</p>
              <p className="text-sm text-muted-foreground">Encryption: TLS</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-foreground">Amazon SES</h4>
              <p className="text-sm text-muted-foreground mb-2">SMTP Host: email-smtp.us-east-1.amazonaws.com</p>
              <p className="text-sm text-muted-foreground mb-2">Port: 587</p>
              <p className="text-sm text-muted-foreground">Encryption: TLS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
