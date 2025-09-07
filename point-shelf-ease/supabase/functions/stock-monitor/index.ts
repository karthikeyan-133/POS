import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  category_name?: string;
}

interface NotificationData {
  title: string;
  message: string;
  type: string;
  action_url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting stock monitoring...');

    // Get products with low stock
    const { data: lowStockProducts, error: stockError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        stock_quantity,
        min_stock_level,
        categories (name)
      `)
      .lte('stock_quantity', supabase.sql`min_stock_level`)
      .eq('is_active', true);

    if (stockError) {
      console.error('Error fetching low stock products:', stockError);
      throw stockError;
    }

    console.log(`Found ${lowStockProducts?.length || 0} low stock products`);

    // Get all users who should receive notifications (admins and managers)
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .in('role', ['admin', 'manager'])
      .eq('is_active', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users to notify`);

    if (lowStockProducts && lowStockProducts.length > 0 && users && users.length > 0) {
      const notifications: NotificationData[] = [];

      // Create notifications for each low stock product
      for (const product of lowStockProducts) {
        const notification: NotificationData = {
          title: 'Low Stock Alert',
          message: `${product.name} is running low (${product.stock_quantity} remaining, minimum: ${product.min_stock_level})`,
          type: 'warning',
          action_url: '/inventory'
        };

        // Send notification to all admin/manager users
        for (const user of users) {
          await supabase
            .from('notifications')
            .insert({
              user_id: user.user_id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              action_url: notification.action_url
            });
        }

        notifications.push(notification);
      }

      console.log(`Created ${notifications.length} stock alert notifications`);

      // Also check for completely out of stock products
      const { data: outOfStockProducts, error: outOfStockError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          categories (name)
        `)
        .eq('stock_quantity', 0)
        .eq('is_active', true);

      if (outOfStockError) {
        console.error('Error fetching out of stock products:', outOfStockError);
      } else if (outOfStockProducts && outOfStockProducts.length > 0) {
        console.log(`Found ${outOfStockProducts.length} out of stock products`);

        for (const product of outOfStockProducts) {
          const notification: NotificationData = {
            title: 'Out of Stock Alert',
            message: `${product.name} is completely out of stock!`,
            type: 'error',
            action_url: '/inventory'
          };

          for (const user of users) {
            await supabase
              .from('notifications')
              .insert({
                user_id: user.user_id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                action_url: notification.action_url
              });
          }
        }
      }
    }

    // Check for products with negative stock (error condition)
    const { data: negativeStockProducts, error: negativeError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .lt('stock_quantity', 0)
      .eq('is_active', true);

    if (negativeError) {
      console.error('Error checking negative stock:', negativeError);
    } else if (negativeStockProducts && negativeStockProducts.length > 0) {
      console.log(`Found ${negativeStockProducts.length} products with negative stock`);

      for (const product of negativeStockProducts) {
        const notification: NotificationData = {
          title: 'Negative Stock Error',
          message: `${product.name} has negative stock (${product.stock_quantity})! Please investigate.`,
          type: 'error',
          action_url: '/inventory'
        };

        if (users) {
          for (const user of users) {
            await supabase
              .from('notifications')
              .insert({
                user_id: user.user_id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                action_url: notification.action_url
              });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Stock monitoring completed',
        low_stock_count: lowStockProducts?.length || 0,
        out_of_stock_count: outOfStockProducts?.length || 0,
        negative_stock_count: negativeStockProducts?.length || 0
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error in stock-monitor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});