import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface TaxRate {
  id: string;
  name: string;
  rate: number; // percentage
}

export default function ProductTaxPage() {
  const [taxes, setTaxes] = useState<TaxRate[]>([]);
  const [form, setForm] = useState({ name: '', rate: '' });

  const addTax = () => {
    if (!form.name || form.rate === '') return;
    const newTax: TaxRate = { id: Math.random().toString(36).slice(2), name: form.name, rate: parseFloat(form.rate) };
    setTaxes((prev) => [newTax, ...prev]);
    setForm({ name: '', rate: '' });
  };

  return (
    <div className="space-y-8 p-1 bg-zepto-gradient-subtle">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tax</h1>
        <p className="text-muted-foreground">Configure product tax rates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Tax</CardTitle>
          <CardDescription>Create tax rates to apply on products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate (%)</Label>
              <Input id="rate" type="number" step="0.01" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))} />
            </div>
          </div>
          <Button onClick={addTax}>Add</Button>
          {taxes.length > 0 && (
            <div className="mt-4 space-y-2">
              {taxes.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded border p-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-muted-foreground">{t.rate}%</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


