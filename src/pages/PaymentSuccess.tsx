import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, ArrowLeft, Package, Mail, Phone, Heart } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderDetails {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  shipping_cost: number;
  collection_cost: number;
  total_amount: number;
  status: string;
  created_at: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  order_items: Array<{
    product_title: string;
    product_price: number;
    quantity: number;
    line_total: number;
  }>;
}

const PaymentSuccess = () => {
  console.log('PaymentSuccess component rendered');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderId = searchParams.get('order_id');
      if (!orderId) {
        toast.error('No order ID found');
        navigate('/');
        return;
      }   
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              product_title,
              product_price,
              quantity,
              line_total
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrderDetails(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [searchParams, navigate]);

  const downloadReceipt = async () => {
    if (!orderDetails) return;
    
    setGeneratingReceipt(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { orderId: orderDetails.id, type: 'receipt' }
      });
      
      if (error) throw error;
      
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    } finally {
      setGeneratingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Success Section */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/25 animate-scale-in">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
              <Heart className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">
            Thank You – {orderDetails.customer_name}!
          </h1>
          
          <div className="space-y-2 text-sm">
            <p className="text-foreground/90">
              Your Order with ID: <span className="font-mono font-semibold text-primary text-xs">{orderDetails.order_number}</span> has been placed successfully.
            </p>
            <p className="text-muted-foreground text-xs">
              Our team will be in touch shortly with a confirmation email sent to{' '}
              <span className="font-semibold text-primary">{orderDetails.customer_email}</span>.
            </p>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Need Help?</h3>
                  <p className="text-xs text-muted-foreground">Email Support</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed">
                Contact our team at{' '}
                <a href="mailto:dev.test@gmail.com" className="font-semibold text-primary hover:underline">
                  dev.test@gmail.com
                </a>{' '}
                with the last 4 digits of your Order ID{' '}
                <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                  {orderDetails.order_number.slice(-4)}
                </span>{' '}
                to check status and assistance.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Call Us</h3>
                  <p className="text-xs text-muted-foreground">Phone Support</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed">
                If you require any assistance, please call{' '}
                <a href="tel:+1234567890" className="font-semibold text-secondary hover:underline">
                  +1 (234) 567-8900
                </a>{' '}
                and mention the last 4 digits of your Order ID{' '}
                <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                  {orderDetails.order_number.slice(-4)}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Card */}
        {orderDetails.event_name && (
          <Card className="mb-6 border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-accent" />
                </div>
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">Event Name</p>
                  <p className="font-medium">{orderDetails.event_name}</p>
                </div>
                {orderDetails.event_start_date && (
                  <div>
                    <p className="text-muted-foreground mb-1">Start Date</p>
                    <p className="font-medium">
                      {new Date(orderDetails.event_start_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {orderDetails.event_end_date && (
                  <div>
                    <p className="text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium">
                      {new Date(orderDetails.event_end_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Summary Card */}
        <Card className="mb-6 overflow-hidden border border-muted">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-mono font-medium">{orderDetails.order_number}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span className="font-medium">
                    {new Date(orderDetails.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{orderDetails.customer_name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-primary">{orderDetails.customer_email}</span>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-3 border-b pb-2">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-2 px-3 font-medium">Product</th>
                      <th className="text-center py-2 px-3 font-medium">Price</th>
                      <th className="text-center py-2 px-3 font-medium">Qty</th>
                      <th className="text-right py-2 px-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.order_items.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/10">
                        <td className="py-3 px-3">
                          <div className="font-medium">{item.product_title}</div>
                        </td>
                        <td className="text-center py-3 px-3 text-muted-foreground">
                          ${item.product_price.toFixed(2)}
                        </td>
                        <td className="text-center py-3 px-3 text-muted-foreground">
                          {item.quantity}
                        </td>
                        <td className="text-right py-3 px-3 font-medium">
                          ${item.line_total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${orderDetails.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Shipping Cost:</span>
                <span className="font-medium">${orderDetails.shipping_cost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Collection Cost:</span>
                <span className="font-medium">${orderDetails.collection_cost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total Amount:</span>
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  ${orderDetails.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                onClick={downloadReceipt}
                disabled={generatingReceipt}
                variant="outline"
                className="gap-2 px-6 py-2 text-sm hover:bg-gradient-brand hover:text-white"
              >
                {generatingReceipt ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Receipt
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                className="gap-2 px-6 py-2 text-sm bg-gradient-brand from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
              >
                Continue Shopping
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* What's Next Section */}
        <Card className="overflow-hidden border border-muted">
          <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5 pb-3">
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[
                {
                  number: "1",
                  title: "Order Confirmation",
                  description: "You'll receive an email confirmation shortly with all order details and tracking information."
                },
                {
                  number: "2", 
                  title: "Equipment Preparation",
                  description: "Our team will prepare and thoroughly test all equipment before delivery to ensure everything works perfectly."
                },
                {
                  number: "3",
                  title: "Delivery & Setup", 
                  description: "Equipment will be delivered to your event location as scheduled, with professional setup if required."
                },
                {
                  number: "4",
                  title: "Collection",
                  description: "After your event, we'll collect all equipment from your location at the agreed time."
                }
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm mb-1">{step.title}</h5>
                    <p className="text-muted-foreground text-xs leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;