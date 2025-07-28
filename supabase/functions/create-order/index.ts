import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customerData,
      cartItems,
      shippingCost,
      collectionCost,
      subtotal,
      totalAmount
    } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16'
    });

    // Generate order number
    const { data: orderNumber } = await supabase.rpc('generate_order_number');

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        company_name: customerData.company,
        event_name: customerData.event_name,
        event_start_date: customerData.event_date,
        event_end_date: customerData.event_end_date,
        zip_code: customerData.postal_code,
        shipping_address: customerData.shipping_details,
        message: customerData.message,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        collection_cost: collectionCost,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items
    const orderItems = cartItems.map((item: any) => {
      // Handle both string and number prices
      let price = item.price;
      if (typeof price === 'string') {
        price = parseFloat(price.replace(/[^0-9.]/g, ''));
      } else if (typeof price === 'number') {
        price = price;
      } else {
        price = 0;
      }
      
      return {
        order_id: order.id,
        product_id: item.id,
        product_title: item.title,
        product_price: price,
        quantity: item.quantity,
        line_total: price * item.quantity
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        order_id: order.id,
        order_number: orderNumber
      }
    });

    // Update order with Stripe payment intent ID
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({
        order_id: order.id,
        order_number: orderNumber,
        client_secret: paymentIntent.client_secret,
        amount: totalAmount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});