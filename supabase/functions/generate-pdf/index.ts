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
    const { orderId, type } = await req.json(); // type: 'quote' or 'receipt'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get order details
    const { data: order, error: orderError } = await supabase
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

    if (orderError) {
      throw orderError;
    }

    // Generate HTML content for PDF
    const htmlContent = generateHTMLContent(order, type);

    // For demo purposes, we'll return the HTML content
    // In production, you'd use a PDF generation service like Puppeteer
    return new Response(
      JSON.stringify({
        html: htmlContent,
        filename: `${type}_${order.order_number}.html`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateHTMLContent(order: any, type: string) {
  const title = type === 'quote' ? 'QUOTE' : 'RECEIPT';
  const statusInfo = type === 'quote' ? 'Quote Valid for 30 Days' : `Payment Received - ${new Date().toLocaleDateString()}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
        .document-title { font-size: 28px; font-weight: bold; margin: 20px 0; }
        .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .customer-info { margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background: #f8f9fa; font-weight: bold; }
        .total-section { margin-top: 20px; text-align: right; }
        .total-line { margin: 8px 0; }
        .grand-total { font-size: 18px; font-weight: bold; color: #2563eb; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Equipment Rental Co.</div>
        <div class="document-title">${title}</div>
        <div>${statusInfo}</div>
      </div>

      <div class="order-info">
        <div><strong>${title} Number:</strong> ${order.order_number}</div>
        <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
        <div><strong>Event Dates:</strong> ${order.event_start_date} to ${order.event_end_date}</div>
      </div>

      <div class="customer-info">
        <h3>Customer Information</h3>
        <div><strong>Name:</strong> ${order.customer_name}</div>
        <div><strong>Company:</strong> ${order.company_name}</div>
        <div><strong>Email:</strong> ${order.customer_email}</div>
        <div><strong>Phone:</strong> ${order.customer_phone}</div>
        <div><strong>Event:</strong> ${order.event_name}</div>
        ${order.shipping_address ? `<div><strong>Address:</strong> ${order.shipping_address}</div>` : ''}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.order_items.map((item: any) => `
            <tr>
              <td>${item.product_title}</td>
              <td>$${item.product_price.toFixed(2)}</td>
              <td>${item.quantity}</td>
              <td>$${item.line_total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-line">Subtotal: $${order.subtotal.toFixed(2)}</div>
        <div class="total-line">Shipping: $${order.shipping_cost.toFixed(2)}</div>
        <div class="total-line">Collection: $${order.collection_cost.toFixed(2)}</div>
        <div class="total-line grand-total">Total: $${order.total_amount.toFixed(2)}</div>
      </div>

      ${order.message ? `
        <div style="margin-top: 30px;">
          <h3>Additional Notes</h3>
          <p>${order.message}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Equipment Rental Co. | contact@equipmentrental.com | (555) 123-4567</p>
      </div>
    </body>
    </html>
  `;
}