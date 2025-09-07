import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface LabelItem {
  id: string;
  name: string;
  barcode: string;
  copies: number;
}

export default function PrintLabelsPage() {
  const [items, setItems] = useState<LabelItem[]>([]);
  const [form, setForm] = useState({ name: '', barcode: '', copies: '1' });

  const addItem = () => {
    if (!form.name) return;
    const item: LabelItem = {
      id: Math.random().toString(36).slice(2),
      name: form.name,
      barcode: form.barcode,
      copies: Math.max(1, parseInt(form.copies) || 1),
    };
    setItems(prev => [item, ...prev]);
    setForm({ name: '', barcode: '', copies: '1' });
  };

  const print = () => {
    window.print();
  };

  return (
    <div className="space-y-8 p-1 bg-zepto-gradient-subtle">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Print Labels</h1>
        <p className="text-muted-foreground">Generate printable product labels</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Item</CardTitle>
          <CardDescription>Prepare labels to print</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" value={form.barcode} onChange={(e) => setForm(f => ({ ...f, barcode: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="copies">Copies</Label>
              <Input id="copies" type="number" min="1" value={form.copies} onChange={(e) => setForm(f => ({ ...f, copies: e.target.value }))} />
            </div>
          </div>
          <Button onClick={addItem}>Add</Button>

          {items.length > 0 && (
            <div className="mt-6">
              <div className="grid grid-cols-3 gap-4 print:grid-cols-4">
                {items.flatMap(item => Array.from({ length: item.copies }).map((_, i) => (
                  <div key={`${item.id}-${i}`} className="border rounded p-3 text-sm bg-white">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-muted-foreground">{item.barcode || '—'}</div>
                    {/* Placeholder for future barcode SVG */}
                  </div>
                )))}
              </div>
              <div className="mt-4">
                <Button onClick={print}>Print</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


