import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Brand {
  id: string;
  name: string;
}

export default function ProductBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState('');

  const addBrand = () => {
    if (!name) return;
    const newBrand: Brand = { id: Math.random().toString(36).slice(2), name };
    setBrands((prev) => [newBrand, ...prev]);
    setName('');
  };

  return (
    <div className="space-y-8 p-1 bg-zepto-gradient-subtle">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Brands</h1>
        <p className="text-muted-foreground">Create and manage product brands</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Brand</CardTitle>
          <CardDescription>Simple brand management (in-memory demo)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <Button onClick={addBrand}>Add</Button>
          {brands.length > 0 && (
            <div className="mt-4 space-y-2">
              {brands.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded border p-3">
                  <div className="font-medium">{b.name}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


