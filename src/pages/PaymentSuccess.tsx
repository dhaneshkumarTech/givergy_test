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
  total_amount: number;
  status: string;
  created_at: string;
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Success Section */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/25 animate-scale-in">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
              <Heart className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-4">
            Thank You – {orderDetails.customer_name}!
          </h1>
          
          <div className="space-y-3 text-lg">
            <p className="text-foreground/90">
              Your Order with ID: <span className="font-mono font-semibold text-primary">{orderDetails.order_number}</span> has been placed successfully.
            </p>
            <p className="text-muted-foreground">
              Our team will be in touch shortly with a confirmation email sent to{' '}
              <span className="font-semibold text-primary">{orderDetails.customer_email}</span>.
            </p>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">Email Support</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Contact our team at{' '}
                <a href="mailto:dev.test@gmail.com" className="font-semibold text-primary hover:underline">
                  dev.test@gmail.com
                </a>{' '}
                with the last 4 digits of your Order ID{' '}
                <span className="font-mono bg-muted px-2 py-1 rounded">
                  {orderDetails.order_number.slice(-4)}
                </span>{' '}
                to check status and assistance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Call Us</h3>
                  <p className="text-sm text-muted-foreground">Phone Support</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                If you require any assistance, please call{' '}
                <a href="tel:+1234567890" className="font-semibold text-secondary hover:underline">
                  +1 (234) 567-8900
                </a>{' '}
                and mention the last 4 digits of your Order ID{' '}
                <span className="font-mono bg-muted px-2 py-1 rounded">
                  {orderDetails.order_number.slice(-4)}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Card */}
        <Card className="mb-8 overflow-hidden border-2 border-muted">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-mono font-medium">{orderDetails.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span className="font-medium">
                    {new Date(orderDetails.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{orderDetails.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-primary">{orderDetails.customer_email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-lg border-b pb-2">Order Items</h4>
              {orderDetails.order_items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-4 bg-muted/30 rounded-lg border">
                  <div>
                    <h5 className="font-medium text-lg">{item.product_title}</h5>
                    <p className="text-muted-foreground">
                      ${item.product_price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${item.line_total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-primary/20 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  ${orderDetails.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={downloadReceipt}
                disabled={generatingReceipt}
                variant="outline"
                className="gap-2 px-8 py-3 text-lg hover:bg-primary/10"
                size="lg"
              >
                {generatingReceipt ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Generating Receipt...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Receipt
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                className="gap-2 px-8 py-3 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                size="lg"
              >
                Continue Shopping
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* What's Next Section */}
        <Card className="overflow-hidden border-2 border-muted">
          <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5">
            <CardTitle className="text-xl">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
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
                <div key={index} className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h5 className="font-semibold text-lg mb-1">{step.title}</h5>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
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