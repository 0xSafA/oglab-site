/**
 * Orders API
 * CRUD operations for orders
 */

import { NextRequest } from 'next/server';
import { 
  createOrderServer,
  type OrderItem,
  type ContactInfo,
  type PaymentMethod
} from '@/lib/orders-db';
import { getSupabaseServer } from '@/lib/supabase-client';

// GET: Get user's orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userProfileId = searchParams.get('userProfileId');
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    
    const supabase = getSupabaseServer();
    
    // Get single order by ID
    if (orderId) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) {
        console.error('Error fetching order:', error);
        return Response.json({ error: 'Order not found' }, { status: 404 });
      }
      
      return Response.json(data);
    }
    
    // Get single order by number
    if (orderNumber) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();
      
      if (error) {
        console.error('Error fetching order:', error);
        return Response.json({ error: 'Order not found' }, { status: 404 });
      }
      
      return Response.json(data);
    }
    
    // Get all orders for a user
    if (userProfileId) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
      }
      
      return Response.json(data || []);
    }
    
    return Response.json({ error: 'Missing required parameter' }, { status: 400 });
    
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userProfileId,
      conversationId,
      items,
      contactInfo,
      deliveryAddress,
      deliveryNotes,
      paymentMethod,
      deliveryFee = 0,
      discount = 0,
      orderSource = 'web',
    } = body;
    
    // Validation
    if (!userProfileId || !items || !Array.isArray(items) || items.length === 0) {
      return Response.json(
        { error: 'Missing required fields: userProfileId, items' },
        { status: 400 }
      );
    }
    
    if (!contactInfo || !contactInfo.name || !contactInfo.phone) {
      return Response.json(
        { error: 'Missing contact info: name and phone are required' },
        { status: 400 }
      );
    }
    
    if (!deliveryAddress) {
      return Response.json(
        { error: 'Missing delivery address' },
        { status: 400 }
      );
    }
    
    if (!paymentMethod) {
      return Response.json(
        { error: 'Missing payment method' },
        { status: 400 }
      );
    }
    
    // Create order
    const order = await createOrderServer({
      userProfileId,
      conversationId,
      items: items as OrderItem[],
      contactInfo: contactInfo as ContactInfo,
      deliveryAddress,
      deliveryNotes,
      paymentMethod: paymentMethod as PaymentMethod,
      deliveryFee,
      discount,
      orderSource,
    });
    
    console.log('✅ Order created:', order.order_number);
    
    return Response.json(order, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return Response.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PATCH: Update order status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, note } = body;
    
    if (!orderId || !status) {
      return Response.json(
        { error: 'Missing required fields: orderId, status' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseServer();
    
    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status_history')
      .eq('id', orderId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching order:', fetchError);
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Update status history
    const statusHistory = [
      ...(currentOrder.status_history || []),
      {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status changed to ${status}`,
      },
    ];
    
    const updates: Record<string, unknown> = {
      status,
      status_history: statusHistory,
    };
    
    // Update timestamps based on status
    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      updates.actual_delivery = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order:', error);
      return Response.json({ error: 'Failed to update order' }, { status: 500 });
    }
    
    console.log('✅ Order status updated:', orderId, status);
    
    return Response.json(data);
    
  } catch (error) {
    console.error('Error in PATCH /api/orders:', error);
    return Response.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

