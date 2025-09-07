import { apiClient } from './api';

// Enhanced Expense interface to match backend
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

// Expense Service
export class ExpenseService {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    startDate?: string; 
    endDate?: string; 
  }): Promise<{ 
    expenses: EnhancedExpense[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return apiClient.get('/expenses', params);
  }

  async create(expense: ExpenseInsert, receiptFile?: File): Promise<{ 
    message: string; 
    expense: EnhancedExpense; 
  }> {
    if (receiptFile) {
      const formData = new FormData();
      Object.keys(expense).forEach(key => {
        const value = expense[key as keyof ExpenseInsert];
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      formData.append('receipt', receiptFile);
      
      return apiClient.post('/expenses', formData, true);
    } else {
      return apiClient.post('/expenses', expense);
    }
  }

  async update(id: string, updates: Partial<ExpenseInsert>, receiptFile?: File): Promise<{ 
    message: string; 
    expense: EnhancedExpense; 
  }> {
    if (receiptFile) {
      const formData = new FormData();
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof ExpenseInsert];
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      formData.append('receipt', receiptFile);
      
      return apiClient.put(`/expenses/${id}`, formData, true);
    } else {
      return apiClient.put(`/expenses/${id}`, updates);
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/expenses/${id}`);
  }

  async getById(id: string): Promise<{ expense: EnhancedExpense }> {
    return apiClient.get(`/expenses/${id}`);
  }

  // Legacy methods for compatibility
  async generateReference(): Promise<string> {
    // This will be handled by the backend now
    return 'EXP-000001';
  }

  async getByCategory(category: string): Promise<EnhancedExpense[]> {
    const response = await this.getAll({ category });
    return response.expenses;
  }

  async getByDateRange(startDate: string, endDate: string): Promise<EnhancedExpense[]> {
    const response = await this.getAll({ startDate, endDate });
    return response.expenses;
  }
}

// Customer Service
export class CustomerService {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
  }): Promise<{
    customers: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return apiClient.get('/customers', params);
  }

  async create(customer: any): Promise<{ message: string; customer: any }> {
    return apiClient.post('/customers', customer);
  }

  async update(id: string, updates: any): Promise<{ message: string; customer: any }> {
    return apiClient.put(`/customers/${id}`, updates);
  }

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/customers/${id}`);
  }

  async getById(id: string): Promise<{ customer: any }> {
    return apiClient.get(`/customers/${id}`);
  }

  async searchByName(name: string): Promise<{ customers: any[] }> {
    return apiClient.get(`/customers/search/${name}`);
  }
}

// Supplier Service
export class SupplierService {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
  }): Promise<{
    suppliers: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return apiClient.get('/suppliers', params);
  }

  async create(supplier: any): Promise<{ message: string; supplier: any }> {
    return apiClient.post('/suppliers', supplier);
  }

  async update(id: string, updates: any): Promise<{ message: string; supplier: any }> {
    return apiClient.put(`/suppliers/${id}`, updates);
  }

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/suppliers/${id}`);
  }

  async getById(id: string): Promise<{ supplier: any }> {
    return apiClient.get(`/suppliers/${id}`);
  }
}

// Product Service
export class ProductService {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    category_id?: string;
    active_only?: boolean;
  }): Promise<{
    products: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return apiClient.get('/products', params);
  }

  async create(product: any): Promise<{ message: string; product: any }> {
    return apiClient.post('/products', product);
  }

  async update(id: string, updates: any): Promise<{ message: string; product: any }> {
    return apiClient.put(`/products/${id}`, updates);
  }

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/products/${id}`);
  }

  async getById(id: string): Promise<{ product: any }> {
    return apiClient.get(`/products/${id}`);
  }

  async getLowStock(): Promise<{ products: any[] }> {
    return apiClient.get('/products/alerts/low-stock');
  }
}

// Export service instances
export const expenseService = new ExpenseService();
export const customerService = new CustomerService();
export const supplierService = new SupplierService();
export const productService = new ProductService();

// File upload helper (replaced Supabase storage)
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  // This is now handled by the individual service endpoints
  // For example, expenses handle receipt uploads internally
  throw new Error('File upload should be handled by specific service endpoints');
};

// Error handling wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage || 'API operation failed:', error);
    throw error;
  }
};