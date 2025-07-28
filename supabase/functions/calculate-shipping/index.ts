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

    // Get state from address using Google Maps API
    const addressResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${Deno.env.get('GOOGLE_MAPS_API_KEY')}`);
    const addressData = await addressResponse.json();
    
    if (!addressData.results || addressData.results.length === 0) {
      throw new Error('Invalid ZIP code');
    }

    // Extract state from address components
    const addressComponents = addressData.results[0].address_components;
    const stateComponent = addressComponents.find((component: any) => 
      component.types.includes('administrative_area_level_1')
    );
    
    if (!stateComponent) {
      throw new Error('Could not determine state from ZIP code');
    }

    const state = stateComponent.short_name;

    // Look up shipping costs by state
    const { data: shippingZone, error } = await supabase
      .from('shipping_zones')
      .select('*')
      .eq('state', state)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // If no exact match, apply default shipping costs
    const shipping = shippingZone || {
      zone_name: 'Standard Zone',
      shipping_cost: 75.00,
      collection_cost: 75.00
    };

    return new Response(
      JSON.stringify({
        zone_name: shipping.zone_name || `${state} Zone`,
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