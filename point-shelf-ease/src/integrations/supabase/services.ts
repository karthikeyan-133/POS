import { supabase } from './client';

// Enhanced Expense interface to match our new schema
export interface EnhancedExpense {
  id: string;
  reference: string;
  expense_date: string;
  amount: number;
  expense_category: string;
  user_name: string;
  store_location: string;
  tax: number;
  total_tax: number;
  receipt_file_url?: string;
  receipt_file_name?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert {
  expense_date: string;
  amount: number;
  expense_category: string;
  user_name: string;
  store_location: string;
  tax?: number;
  total_tax?: number;
  receipt_file_url?: string;
  receipt_file_name?: string;
  notes?: string;
  created_by?: string;
}

// Expense Service with direct database operations
export class ExpenseService {
  async getAll(): Promise<EnhancedExpense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
    return (data || []) as unknown as EnhancedExpense[];
  }

  async create(expense: ExpenseInsert): Promise<EnhancedExpense> {
    // Generate reference number
    const reference = await this.generateReference();
    
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expense,
        reference,
      } as any)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
    return data as unknown as EnhancedExpense;
  }

  async generateReference(): Promise<string> {
    // Simple reference generation - get the latest expense and increment
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error generating reference:', error);
      return 'EXP-000001';
    }
    
    if (!data || data.length === 0) {
      return 'EXP-000001';
    }
    
    // Try to extract reference from any available field
    const lastItem = data[0] as any;
    const lastRef = lastItem.reference || lastItem.description || '';
    
    if (lastRef.includes('EXP-')) {
      const lastNum = parseInt(lastRef.split('-')[1]) || 0;
      const nextNum = lastNum + 1;
      return `EXP-${String(nextNum).padStart(6, '0')}`;
    }
    
    return 'EXP-000001';
  }

  async update(id: string, updates: Partial<ExpenseInsert>): Promise<EnhancedExpense> {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
    return data as unknown as EnhancedExpense;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async getByCategory(category: string): Promise<EnhancedExpense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('expense_category', category)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching expenses by category:', error);
      throw error;
    }
    return (data || []) as unknown as EnhancedExpense[];
  }

  async getByDateRange(startDate: string, endDate: string): Promise<EnhancedExpense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching expenses by date range:', error);
      throw error;
    }
    return (data || []) as unknown as EnhancedExpense[];
  }
}

// Customer Service
export class CustomerService {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
    return data || [];
  }

  async create(customer: any): Promise<any> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
    return data;
  }

  async update(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  async searchByName(name: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .ilike('name', `%${name}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
    return data || [];
  }
}

// Supplier Service
export class SupplierService {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
    return data || [];
  }

  async create(supplier: any): Promise<any> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
    return data;
  }

  async update(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }
}

// Export service instances
export const expenseService = new ExpenseService();
export const customerService = new CustomerService();
export const supplierService = new SupplierService();

// File upload helper
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

// Error handling wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage || 'Database operation failed:', error);
    throw error;
  }
};