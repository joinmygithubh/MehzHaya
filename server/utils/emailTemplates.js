/**
 * Branded HTML email templates for MehzHaya.
 */
const wrapper = (content) => `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #eee;border-radius:12px;overflow:hidden">
  <div style="background:#064e3b;padding:24px;text-align:center">
    <h1 style="color:#d4af37;margin:0;font-size:26px;letter-spacing:1px">MehzHaya</h1>
    <p style="color:#f5f5dc;margin:4px 0 0;font-size:12px;letter-spacing:2px">ELEGANCE IN EVERY FOLD</p>
  </div>
  <div style="padding:32px;color:#333;line-height:1.6">${content}</div>
  <div style="background:#f5f5dc;padding:16px;text-align:center;color:#555;font-size:12px">
    <p style="margin:0">Shyam Colony Part-1, Faridabad, Haryana – 121003</p>
    <p style="margin:4px 0 0">Call us: 8700695794</p>
    <p style="margin:8px 0 0">© ${new Date().getFullYear()} MehzHaya. All rights reserved.</p>
  </div>
</div>`;

export const verifyEmailTemplate = (name, url) =>
  wrapper(`
    <h2 style="color:#064e3b">Welcome, ${name}! 🌸</h2>
    <p>Thank you for joining MehzHaya. Please verify your email address to activate your account.</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${url}" style="background:#064e3b;color:#d4af37;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold">Verify Email</a>
    </p>
    <p style="font-size:13px;color:#777">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
  `);

export const resetPasswordTemplate = (name, url) =>
  wrapper(`
    <h2 style="color:#064e3b">Password Reset Request</h2>
    <p>Hi ${name}, we received a request to reset your password.</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${url}" style="background:#064e3b;color:#d4af37;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold">Reset Password</a>
    </p>
    <p style="font-size:13px;color:#777">This link expires in 30 minutes. If you didn't request this, you can safely ignore it.</p>
  `);

export const orderConfirmationTemplate = (name, order) => {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${i.name} ${
        i.color ? `(${i.color}${i.size ? `, ${i.size}` : ""})` : ""
      }</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${i.price * i.quantity}</td>
      </tr>`
    )
    .join("");

  return wrapper(`
    <h2 style="color:#064e3b">Order Confirmed! 🎉</h2>
    <p>Hi ${name}, thank you for shopping with MehzHaya. Your order <strong>${order.orderId}</strong> has been placed successfully.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <thead>
        <tr style="background:#f5f5dc">
          <th style="padding:8px;text-align:left">Item</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="text-align:right;margin:4px 0">Subtotal: ₹${order.itemsPrice}</p>
    <p style="text-align:right;margin:4px 0">Shipping: ₹${order.shippingPrice}</p>
    <p style="text-align:right;margin:4px 0">Discount: -₹${order.discountPrice}</p>
    <p style="text-align:right;margin:8px 0;font-size:18px;color:#064e3b"><strong>Total: ₹${order.totalPrice}</strong></p>
    <p>Payment Method: <strong>${order.paymentMethod}</strong></p>
    <p>We'll notify you when your order ships. 💚</p>
  `);
};

export default { verifyEmailTemplate, resetPasswordTemplate, orderConfirmationTemplate };
