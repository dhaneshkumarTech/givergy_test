import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipCode } = await req.json();

    if (!zipCode) {
      throw new Error('ZIP code is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Look up shipping costs by ZIP code
    const { data: shippingZone, error } = await supabase
      .from('shipping_zones')
      .select('*')
      .eq('zip_code', zipCode)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // If no exact match, apply default shipping costs
    const shipping = shippingZone || {
      zone_name: 'Standard Zone',
      shipping_cost: 40.00,
      collection_cost: 40.00
    };

    return new Response(
      JSON.stringify({
        zone_name: shipping.zone_name,
        shipping_cost: shipping.shipping_cost,
        collection_cost: shipping.collection_cost,
        total_shipping: (parseFloat(shipping.shipping_cost) + parseFloat(shipping.collection_cost)).toFixed(2)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});