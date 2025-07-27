import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, ArrowLeft, Package } from 'lucide-react';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const sessionId = searchParams.get('session_id');
      const orderId = searchParams.get('order_id');
      
      if (!orderId) {
        toast.error('No order ID found');
        navigate('/');
        return;
      }

      try {
        // In a real implementation, you might want to verify the session_id with Stripe
        // For now, we'll just fetch the order details
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
      
      // Create and download the receipt file
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
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50/50 mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
            <p className="text-green-600">
              Thank you for your order. Your payment has been processed successfully.
            </p>
          </CardHeader>
        </Card>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order Number</p>
                <p className="font-medium">{orderDetails.order_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {new Date(orderDetails.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{orderDetails.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{orderDetails.customer_email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Order Items</h4>
              {orderDetails.order_items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">{item.product_title}</h5>
                    <p className="text-sm text-muted-foreground">
                      ${item.product_price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.line_total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">${orderDetails.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-6">
              <Button 
                onClick={downloadReceipt}
                disabled={generatingReceipt}
                variant="outline"
                className="gap-2"
              >
                {generatingReceipt ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Receipt
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                className="gap-2 bg-gradient-brand text-primary-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-700 mt-1">1</Badge>
                <div>
                  <h5 className="font-medium">Order Confirmation</h5>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email confirmation shortly with all order details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-700 mt-1">2</Badge>
                <div>
                  <h5 className="font-medium">Equipment Preparation</h5>
                  <p className="text-sm text-muted-foreground">
                    Our team will prepare and test all equipment before delivery.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-700 mt-1">3</Badge>
                <div>
                  <h5 className="font-medium">Delivery & Setup</h5>
                  <p className="text-sm text-muted-foreground">
                    Equipment will be delivered to your event location as scheduled.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-700 mt-1">4</Badge>
                <div>
                  <h5 className="font-medium">Collection</h5>
                  <p className="text-sm text-muted-foreground">
                    After your event, we'll collect all equipment from your location.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;