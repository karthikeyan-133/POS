import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, ArrowLeft, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function AddNewProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category_id: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
    min_stock_level: '10',
    image_url: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        setCategories(data || []);
      } catch {
        toast.error('Failed to load categories');
      }
    })();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        barcode: formData.barcode || null,
        category_id: formData.category_id || null,
        description: formData.description || null,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        min_stock_level: parseInt(formData.min_stock_level) || 10,
        image_url: formData.image_url || null,
      };

      const { error } = await supabase
        .from('products')
        .insert([payload]);
      if (error) throw error;
      toast.success('Product created successfully');
      navigate('/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Add Product</h1>
            <p className="text-lg text-muted-foreground">Create a new product in your inventory</p>
          </div>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-green/5 to-vibrant-teal/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="text-xl font-bold text-white">Product Details</CardTitle>
          <CardDescription className="text-base text-white/90">
            Fill in the information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Product Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)} 
                  required 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-foreground">Barcode</Label>
                <Input 
                  id="barcode" 
                  value={formData.barcode} 
                  onChange={(e) => handleInputChange('barcode', e.target.value)} 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger className="border-vibrant-green/30 focus:ring-vibrant-green">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-foreground">Image URL</Label>
                <Input 
                  id="image_url" 
                  value={formData.image_url} 
                  onChange={(e) => handleInputChange('image_url', e.target.value)} 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => handleInputChange('description', e.target.value)} 
                className="border-vibrant-green/30 focus:ring-vibrant-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_price" className="text-foreground">Purchase Price *</Label>
                <Input 
                  id="purchase_price" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formData.purchase_price} 
                  onChange={(e) => handleInputChange('purchase_price', e.target.value)} 
                  required 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling_price" className="text-foreground">Selling Price *</Label>
                <Input 
                  id="selling_price" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formData.selling_price} 
                  onChange={(e) => handleInputChange('selling_price', e.target.value)} 
                  required 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity" className="text-foreground">Stock Quantity *</Label>
                <Input 
                  id="stock_quantity" 
                  type="number" 
                  min="0" 
                  value={formData.stock_quantity} 
                  onChange={(e) => handleInputChange('stock_quantity', e.target.value)} 
                  required 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock_level" className="text-foreground">Min Stock Level</Label>
                <Input 
                  id="min_stock_level" 
                  type="number" 
                  min="0" 
                  value={formData.min_stock_level} 
                  onChange={(e) => handleInputChange('min_stock_level', e.target.value)} 
                  className="border-vibrant-green/30 focus:ring-vibrant-green"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-vibrant-green/20">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/products')}
                className="border-vibrant-red/30 text-vibrant-red hover:bg-vibrant-red/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
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
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}