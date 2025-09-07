import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Unit {
  id: string;
  name: string;
  short: string;
}

export default function ProductUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState({ name: '', short: '' });

  const addUnit = () => {
    if (!form.name || !form.short) return;
    const newUnit: Unit = { id: Math.random().toString(36).slice(2), name: form.name, short: form.short };
    setUnits((prev) => [newUnit, ...prev]);
    setForm({ name: '', short: '' });
  };

  return (
    <div className="space-y-8 p-1 bg-zepto-gradient-subtle">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Units</h1>
        <p className="text-muted-foreground">Define units of measure</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Unit</CardTitle>
          <CardDescription>Create and manage units</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short">Short code</Label>
              <Input id="short" value={form.short} onChange={(e) => setForm((f) => ({ ...f, short: e.target.value }))} />
            </div>
          </div>
          <Button onClick={addUnit}>Add</Button>
          {units.length > 0 && (
            <div className="mt-4 space-y-2">
              {units.map(u => (
                <div key={u.id} className="flex items-center justify-between rounded border p-3">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-muted-foreground">{u.short}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


