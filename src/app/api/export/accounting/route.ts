/**
 * Accounting Export API
 * ERP system integration endpoints
 */

import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

/**
 * GET: Export accounting data
 * Query params:
 * - format: 'json' | 'csv' | 'xml'
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - type: 'orders' | 'revenue' | 'expenses' | 'inventory'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') || 'orders';
    
    // Validate dates
    if (!startDate || !endDate) {
      return Response.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseServer();
    let data: Record<string, unknown>;
    
    switch (type) {
      case 'orders':
        data = await exportOrders(supabase, startDate, endDate);
        break;
      case 'revenue':
        data = await exportRevenue(supabase, startDate, endDate);
        break;
      case 'expenses':
        data = await exportExpenses(supabase, startDate, endDate);
        break;
      case 'inventory':
        data = await exportInventory(supabase);
        break;
      default:
        return Response.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }
    
    // Format response
    switch (format) {
      case 'json':
        return Response.json(data);
      
      case 'csv':
        const csv = convertToCSV(data);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${type}_${startDate}_${endDate}.csv"`,
          },
        });
      
      case 'xml':
        const xml = convertToXML(data, type);
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="${type}_${startDate}_${endDate}.xml"`,
          },
        });
      
      default:
        return Response.json(data);
    }
    
  } catch (error) {
    console.error('Error in GET /api/export/accounting:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Export orders
 */
async function exportOrders(supabase: ReturnType<typeof getSupabaseServer>, startDate: string, endDate: string) {
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });
  
  return {
    export_date: new Date().toISOString(),
    period: { start: startDate, end: endDate },
    type: 'orders',
    count: orders?.length || 0,
    data: orders?.map((order: Record<string, unknown>) => ({
      order_id: order.id,
      order_number: order.order_number,
      date: order.created_at,
      customer_name: order.contact_info.name,
      customer_phone: order.contact_info.phone,
      status: order.status,
      items: order.items,
      subtotal: parseFloat(order.subtotal),
      delivery_fee: parseFloat(order.delivery_fee),
      discount: parseFloat(order.discount),
      total_amount: parseFloat(order.total_amount),
      currency: order.currency,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      delivery_address: order.delivery_address,
    })) || [],
  };
}

/**
 * Export revenue summary
 */
async function exportRevenue(supabase: ReturnType<typeof getSupabaseServer>, startDate: string, endDate: string) {
  const { data: orders } = await supabase
    .from('orders')
    .select('created_at, total_amount, status, payment_method')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .in('status', ['completed', 'delivering'])
    .order('created_at', { ascending: true });
  
  const totalRevenue = orders?.reduce((sum: number, order: Record<string, unknown>) => 
    sum + parseFloat(String(order.total_amount)), 0) || 0;
  
  // Group by day
  const revenueByDay = orders?.reduce((acc: Record<string, { date: string; revenue: number; orders: number }>, order: Record<string, unknown>) => {
    const date = String(order.created_at).split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, orders: 0 };
    }
    acc[date].revenue += parseFloat(String(order.total_amount));
    acc[date].orders += 1;
    return acc;
  }, {});
  
  // Group by payment method
  const revenueByPayment = orders?.reduce((acc: Record<string, { method: string; revenue: number; orders: number }>, order: Record<string, unknown>) => {
    const method = String(order.payment_method);
    if (!acc[method]) {
      acc[method] = { method, revenue: 0, orders: 0 };
    }
    acc[method].revenue += parseFloat(String(order.total_amount));
    acc[method].orders += 1;
    return acc;
  }, {});
  
  return {
    export_date: new Date().toISOString(),
    period: { start: startDate, end: endDate },
    type: 'revenue',
    summary: {
      total_revenue: totalRevenue,
      total_orders: orders?.length || 0,
      average_order_value: orders?.length ? totalRevenue / orders.length : 0,
    },
    by_day: Object.values(revenueByDay || {}),
    by_payment_method: Object.values(revenueByPayment || {}),
  };
}

/**
 * Export expenses (placeholder)
 */
async function exportExpenses(supabase: ReturnType<typeof getSupabaseServer>, startDate: string, endDate: string) {
  // TODO: Implement expenses tracking
  // For now, return delivery costs as expenses
  
  const { data: orders } = await supabase
    .from('orders')
    .select('created_at, delivery_fee, discount')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });
  
  const totalExpenses = orders?.reduce((sum: number, order: Record<string, unknown>) => 
    sum + parseFloat(String(order.delivery_fee || 0)) + parseFloat(String(order.discount || 0)), 0) || 0;
  
  return {
    export_date: new Date().toISOString(),
    period: { start: startDate, end: endDate },
    type: 'expenses',
    summary: {
      total_expenses: totalExpenses,
      delivery_costs: orders?.reduce((sum: number, o: Record<string, unknown>) => sum + parseFloat(String(o.delivery_fee || 0)), 0) || 0,
      discounts_given: orders?.reduce((sum: number, o: Record<string, unknown>) => sum + parseFloat(String(o.discount || 0)), 0) || 0,
    },
    note: 'Expenses tracking will be enhanced in future updates',
  };
}

/**
 * Export inventory (from menu items)
 */
async function exportInventory(supabase: ReturnType<typeof getSupabaseServer>) {
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .order('Name', { ascending: true });
  
  return {
    export_date: new Date().toISOString(),
    type: 'inventory',
    count: menuItems?.length || 0,
    data: menuItems?.map((item: Record<string, unknown>) => ({
      id: item.id,
      name: item.Name,
      category: item.Category,
      type: item.Type,
      thc: item.THC,
      cbg: item.CBG,
      price_1g: item.Price_1g,
      price_5g: item.Price_5g,
      price_20g: item.Price_20g,
      our_production: item.Our,
      in_stock: true, // TODO: Implement actual stock tracking
    })) || [],
  };
}

/**
 * Convert data to CSV
 */
function convertToCSV(data: Record<string, unknown>): string {
  if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
    return 'No data available';
  }
  
  const items = data.data;
  const headers = Object.keys(items[0]);
  
  let csv = headers.join(',') + '\n';
  
  items.forEach((item: Record<string, unknown>) => {
    const values = headers.map(header => {
      const value = item[header];
      // Handle nested objects and arrays
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Convert data to XML
 */
function convertToXML(data: Record<string, unknown>, type: string): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<export type="${type}" date="${data.export_date}">\n`;
  
  if (data.period) {
    xml += `  <period start="${data.period.start}" end="${data.period.end}"/>\n`;
  }
  
  if (data.summary) {
    xml += '  <summary>\n';
    Object.entries(data.summary).forEach(([key, value]) => {
      xml += `    <${key}>${value}</${key}>\n`;
    });
    xml += '  </summary>\n';
  }
  
  if (data.data && Array.isArray(data.data)) {
    xml += `  <items count="${data.data.length}">\n`;
    data.data.forEach((item: Record<string, unknown>) => {
      xml += '    <item>\n';
      Object.entries(item).forEach(([key, value]) => {
        const safeValue = typeof value === 'object' 
          ? JSON.stringify(value)
          : String(value).replace(/[<>&'"]/g, char => {
              const entities: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
              return entities[char];
            });
        xml += `      <${key}>${safeValue}</${key}>\n`;
      });
      xml += '    </item>\n';
    });
    xml += '  </items>\n';
  }
  
  xml += '</export>';
  
  return xml;
}

/**
 * POST: Webhook for ERP system (receive data)
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log webhook data for debugging
    console.log('📥 Accounting webhook received:', data);
    
    // TODO: Process incoming data from ERP system
    // Examples:
    // - Update stock levels
    // - Sync customer data
    // - Import expenses
    // - Sync payments
    
    return Response.json({
      success: true,
      message: 'Data received',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in POST /api/export/accounting:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

