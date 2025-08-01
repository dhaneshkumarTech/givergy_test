import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { useShipping } from '@/hooks/useShipping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Download, CreditCard, FileText, ShoppingCart, Calendar, MapPin, User, Mail, Phone, Building } from 'lucide-react';
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
  const { calculateShipping, getAddress } = useShipping();
  const navigate = useNavigate();
  
  const [shippingCost, setShippingCost] = useState<ShippingCost | null>(null);
  const [addressInfo, setAddressInfo] = useState<string>('');
  const [orderCreated, setOrderCreated] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [generatingQuote, setGeneratingQuote] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);

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
    if (!zipCode || zipCode.length < 5) {
      setShippingCost(null);
      setAddressInfo('');
      return;
    }

    // Validate ZIP code format
    const cleanZip = zipCode.trim().replace(/[^\d-]/g, '');
    if (!/^\d{5}(-\d{4})?$/.test(cleanZip)) {
      setShippingCost(null);
      setAddressInfo('');
      return;
    }

    const fetchShippingAndAddress = async () => {
      setShippingLoading(true);
      try {
        const [shippingData, addressData] = await Promise.all([
          calculateShipping(cleanZip),
          getAddress(cleanZip)
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
        setShippingCost(null);
        setAddressInfo('');
      } finally {
        setShippingLoading(false);
      }
    };

    fetchShippingAndAddress();
  }, [zipCode, calculateShipping, getAddress, form]);

  const subtotal = getTotalPrice();
  const totalShipping = shippingCost ? shippingCost.shipping_cost + shippingCost.collection_cost : 0;
  const totalAmount = subtotal + totalShipping;

  const downloadQuote = async () => {
    setGeneratingQuote(true);
    
    try {
      let orderId = orderCreated?.order_id;
      
      // If no order exists yet, create a temporary one for quote generation
      if (!orderId) {
        if (!shippingCost) {
          toast.error('Please enter a valid ZIP code to calculate shipping');
          return;
        }
        
        // Validate required form fields
        const formData = form.getValues();
        if (!formData.name || !formData.email || !formData.phone || !formData.company || !formData.event_name) {
          toast.error('Please fill in all required fields to generate a quote');
          return;
        }
        
        const tempOrderData = {
          customerData: {
            ...formData,
            event_date: formData.event_date,
            event_end_date: formData.event_end_date,
            postal_code: formData.postal_code,
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
        orderId = quoteResult.order_id;
      }

      // Generate quote PDF
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf', {
        body: { orderId: orderId, type: 'quote' }
      });
      
      if (pdfError) throw pdfError;
      
      if (!pdfData || !pdfData.html) {
        throw new Error('No PDF data received');
      }
      
      // Create and download the quote file
      const blob = new Blob([pdfData.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfData.filename || `quote_${new Date().getTime()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Quote downloaded successfully!');
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error(`Failed to generate quote: ${error.message || 'Unknown error'}`);
    } finally {
      setGeneratingQuote(false);
    }
  };

  const processPayment = async () => {
    if (!orderCreated) return;
    
    setProcessingPayment(true);
    try {
      // Redirect to Stripe checkout
      if (orderCreated.checkout_url) {
        window.location.href = orderCreated.checkout_url;
      } else {
        throw new Error('No checkout URL provided');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment processing failed');
      setProcessingPayment(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (creatingOrder) {
      return; // Prevent double submission
    }
    
    if (!shippingCost) {
      toast.error('Please enter a valid ZIP code to calculate shipping');
      return;
    }

    setCreatingOrder(true);
    
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

      if (error) {
        throw new Error(error.message || 'Failed to create order');
      }

      if (!orderResult || !orderResult.order_id) {
        throw new Error('Invalid order response received');
      }

      setOrderCreated(orderResult);
      toast.success('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      toast.error(errorMessage);
    } finally {
      setCreatingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <ShoppingCart className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-4 bg-gradient-brand bg-clip-text text-transparent">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some items to get started with your order</p>
          </div>
          <Button onClick={() => navigate('/')} className="gap-2 bg-gradient-brand text-primary-foreground shadow-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-green-200 bg-green-50/50 shadow-elegant">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-green-700 mb-2">Order Created Successfully!</CardTitle>
              <p className="text-green-600 font-medium">Order Number: {orderCreated.order_number}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-4 bg-white/50 rounded-lg border border-green-200">
                  <p className="text-lg">Total Amount: <span className="font-bold text-2xl text-primary">${orderCreated.amount.toFixed(2)}</span></p>
                </div>
                
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button 
                    onClick={downloadQuote}
                    disabled={generatingQuote}
                    variant="outline"
                    className="gap-2 hover:shadow-md transition-all duration-300"
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
                    className="gap-2 bg-gradient-brand text-primary-foreground shadow-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1"
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
                  className="gap-2 hover:bg-gradient-brand hover:text-white transition-all duration-300"
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
    <div className="min-h-screen bg-gradient-subtle py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2 hover:bg-gradient-brand hover:text-white hover:shadow-lg transition-all duration-300 transform "
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shopping
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadQuote}
              disabled={generatingQuote}
              className="gap-2 hover:bg-gradient-brand hover:text-white hover:shadow-lg transition-all duration-300 transform "
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
          <h1 className="text-4xl font-bold bg-gradient-brand bg-clip-text text-transparent">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {/* Cart Items */}
            <Card className="shadow-elegant hover:border-primary/80  transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Package className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="text-xs mb-1 bg-gradient-brand text-primary-foreground">
                        {item.category}
                      </Badge>
                      <h4 className="font-semibold text-lg mb-2 text-foreground">{item.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-bold text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Summary */}
            <Card className="shadow-elegant hover:border-primary/80 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-primary">
                  Shipping & Collection Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <p className="text-sm text-muted-foreground italic">
                  *Chargers and cables will be included with the order.
                </p>
                
                {shippingCost ? (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="text-sm text-green-600 mb-2 font-medium">
                      📍 Shipping Zone: {shippingCost.zone_name}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping Cost:</span>
                      <span className="font-medium">${shippingCost.shipping_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Collection Cost:</span>
                      <span className="font-medium">${shippingCost.collection_cost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="text-sm text-primary font-medium">
                      📍 Enter ZIP code to calculate shipping costs
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t bg-gradient-brand/5 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-elegant hover:border-primary/80 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-primary">Delivery Information</CardTitle>
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
                            <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" /> Name *</FormLabel>
                            <FormControl>
                              <Input {...field} className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200" />
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
                            <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email *</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200" />
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
                            <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number *</FormLabel>
                            <FormControl>
                              <Input {...field} className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200" />
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
                            <FormLabel className="flex items-center gap-2"><Building className="w-4 h-4" /> Company Name *</FormLabel>
                            <FormControl>
                              <Input {...field} className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200" />
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
                          <FormLabel className="flex items-center gap-2"><Package className="w-4 h-4" /> Event Name *</FormLabel>
                          <FormControl>
                            <Input {...field} className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200" />
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
                            <FormLabel className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Event Start</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200" />
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
                            <FormLabel className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Event End</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200" />
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
                          <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> ZIP Code *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter ZIP Code For USA" 
                              {...field}
                              disabled={shippingLoading}
                              className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {addressInfo && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300">
                        <p className="text-sm text-green-700">
                          <strong className="flex items-center gap-2">✅ Detected Address:</strong> {addressInfo}
                        </p>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="shipping_details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Shipping Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional shipping details (auto-filled from ZIP code)" 
                              {...field}
                              className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200"
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
                          <FormLabel className="flex items-center gap-2"><FileText className="w-4 h-4" /> Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any additional notes..." {...field} className="hover:ring-2 hover:ring-primary/20 focus:border-primary transition-all duration-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base bg-gradient-brand text-primary-foreground shadow-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1"
                      disabled={creatingOrder || !shippingCost || shippingLoading}
                    >
                      {shippingLoading ? (
                        <><ShoppingCart className="w-4 h-4 mr-2 animate-spin" /> Calculating...</>
                      ) : creatingOrder ? (
                        <><Package className="w-4 h-4 mr-2 animate-spin" /> Creating Order...</>
                      ) : (
                        <><CreditCard className="w-4 h-4 mr-2" /> Create Order & Continue</>
                      )}
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