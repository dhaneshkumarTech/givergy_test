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
    const { orderId, type } = await req.json(); 
    
    console.log('Generating PDF for order:', orderId, 'type:', type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
      console.error('Order query error:', orderError);
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }

    if (!order) {
      throw new Error('Order not found');
    }

    // Generate HTML content for PDF
    const htmlContent = generateHTMLContent(order, type);
    
    // Try to generate PDF, fallback to HTML if PDF service unavailable
    const pdfResult = await generatePDF(htmlContent, `${type}_${order.order_number}.pdf`);
    
    if (pdfResult.success && pdfResult.contentType === 'application/pdf') {
      // Return PDF as binary data
      return new Response(pdfResult.data, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfResult.filename}"`
        },
        status: 200,
      });
    } else {
      // Fallback to HTML
      return new Response(
        JSON.stringify({
          html: htmlContent,
          filename: pdfResult.filename,
          error: pdfResult.error || 'PDF service unavailable, returning HTML'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
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
  const documentType = type === 'quote' ? 'quote' : 'receipt';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - ${order.order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: Arial, sans-serif; 
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 0;
        }
        
        .document {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        
        .header {
          background: #1e90ff;
          color: white;
          text-align: center;
          padding: 15px;
        }
        
        .company-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .regions {
          font-size: 12px;
          margin-bottom: 10px;
        }
        
        .document-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1e90ff;
          color: white;
          padding: 10px 15px;
          font-weight: bold;
        }
        
        .main-content {
          border: 2px solid #1e90ff;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid #000;
        }
        
        .details-section {
          border-right: 1px solid #000;
          padding: 10px;
        }
        
        .details-section:last-child {
          border-right: none;
        }
        
        .section-header {
          background: #f0f0f0;
          font-weight: bold;
          padding: 5px;
          border-bottom: 1px solid #000;
          margin: -10px -10px 10px -10px;
        }
        
        .detail-row {
          margin-bottom: 5px;
        }
        
        .detail-label {
          font-weight: bold;
          display: inline-block;
          width: 120px;
        }
        
        .customer-notes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid #000;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0;
        }
        
        .items-table th {
          background: #1e90ff;
          color: white;
          padding: 10px;
          text-align: center;
          font-weight: bold;
          border: 1px solid #000;
        }
        
        .items-table td {
          padding: 8px 10px;
          border: 1px solid #000;
          text-align: center;
        }
        
        .items-table td:first-child {
          text-align: left;
        }
        
        .items-table td:last-child {
          text-align: right;
          font-weight: bold;
        }
        
        .total-row {
          background: #f0f0f0;
          font-weight: bold;
        }
        
        .grand-total {
          background: #1e90ff;
          color: white;
          font-size: 14px;
        }
        
        .footer-note {
          text-align: center;
          padding: 10px;
          font-style: italic;
          border-top: 1px solid #000;
        }
        
        @media print {
          body { margin: 0; }
          .document { max-width: none; }
        }
      </style>
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="company-title">Global Event Technology Solutions Partner • hire@oneworldrental.com</div>
          <div class="regions">UK • USA • CANADA • EUROPE • UAE • SINGAPORE • AUSTRALIA</div>
        </div>
        
        <div class="document-info">
          <span>${title}</span>
          <span>Generated on: ${new Date().toLocaleDateString('en-CA')}</span>
        </div>
        
        <div class="main-content">
          <div class="details-grid">
            <div class="details-section">
              <div class="section-header">EVENT DETAILS</div>
              <div class="detail-row">
                <span class="detail-label">Rental Start Date:</span>
                <span>${order.event_start_date || 'TBD'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Rental End Date:</span>
                <span>${order.event_end_date || 'TBD'}</span>
              </div>
            </div>
            
            <div class="details-section">
              <div class="section-header">CONTACT BRANCH</div>
              <div class="detail-row">One World Rental USA Inc,</div>
              <div class="detail-row">85 Horsehill Road, Cedar Knolls,</div>
              <div class="detail-row">NJ 07927, USA</div>
              <br>
              <div class="detail-row">Tel: +1 602 737 0011</div>
              <div class="detail-row">E-Mail: givergy@oneworldrental.com</div>
            </div>
          </div>
          
          <div class="customer-notes-grid">
            <div class="details-section">
              <div class="section-header">CUSTOMER DETAILS</div>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span>${order.customer_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Company:</span>
                <span>${order.company_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span>${order.customer_email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span>${order.customer_phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Event:</span>
                <span>${order.event_name}</span>
              </div>
              ${order.shipping_address ? `
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span>${order.shipping_address}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="details-section">
              <div class="section-header">${title} NOTES</div>
              <div>${order.message || 'Chargers and cables will be included with the order.'}</div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 15%;">Quantity</th>
                <th style="width: 15%;">Price</th>
                <th style="width: 20%;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${(order.order_items || []).map((item: any) => `
                <tr>
                  <td>${item.product_title || 'Unknown Item'}</td>
                  <td>${item.quantity || 0}</td>
                  <td>$${Number(item.product_price || 0).toFixed(2)}</td>
                  <td>$${Number(item.line_total || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
              ${(!order.order_items || order.order_items.length === 0) ? `
                <tr>
                  <td colspan="4" style="text-align: center; font-style: italic;">No items found</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="3">Delivery & Setup:</td>
                <td>$${Number(order.shipping_cost || 0).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Pickup & Collection:</td>
                <td>$${Number(order.collection_cost || 0).toFixed(2)}</td>
              </tr>
              <tr class="grand-total">
                <td colspan="3">Total Estimated Cost:</td>
                <td>$${Number(order.total_amount || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer-note">
            *Chargers and cables will be included with the order.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Function to convert HTML to PDF using a service
async function generatePDF(htmlContent: string, filename: string) {
  try {
    // Use htmlcsstoimage.com API for HTML to PDF conversion
    const apiKey = Deno.env.get('HTMLCSSTOIMAGE_API_KEY');
    
    if (!apiKey) {
      // Fallback to HTML if no PDF service configured
      console.log('No PDF service configured, returning HTML');
      return {
        success: true,
        data: htmlContent,
        filename: filename.replace('.pdf', '.html'),
        contentType: 'text/html'
      };
    }

    const response = await fetch('https://hcti.io/v1/image', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        css: '',
        google_fonts: 'Arial',
        format: 'pdf',
        viewport_width: 800,
        viewport_height: 1200,
      }),
    });

    if (!response.ok) {
      throw new Error(`PDF service error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.url) {
      // Download the PDF
      const pdfResponse = await fetch(result.url);
      const pdfBuffer = await pdfResponse.arrayBuffer();
      
      return {
        success: true,
        data: pdfBuffer,
        filename: filename,
        contentType: 'application/pdf'
      };
    } else {
      throw new Error('PDF generation failed');
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    // Fallback to HTML
    return {
      success: false,
      data: htmlContent,
      filename: filename.replace('.pdf', '.html'),
      contentType: 'text/html',
      error: error.message
    };
  }
}