-- Enhance expenses table to match application requirements
-- Drop existing expenses table and recreate with new schema

DROP TABLE IF EXISTS public.expenses CASCADE;

-- Create enhanced expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(10,2) NOT NULL,
  expense_category TEXT NOT NULL,
  user_name TEXT NOT NULL,
  store_location TEXT NOT NULL,
  tax NUMERIC(10,2) DEFAULT 0,
  total_tax NUMERIC(10,2) DEFAULT 0,
  receipt_file_url TEXT,
  receipt_file_name TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage expenses" ON public.expenses FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON public.expenses 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create function to generate expense reference numbers
CREATE OR REPLACE FUNCTION public.generate_expense_reference()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  next_num INTEGER;
  exp_ref TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM 5) AS INTEGER)), 0) + 1 
  INTO next_num
  FROM public.expenses 
  WHERE reference LIKE 'EXP-%';
  
  exp_ref := 'EXP-' || LPAD(next_num::TEXT, 6, '0');
  RETURN exp_ref;
END;
$$;

-- Insert sample expense data
INSERT INTO public.expenses (
  reference, expense_date, amount, expense_category, user_name, store_location, tax, total_tax, notes
) VALUES 
('EXP-000001', '2025-02-01', 150.00, 'Office Expenses', 'John Doe', 'Main Store', 15.00, 15.00, 'Printer paper, pens, and notebooks'),
('EXP-000002', '2025-02-03', 89.99, 'Utilities', 'Jane Smith', 'Branch A', 9.00, 9.00, 'Monthly internet service'),
('EXP-000003', '2025-02-05', 500.00, 'Marketing', 'Mike Johnson', 'Main Store', 50.00, 50.00, 'Social media advertising'),
('EXP-000004', '2025-02-07', 250.00, 'Equipment', 'Sarah Wilson', 'Branch B', 25.00, 25.00, 'Computer repairs and maintenance'),
('EXP-000005', '2025-02-09', 320.50, 'Travel', 'David Brown', 'Main Store', 32.05, 32.05, 'Business trip to client meeting');

-- Create damage_stock table for damage stock management
CREATE TABLE public.damage_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for damage_stock
ALTER TABLE public.damage_stock ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for damage_stock
CREATE POLICY "Authenticated users can manage damage stock" ON public.damage_stock FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_damage_stock_updated_at 
  BEFORE UPDATE ON public.damage_stock 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create inquiry table for inquiry management
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  response TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inquiries
CREATE POLICY "Authenticated users can manage inquiries" ON public.inquiries FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_inquiries_updated_at 
  BEFORE UPDATE ON public.inquiries 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create reminders table
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reminder_date DATE NOT NULL,
  reminder_time TIME,
  is_completed BOOLEAN DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reminders
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reminders
CREATE POLICY "Users can manage their own reminders" ON public.reminders FOR ALL USING (auth.uid() = created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_reminders_updated_at 
  BEFORE UPDATE ON public.reminders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create roles table for user role management
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for roles
CREATE POLICY "Authenticated users can view roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Admin users can manage roles" ON public.roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_roles_updated_at 
  BEFORE UPDATE ON public.roles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default roles
INSERT INTO public.roles (name, description, permissions) VALUES 
('admin', 'Administrator with full access', '{"all": true}'),
('manager', 'Manager with limited admin access', '{"sales": true, "purchases": true, "inventory": true, "reports": true}'),
('cashier', 'Cashier with basic access', '{"pos": true, "sales": true}'),
('inventory_manager', 'Inventory manager', '{"inventory": true, "products": true, "purchases": true}');

-- Add purchase_requests table (separate from purchase_orders)
CREATE TABLE public.purchase_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES public.suppliers(id),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  store_location TEXT NOT NULL,
  total_amount NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_request_items table
CREATE TABLE public.purchase_request_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_request_id UUID REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for purchase requests
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can manage purchase requests" ON public.purchase_requests FOR ALL USING (true);
CREATE POLICY "Authenticated users can manage purchase request items" ON public.purchase_request_items FOR ALL USING (true);

-- Add triggers
CREATE TRIGGER update_purchase_requests_updated_at 
  BEFORE UPDATE ON public.purchase_requests 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Generate function for purchase request numbers
CREATE OR REPLACE FUNCTION public.generate_purchase_request_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  next_num INTEGER;
  pr_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 4) AS INTEGER)), 0) + 1 
  INTO next_num
  FROM public.purchase_requests 
  WHERE request_number LIKE 'PR-%';
  
  pr_num := 'PR-' || LPAD(next_num::TEXT, 6, '0');
  RETURN pr_num;
END;
$$;