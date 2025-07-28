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
  const title = type === 'quote' ? 'RENTAL QUOTE' : 'RECEIPT';
  const statusInfo = type === 'quote' ? 'Quote Valid for 30 Days' : `Payment Received - ${new Date().toLocaleDateString()}`;
  const brandColor = '#0ea5e9';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${order.order_number}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1f2937; 
          background: #ffffff;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        
        .header { 
          background: linear-gradient(135deg, ${brandColor} 0%, #0284c7 100%);
          color: white;
          padding: 40px 30px;
          border-radius: 12px;
          text-align: center; 
          margin-bottom: 40px;
          box-shadow: 0 10px 30px -10px rgba(14, 165, 233, 0.3);
        }
        
        .company-name { 
          font-size: 32px; 
          font-weight: 700; 
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .document-title { 
          font-size: 24px; 
          font-weight: 600; 
          margin: 12px 0 8px 0;
          opacity: 0.95;
        }
        
        .status-info {
          font-size: 16px;
          opacity: 0.9;
          font-weight: 500;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .order-info, .customer-info { 
          background: #f8fafc; 
          padding: 24px; 
          border-radius: 12px; 
          border-left: 4px solid ${brandColor};
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .section-title::before {
          content: '';
          width: 6px;
          height: 6px;
          background: ${brandColor};
          border-radius: 50%;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 14px;
        }
        
        .info-value {
          font-weight: 600;
          color: #111827;
          text-align: right;
        }
        
        .items-section {
          margin: 40px 0;
        }
        
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th { 
          background: ${brandColor}; 
          color: white;
          padding: 16px 20px; 
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .items-table td { 
          padding: 16px 20px; 
          border-bottom: 1px solid #e5e7eb;
          background: white;
        }
        
        .items-table tr:last-child td {
          border-bottom: none;
        }
        
        .items-table tr:nth-child(even) td {
          background: #f9fafb;
        }
        
        .product-name {
          font-weight: 600;
          color: #111827;
        }
        
        .price-cell {
          font-weight: 600;
          color: ${brandColor};
          text-align: right;
        }
        
        .total-section { 
          background: #f8fafc;
          padding: 24px;
          border-radius: 12px;
          margin-top: 40px;
          border: 2px solid #e5e7eb;
        }
        
        .total-row { 
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 16px;
        }
        
        .total-label {
          font-weight: 500;
          color: #6b7280;
        }
        
        .total-value {
          font-weight: 600;
          color: #111827;
        }
        
        .grand-total { 
          border-top: 2px solid ${brandColor};
          padding-top: 16px;
          margin-top: 16px;
          font-size: 20px; 
          font-weight: 700; 
          color: ${brandColor};
        }
        
        .notes-section {
          background: #fefce8;
          border: 1px solid #fde047;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
        }
        
        .notes-title {
          font-weight: 600;
          color: #a16207;
          margin-bottom: 8px;
        }
        
        .notes-content {
          color: #a16207;
          line-height: 1.6;
        }
        
        .footer { 
          background: #111827;
          color: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin-top: 50px;
        }
        
        .footer-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .footer-contact {
          opacity: 0.8;
          font-size: 14px;
          line-height: 1.8;
        }
        
        .terms {
          background: #f1f5f9;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          font-size: 12px;
          color: #64748b;
          line-height: 1.6;
        }
        
        @media print {
          body { margin: 0; padding: 20px; }
          .header { background: ${brandColor} !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🏗️ Equipment Rental Pro</div>
        <div class="document-title">${title}</div>
        <div class="status-info">${statusInfo}</div>
      </div>

      <div class="content-grid">
        <div class="order-info">
          <div class="section-title">Order Details</div>
          <div class="info-row">
            <span class="info-label">${title} Number</span>
            <span class="info-value">${order.order_number}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date Created</span>
            <span class="info-value">${new Date(order.created_at).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Event Start</span>
            <span class="info-value">${order.event_start_date || 'TBD'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Event End</span>
            <span class="info-value">${order.event_end_date || 'TBD'}</span>
          </div>
        </div>

        <div class="customer-info">
          <div class="section-title">Customer Information</div>
          <div class="info-row">
            <span class="info-label">Name</span>
            <span class="info-value">${order.customer_name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Company</span>
            <span class="info-value">${order.company_name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">${order.customer_email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value">${order.customer_phone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Event</span>
            <span class="info-value">${order.event_name}</span>
          </div>
          ${order.shipping_address ? `
            <div class="info-row">
              <span class="info-label">Address</span>
              <span class="info-value">${order.shipping_address}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="items-section">
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50%;">Equipment Item</th>
              <th style="width: 20%; text-align: right;">Unit Price</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items.map((item: any) => `
              <tr>
                <td class="product-name">${item.product_title}</td>
                <td class="price-cell">$${Number(item.product_price).toFixed(2)}</td>
                <td style="text-align: center; font-weight: 600;">${item.quantity}</td>
                <td class="price-cell">$${Number(item.line_total).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Subtotal</span>
          <span class="total-value">$${Number(order.subtotal).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Delivery & Setup</span>
          <span class="total-value">$${Number(order.shipping_cost).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Pickup & Collection</span>
          <span class="total-value">$${Number(order.collection_cost).toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAL AMOUNT</span>
          <span>$${Number(order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      ${order.message ? `
        <div class="notes-section">
          <div class="notes-title">📝 Special Instructions</div>
          <div class="notes-content">${order.message}</div>
        </div>
      ` : ''}

      <div class="terms">
        <strong>Terms & Conditions:</strong> All equipment rentals include delivery, setup, and collection. Damage waivers available upon request. 
        Payment is due upon delivery unless other arrangements have been made. Cancellations must be made 48 hours in advance.
        Equipment must be returned in the same condition as delivered.
      </div>

      <div class="footer">
        <div class="footer-title">Thank You for Your Business! 🙏</div>
        <div class="footer-contact">
          Equipment Rental Pro<br>
          📧 contact@equipmentrentalpro.com<br>
          📞 (555) 123-4567<br>
          🌐 www.equipmentrentalpro.com
        </div>
      </div>
    </body>
    </html>
  `;
}