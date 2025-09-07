import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, Save, BookOpen, Video, FileText } from 'lucide-react';

interface HelpContent {
  id: string;
  page_name: string;
  title: string;
  content: string;
  video_url: string;
  is_active: boolean;
  category: string;
}

export default function PageHelperPage() {
  const { toast } = useToast();
  const [helpContents, setHelpContents] = useState<HelpContent[]>([
    {
      id: '1',
      page_name: 'dashboard',
      title: 'Dashboard Overview',
      content: 'The dashboard provides an overview of your business metrics including sales, inventory, and customer data.',
      video_url: 'https://example.com/dashboard-help.mp4',
      is_active: true,
      category: 'General'
    },
    {
      id: '2',
      page_name: 'pos',
      title: 'Point of Sale Guide',
      content: 'Learn how to process sales, handle payments, and manage transactions using the POS system.',
      video_url: 'https://example.com/pos-help.mp4',
      is_active: true,
      category: 'Sales'
    }
  ]);
  const [selectedContent, setSelectedContent] = useState<HelpContent | null>(null);
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Help content saved successfully",
      });
      setEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save help content",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (content: HelpContent) => {
    setSelectedContent(content);
    setEditing(true);
  };

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader className="bg-slate-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-foreground flex items-center">
            <HelpCircle className="mr-2 h-5 w-5" />
            Page Helper & Documentation
          </CardTitle>
          <CardDescription>Manage help content and documentation for different pages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="page_name">Page Name</Label>
              <Select value={selectedContent?.page_name || ''} onValueChange={(value) => setSelectedContent(prev => prev ? {...prev, page_name: value} : null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="pos">Point of Sale</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="reports">Reports</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedContent?.category || ''} onValueChange={(value) => setSelectedContent(prev => prev ? {...prev, category: value} : null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Inventory">Inventory</SelectItem>
                  <SelectItem value="Customers">Customers</SelectItem>
                  <SelectItem value="Reports">Reports</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Help Title</Label>
            <Input
              id="title"
              value={selectedContent?.title || ''}
              onChange={(e) => setSelectedContent(prev => prev ? {...prev, title: e.target.value} : null)}
              placeholder="Enter help title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Help Content</Label>
            <Textarea
              id="content"
              value={selectedContent?.content || ''}
              onChange={(e) => setSelectedContent(prev => prev ? {...prev, content: e.target.value} : null)}
              rows={6}
              placeholder="Enter detailed help content..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL (Optional)</Label>
            <Input
              id="video_url"
              value={selectedContent?.video_url || ''}
              onChange={(e) => setSelectedContent(prev => prev ? {...prev, video_url: e.target.value} : null)}
              placeholder="https://example.com/help-video.mp4"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={selectedContent?.is_active || false}
              onCheckedChange={(checked) => setSelectedContent(prev => prev ? {...prev, is_active: checked as boolean} : null)}
            />
            <Label htmlFor="is_active">Help content is active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Help Content
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 border border-border bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Existing Help Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {helpContents.map((content) => (
              <div key={content.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{content.title}</h4>
                    <p className="text-sm text-muted-foreground">{content.page_name} • {content.category}</p>
                    <p className="text-sm mt-2">{content.content.substring(0, 100)}...</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {content.video_url && (
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-1" />
                        Video
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(content)}>
                      <FileText className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
