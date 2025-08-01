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

    if (!zipCode || zipCode.trim() === '') {
      throw new Error('ZIP code is required');
    }

    // Clean and validate ZIP code format
    const cleanZipCode = zipCode.trim().replace(/[^\d-]/g, '');
    if (!/^\d{5}(-\d{4})?$/.test(cleanZipCode)) {
      throw new Error('Invalid ZIP code format. Please enter a 5-digit ZIP code.');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get state from address using Google Maps API with fallback
    const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    let state = 'CA'; // Default fallback state
    
    if (googleApiKey) {
      try {
        const addressResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${cleanZipCode}&key=${googleApiKey}&components=country:US`);
        const addressData = await addressResponse.json();

        if (addressData.status === 'OVER_QUERY_LIMIT') {
          console.log('Google API rate limit hit, using default state');
        } else if (addressData.status === 'OK' && addressData.results && addressData.results.length > 0) {
          // Extract state from address components
          const addressComponents = addressData.results[0].address_components;
          const stateComponent = addressComponents.find((component) =>
            component.types.includes('administrative_area_level_1')
          );
          
          if (stateComponent) {
            state = stateComponent.short_name;
          }
        } else {
          console.log('No results from Google API, using default state');
        }
      } catch (apiError) {
        console.log('Google API error, using default state:', apiError);
      }
    } else {
      console.log('No Google API key, using default state');
    }


    // Look up shipping costs by state
    const { data: shippingZone, error } = await supabase
      .from('shipping_zones')
      .select('*')
      .eq('state', state)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
    }

    // If no exact state match, apply default shipping costs
    const shipping = shippingZone || {
      zone_name: `${state} Zone`,
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