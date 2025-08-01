import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    // If no Google API key, use fallback
    if (!googleApiKey) {
      console.log('No Google API key, using fallback');
      return new Response(JSON.stringify({
        formatted_address: `${cleanZipCode}, USA`,
        city: 'Unknown City',
        state: 'Unknown',
        country: 'US',
        zipCode: cleanZipCode,
        full_address: `Unknown City, Unknown ${cleanZipCode}, US`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    let data;
    try {
      // Use Google Geocoding API to get address details from ZIP code
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${cleanZipCode}&key=${googleApiKey}&components=country:US`;
      const response = await fetch(geocodeUrl);
      data = await response.json();

      if (data.status === 'OVER_QUERY_LIMIT') {
        console.log('Google API rate limit hit, using fallback');
        return new Response(JSON.stringify({
          formatted_address: `${cleanZipCode}, USA`,
          city: 'Unknown City',
          state: 'Unknown',
          country: 'US',
          zipCode: cleanZipCode,
          full_address: `Unknown City, Unknown ${cleanZipCode}, US`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      if (data.status !== 'OK' || !data.results.length) {
        throw new Error('Invalid ZIP code or no results found');
      }
    } catch (apiError) {
      console.log('Google API error, using fallback:', apiError);
      return new Response(JSON.stringify({
        formatted_address: `${cleanZipCode}, USA`,
        city: 'Unknown City',
        state: 'Unknown',
        country: 'US',
        zipCode: cleanZipCode,
        full_address: `Unknown City, Unknown ${cleanZipCode}, US`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    // Extract city, state, country from address components
    let city = '';
    let state = '';
    let country = '';

    addressComponents.forEach((component: any) => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
      if (component.types.includes('country')) {
        country = component.short_name;
      }
    });

    return new Response(
      JSON.stringify({
        formatted_address: result.formatted_address,
        city,
        state,
        country,
        zipCode: cleanZipCode,
        full_address: `${city}, ${state} ${cleanZipCode}, ${country}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error getting address:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});