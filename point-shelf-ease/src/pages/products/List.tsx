import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Search, Edit, Trash2, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  barcode: string;
  category_id: string;
  description: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_level: number;
  image_url: string;
  is_active: boolean;
  categories?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function ProductListPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
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
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .order('created_at', { ascending: false });

      setProducts(data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      setCategories(data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
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
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
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

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode || '',
      category_id: product.category_id || '',
      description: product.description || '',
      purchase_price: product.purchase_price.toString(),
      selling_price: product.selling_price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      min_stock_level: product.min_stock_level.toString(),
      image_url: product.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', product.id);

      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-8 p-1 bg-gradient-subtle min-h-screen">
      <div className="rounded-xl p-6 border-2 bg-white border-border shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground bg-gradient-hero bg-clip-text text-transparent">Products</h1>
            <p className="text-lg text-muted-foreground">Manage your product inventory</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => navigate('/products/add')} className="hover:shadow-lg transition-all duration-300 bg-vibrant-green hover:bg-vibrant-green/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }} 
              variant="gradient" 
              className="hover:shadow-lg transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Quick Add
            </Button>
          </div>
        </div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-vibrant-green/5 to-vibrant-teal/5">
        <CardHeader className="bg-gradient-primary rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            Product List
          </CardTitle>
          <CardDescription className="text-base text-white/90">
            All products in your inventory
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus-visible:ring-white/50" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-purple"></div>
              <span className="ml-2 text-muted-foreground">Loading products...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-vibrant-green/10 hover:bg-vibrant-green/20">
                  <TableHead className="text-vibrant-green font-semibold">Product Name</TableHead>
                  <TableHead className="text-vibrant-green font-semibold">Category</TableHead>
                  <TableHead className="text-vibrant-green font-semibold">Barcode</TableHead>
                  <TableHead className="text-vibrant-green font-semibold">Purchase Price</TableHead>
                  <TableHead className="text-vibrant-green font-semibold">Selling Price</TableHead>
                  <TableHead className="text-vibrant-green font-semibold">Stock</TableHead>
                  <TableHead className="text-vibrant-green font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id} className="hover:bg-vibrant-green/5 transition-colors">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.categories?.name || 'Uncategorized'}</TableCell>
                    <TableCell>{product.barcode || '-'}</TableCell>
                    <TableCell>${product.purchase_price.toFixed(2)}</TableCell>
                    <TableCell>${product.selling_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.stock_quantity <= product.min_stock_level ? "destructive" : "secondary"}
                        className={
                          product.stock_quantity <= product.min_stock_level 
                            ? "bg-vibrant-red text-white" 
                            : "bg-vibrant-green/10 text-vibrant-green"
                        }
                      >
                        {product.stock_quantity} in stock
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(product)}
                          className="text-vibrant-blue hover:bg-vibrant-blue/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product)}
                          className="text-vibrant-red hover:bg-vibrant-red/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-vibrant-green/30" />
              <p className="text-muted-foreground mt-2">No products found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-vibrant-blue">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details' : 'Create a new product'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Product Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)} 
                  required 
                  className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-foreground">Barcode</Label>
                <Input 
                  id="barcode" 
                  value={formData.barcode} 
                  onChange={(e) => handleInputChange('barcode', e.target.value)} 
                  className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger className="border-vibrant-blue/30 focus:ring-vibrant-blue">
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
                  className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => handleInputChange('description', e.target.value)} 
                className="border-vibrant-blue/30 focus:ring-vibrant-blue"
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
                  className="border-vibrant-blue/30 focus:ring-vibrant-blue"
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
                  className="border-vibrant-blue/30 focus:ring-vibrant-blue"
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
                  className="border-vibrant-blue/30 focus:ring-vibrant-blue"
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
                  className="border-vibrant-blue/30 focus:ring-vibrant-blue"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-vibrant-blue/30 text-vibrant-blue hover:bg-vibrant-blue/10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-primary hover:opacity-90"
              >
                {editingProduct ? 'Update Product' : 'Save Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}