import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { useShipping } from '@/hooks/useShipping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Download, CreditCard, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().min(1, 'Company name is required'),
  event_name: z.string().min(1, 'Event name is required'),
  event_date: z.string().optional(),
  event_end_date: z.string().optional(),
  postal_code: z.string().min(5, 'Valid ZIP code is required'),
  shipping_details: z.string().optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ShippingCost {
  shipping_cost: number;
  collection_cost: number;
  zone_name: string;
}

const Checkout = () => {
  const { items, getTotalItems, getTotalPrice, startDate, endDate, clearCart } = useCartStore();
  const { calculateShipping, getAddress, loading: shippingLoading } = useShipping();
  const navigate = useNavigate();
  
  const [shippingCost, setShippingCost] = useState<ShippingCost | null>(null);
  const [addressInfo, setAddressInfo] = useState<string>('');
  const [orderCreated, setOrderCreated] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [generatingQuote, setGeneratingQuote] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      event_name: '',
      event_date: startDate ? startDate.toISOString().split('T')[0] : '',
      event_end_date: endDate ? endDate.toISOString().split('T')[0] : '',
      postal_code: '',
      shipping_details: '',
      message: '',
    },
  });

  const zipCode = form.watch('postal_code');

  // Calculate shipping when ZIP code changes
  useEffect(() => {
    const fetchShippingAndAddress = async () => {
      if (zipCode && zipCode.length >= 5) {
        try {
          const [shippingData, addressData] = await Promise.all([
            calculateShipping(zipCode),
            getAddress(zipCode)
          ]);
          
          if (shippingData) {
            setShippingCost(shippingData);
          }
          
          if (addressData) {
            setAddressInfo(addressData.full_address);
            form.setValue('shipping_details', addressData.full_address);
          }
        } catch (error) {
          console.error('Error fetching shipping info:', error);
        }
      } else {
        setShippingCost(null);
        setAddressInfo('');
      }
    };

    fetchShippingAndAddress();
  }, [zipCode, calculateShipping, getAddress, form]);

  const subtotal = getTotalPrice();
  const totalShipping = shippingCost ? shippingCost.shipping_cost + shippingCost.collection_cost : 0;
  const totalAmount = subtotal + totalShipping;

  const downloadQuote = async () => {
    if (!orderCreated) {
      // Create a temporary order for quote generation
      if (!shippingCost) {
        toast.error('Please enter a valid ZIP code to calculate shipping');
        return;
      }
      
      try {
        const tempOrderData = {
          customerData: {
            ...form.getValues(),
            event_date: form.getValues().event_date,
            event_end_date: form.getValues().event_end_date,
            postal_code: form.getValues().postal_code,
            shipping_details: addressInfo
          },
          cartItems: items,
          shippingCost: shippingCost.shipping_cost,
          collectionCost: shippingCost.collection_cost,
          subtotal: subtotal,
          totalAmount: totalAmount,
          isQuoteOnly: true
        };

        const { data: quoteResult, error } = await supabase.functions.invoke('create-order', {
          body: tempOrderData
        });

        if (error) throw error;

        // Generate quote with temporary order
        const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf', {
          body: { orderId: quoteResult.order_id, type: 'quote' }
        });
        
        if (pdfError) throw pdfError;
        
        // Create and download the quote file
        const blob = new Blob([pdfData.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfData.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Quote downloaded successfully!');
        return;
      } catch (error) {
        console.error('Error generating quote:', error);
        toast.error('Failed to generate quote');
        return;
      }
    }
    
    setGeneratingQuote(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { orderId: orderCreated.order_id, type: 'quote' }
      });
      
      if (error) throw error;
      
      // Create and download the quote file
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Quote downloaded successfully!');
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error('Failed to generate quote');
    } finally {
      setGeneratingQuote(false);
    }
  };

  const processPayment = async () => {
    if (!orderCreated) return;
    
    setProcessingPayment(true);
    try {
      // Create Stripe checkout session and redirect
      const checkoutUrl = `https://checkout.stripe.com/pay/${orderCreated.client_secret}#success_url=${window.location.origin}/payment-success?order_id=${orderCreated.order_id}`;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment processing failed');
      setProcessingPayment(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!shippingCost) {
      toast.error('Please enter a valid ZIP code to calculate shipping');
      return;
    }

    try {
      const orderData = {
        customerData: {
          ...data,
          event_date: data.event_date,
          event_end_date: data.event_end_date,
          postal_code: data.postal_code,
          shipping_details: addressInfo
        },
        cartItems: items,
        shippingCost: shippingCost.shipping_cost,
        collectionCost: shippingCost.collection_cost,
        subtotal: subtotal,
        totalAmount: totalAmount
      };

      const { data: orderResult, error } = await supabase.functions.invoke('create-order', {
        body: orderData
      });

      if (error) throw error;

      setOrderCreated(orderResult);
      toast.success('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-700">Order Created Successfully!</CardTitle>
              <p className="text-green-600">Order Number: {orderCreated.order_number}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-lg">Total Amount: <span className="font-bold text-primary">${orderCreated.amount.toFixed(2)}</span></p>
                
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button 
                    onClick={downloadQuote}
                    disabled={generatingQuote}
                    variant="outline"
                    className="gap-2"
                  >
                    {generatingQuote ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download Quote
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={processPayment}
                    disabled={processingPayment}
                    className="gap-2 bg-gradient-brand text-primary-foreground"
                  >
                    {processingPayment ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </div>
                
                <Button 
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2 hover:bg-gradient-brand hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shopping
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadQuote}
              disabled={generatingQuote}
              className="gap-2"
            >
              {generatingQuote ? (
                <>Generating...</>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Download Quote
                </>
              )}
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="text-xs mb-1 bg-gradient-brand text-primary-foreground">
                        {item.category}
                      </Badge>
                      <h4 className="font-semibold text-sm mb-2">{item.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping & Collection Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <p className="text-sm text-muted-foreground italic">
                  *Chargers and cables will be included with the order.
                </p>
                
                {shippingCost ? (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="text-sm text-green-600 mb-2">
                      Shipping Zone: {shippingCost.zone_name}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping Cost:</span>
                      <span>${shippingCost.shipping_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Collection Cost:</span>
                      <span>${shippingCost.collection_cost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="text-sm text-primary">
                      Enter ZIP code to calculate shipping costs
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="event_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="event_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Start</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="event_end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event End</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter ZIP Code For USA" 
                              {...field}
                              disabled={shippingLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {addressInfo && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          <strong>Detected Address:</strong> {addressInfo}
                        </p>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="shipping_details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional shipping details (auto-filled from ZIP code)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any additional notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base bg-gradient-brand text-primary-foreground"
                      disabled={!shippingCost || shippingLoading}
                    >
                      {shippingLoading ? 'Calculating...' : 'Create Order & Continue'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;