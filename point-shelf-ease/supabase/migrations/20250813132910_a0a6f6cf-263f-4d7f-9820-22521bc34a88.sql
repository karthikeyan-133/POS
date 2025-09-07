-- Fix function search path security warnings
-- Update existing functions to have secure search paths

-- Fix generate_sale_number function
CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  next_num INTEGER;
  sale_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM 5) AS INTEGER)), 0) + 1 
  INTO next_num
  FROM public.sales 
  WHERE sale_number LIKE 'SAL-%';
  
  sale_num := 'SAL-' || LPAD(next_num::TEXT, 6, '0');
  RETURN sale_num;
END;
$$;

-- Fix update_product_stock function
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Update product stock when sale item is inserted
  UPDATE public.products 
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  -- Create inventory transaction
  INSERT INTO public.inventory_transactions (
    product_id, 
    transaction_type, 
    quantity_change, 
    reference_id,
    user_id
  ) VALUES (
    NEW.product_id,
    'sale',
    -NEW.quantity,
    NEW.sale_id,
    (SELECT cashier_id FROM public.sales WHERE id = NEW.sale_id)
  );
  
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    'cashier'
  );
  RETURN NEW;
END;
$$;

-- Fix update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix generate_purchase_order_number function
CREATE OR REPLACE FUNCTION public.generate_purchase_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  next_num INTEGER;
  po_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)), 0) + 1 
  INTO next_num
  FROM public.purchase_orders 
  WHERE order_number LIKE 'PO-%';
  
  po_num := 'PO-' || LPAD(next_num::TEXT, 6, '0');
  RETURN po_num;
END;
$$;