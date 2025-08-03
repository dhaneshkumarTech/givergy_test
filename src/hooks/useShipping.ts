import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ShippingInfo {
  zone_name: string;
  shipping_cost: number;
  collection_cost: number;
  total_shipping: string;
}

export interface AddressInfo {
  formatted_address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  full_address: string;
}

export const useShipping = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateShipping = async (zipCode: string): Promise<ShippingInfo | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-shipping', {
        body: { zipCode }
      });
      if (error) throw error;
      
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const getAddress = async (zipCode: string): Promise<AddressInfo | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-address', {
        body: { zipCode }
      });
      
      if (error) throw error;
      
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return { calculateShipping, getAddress, loading, error };
};