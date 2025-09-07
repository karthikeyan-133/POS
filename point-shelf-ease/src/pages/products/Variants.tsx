import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface VariantAttribute {
  id: string;
  name: string;
  options: string[];
}

export default function ProductVariantsPage() {
  const [attributes, setAttributes] = useState<VariantAttribute[]>([]);
  const [name, setName] = useState('');
  const [options, setOptions] = useState('');

  const addAttribute = () => {
    if (!name) return;
    const opts = options.split(',').map(o => o.trim()).filter(Boolean);
    const newAttr: VariantAttribute = { id: Math.random().toString(36).slice(2), name, options: opts };
    setAttributes(prev => [newAttr, ...prev]);
    setName('');
    setOptions('');
  };

  return (
    <div className="space-y-8 p-1 bg-zepto-gradient-subtle">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Variants</h1>
        <p className="text-muted-foreground">Define variant attributes like size and color</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Attribute</CardTitle>
          <CardDescription>Add attributes and options (comma-separated)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Size" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="options">Options</Label>
              <Input id="options" value={options} onChange={(e) => setOptions(e.target.value)} placeholder="e.g. S, M, L" />
            </div>
          </div>
          <Button onClick={addAttribute}>Add</Button>
          {attributes.length > 0 && (
            <div className="mt-4 space-y-2">
              {attributes.map(a => (
                <div key={a.id} className="rounded border p-3">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-muted-foreground text-sm">{a.options.join(', ') || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


