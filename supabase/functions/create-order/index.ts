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
      totalAmount,
      isQuoteOnly
    } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate order number
    console.log('Generating order number...');
    const { data: orderNumber, error: rpcError } = await supabase.rpc('generate_order_number');
    
    if (rpcError) {
      console.error('RPC Error:', rpcError);
      throw new Error(`Failed to generate order number: ${rpcError.message}`);
    }
    
    console.log('Generated order number:', orderNumber);

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
        status: isQuoteOnly ? 'quote' : 'pending'
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
      
      // Clean product_id to remove any suffixes (e.g., "-3", "-5")
      let productId = item.id;
      if (typeof productId === 'string' && productId.includes('-')) {
        // Split by dashes and take the first 5 parts (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
        const parts = productId.split('-');
        if (parts.length > 5) {
          productId = parts.slice(0, 5).join('-');
        }
      }
      
      return {
        order_id: order.id,
        product_id: productId,
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

    if (!isQuoteOnly) {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2023-10-16'
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Order ${orderNumber}`,
                description: `Equipment rental for ${customerData.event_name}`,
              },
              unit_amount: Math.round(totalAmount * 100), 
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || 'http://localhost:8080'}/payment-success?order_id=${order.id}`,
        cancel_url: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || 'http://localhost:8080'}/checkout`,
        metadata: {
          order_id: order.id,
          order_number: orderNumber
        }
      });

      // Update order with Stripe session ID
      await supabase
        .from('orders')
        .update({ stripe_payment_intent_id: session.id })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({
          order_id: order.id,
          order_number: orderNumber,
          checkout_url: session.url,
          session_id: session.id,
          amount: totalAmount
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // For quote-only orders, return without Stripe session
      return new Response(
        JSON.stringify({
          order_id: order.id,
          order_number: orderNumber,
          amount: totalAmount
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
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