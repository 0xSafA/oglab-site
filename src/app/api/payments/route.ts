/**
 * Payment Integration API
 * Stripe, Crypto, and other payment methods
 */

import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-client';

/**
 * POST: Create payment intent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      currency = 'THB',
      paymentMethod, // 'card', 'crypto', 'bank_transfer'
    } = body;
    
    if (!orderId || !amount || !paymentMethod) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseServer();
    
    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', String(orderId))
      .single();
    
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    
    let paymentIntent: Record<string, unknown>;
    
    switch (paymentMethod) {
      case 'card':
        paymentIntent = await createStripePayment(order, amount, currency);
        break;
      
      case 'crypto':
        paymentIntent = await createCryptoPayment(order, amount, currency);
        break;
      
      case 'bank_transfer':
        paymentIntent = await createBankTransferPayment(order, amount, currency);
        break;
      
      default:
        return Response.json(
          { error: 'Unsupported payment method' },
          { status: 400 }
        );
    }
    
    // Update order with payment intent
    await supabase
      .from('orders')
      .update({
        metadata: {
          ...order.metadata,
          payment_intent: paymentIntent,
        },
      })
      .eq('id', String(orderId));
    
    return Response.json(paymentIntent);
    
  } catch (error) {
    console.error('Error creating payment:', error);
    return Response.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}

/**
 * Create Stripe payment intent
 */
async function createStripePayment(
  order: Record<string, unknown>,
  amount: number,
  currency: string
): Promise<Record<string, unknown>> {
  // TODO: Implement Stripe integration
  // Requires: npm install stripe
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: Math.round(amount * 100), // cents
  //   currency: currency.toLowerCase(),
  //   metadata: {
  //     order_id: order.id,
  //     order_number: order.order_number,
  //   },
  // });
  
  return {
    type: 'stripe',
    status: 'pending',
    client_secret: 'pi_demo_secret_...',
    amount,
    currency,
    message: 'Stripe integration will be activated with API keys',
    order_id: order.id,
  };
}

/**
 * Create crypto payment
 */
async function createCryptoPayment(
  order: Record<string, unknown>,
  amount: number,
  currency: string
): Promise<Record<string, unknown>> {
  // TODO: Implement crypto payment gateway
  // Options: Coinbase Commerce, BTCPay Server, CoinPayments
  
  // Example: Coinbase Commerce
  // const coinbaseCommerce = require('coinbase-commerce-node');
  // const Client = coinbaseCommerce.Client;
  // Client.init(process.env.COINBASE_API_KEY);
  
  // const charge = await Charge.create({
  //   name: `OG Lab Order ${order.order_number}`,
  //   description: `Payment for order ${order.order_number}`,
  //   pricing_type: 'fixed_price',
  //   local_price: {
  //     amount: amount.toString(),
  //     currency: currency
  //   },
  //   metadata: {
  //     order_id: order.id,
  //     order_number: order.order_number,
  //   }
  // });
  
  return {
    type: 'crypto',
    status: 'awaiting_payment',
    payment_url: 'https://commerce.coinbase.com/charges/...',
    addresses: {
      bitcoin: 'bc1q...',
      ethereum: '0x...',
      usdt: 'TR...',
    },
    amount,
    currency,
    message: 'Crypto payment integration will be activated with API keys',
    order_id: order.id,
  };
}

/**
 * Create bank transfer payment
 */
async function createBankTransferPayment(
  order: Record<string, unknown>,
  amount: number,
  currency: string
): Promise<Record<string, unknown>> {
  // Bank transfer is manual verification
  // Return bank details for customer
  
  const bankDetails = {
    bank_name: 'Kasikorn Bank',
    account_number: '123-4-56789-0',
    account_name: 'OG Lab Co., Ltd.',
    swift_code: 'KASITHBK',
    reference: order.order_number,
  };
  
  return {
    type: 'bank_transfer',
    status: 'awaiting_payment',
    bank_details: bankDetails,
    amount,
    currency,
    instructions: `Please transfer ฿${amount} to the account above and use ${order.order_number} as reference`,
    order_id: order.id,
  };
}

/**
 * GET: Check payment status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    
    if (!orderId && !paymentId) {
      return Response.json(
        { error: 'orderId or paymentId required' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseServer();
    
    // Get order with payment info
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', String(orderId))
      .single();
    
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return Response.json({
      order_id: order.id,
      order_number: order.order_number,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      amount: order.total_amount,
      currency: order.currency,
      metadata: order.metadata,
    });
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    return Response.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update payment status
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentStatus, transactionId } = body;
    
    if (!orderId || !paymentStatus) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseServer();
    
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        metadata: transactionId ? { transaction_id: transactionId } : undefined,
      })
      .eq('id', String(orderId))
      .select()
      .single();
    
    if (error) {
      console.error('Error updating payment status:', error);
      return Response.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }
    
    return Response.json({
      success: true,
      order: data,
    });
    
  } catch (error) {
    console.error('Error in PATCH /api/payments:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

