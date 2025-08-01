import { format } from 'date-fns';

export function createOrderEmail(order: any, type: string) {
  const title = type === 'confirmation' ? 'Order Confirmation' : 'Thank You for Your Order!';
  const orderDate = format(new Date(order.created_at), 'MMMM dd, yyyy');

  return `
    <html>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <header style="text-align: center; padding: 10px 0;">
          <h1 style="margin: 0;">${title}</h1>
        </header>
        <section style="margin: 20px 0;">
          <p>Hi ${order.customer_name},</p>
          <p>Thank you for your order placed on <strong>${orderDate}</strong>.</p>
          <h3>Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border-bottom: 2px solid #000; text-align: left; padding: 8px 0;">Product</th>
                <th style="border-bottom: 2px solid #000; text-align: right; padding: 8px 0;">Quantity</th>
                <th style="border-bottom: 2px solid #000; text-align: right; padding: 8px 0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map((item: any) => `
                <tr>
                  <td style="padding: 8px 0;">${item.product_title}</td>
                  <td style="padding: 8px 0; text-align: right;">${item.quantity}</td>
                  <td style="padding: 8px 0; text-align: right;">$${(item.line_total).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <h3>Total: $${order.total_amount.toFixed(2)}</h3>
        </section>
        <footer style="text-align: center; margin-top: 20px;">
          <p>For any questions, reach us at:
            <a href="mailto:contact@company.com">contact@company.com</a>
          </p>
        </footer>
      </div>
    </body>
    </html>
  `;
}
