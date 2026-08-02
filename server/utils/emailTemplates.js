/**
 * Branded HTML email templates for MehzHaya.
 * Palette derived from the brand logo: espresso brown, camel gold, cream.
 */
const BROWN = "#064e3b";
const CAMEL = "#d4af37";
const CREAM = "#f5f5dc";

const logoUrl = () => `${process.env.CLIENT_URL || ""}/logo.jpg`;

const wrapper = (content) => `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #eee;border-radius:12px;overflow:hidden">
  <div style="background:${BROWN};padding:24px;text-align:center">
    <img src="${logoUrl()}" alt="MehzHaya" style="height:60px;width:auto;border-radius:10px;background:#fff;padding:6px" />
    <p style="color:${CAMEL};margin:10px 0 0;font-size:12px;letter-spacing:3px">ELEGANCE IN MODESTY</p>
  </div>
  <div style="padding:32px;color:#333;line-height:1.6">${content}</div>
  <div style="background:${CREAM};padding:16px;text-align:center;color:#555;font-size:12px">
    <p style="margin:0">Shyam Colony Part-1, Faridabad, Haryana – 121003</p>
    <p style="margin:4px 0 0">Call us: 8700695794</p>
    <p style="margin:8px 0 0">© ${new Date().getFullYear()} MehzHaya. All rights reserved.</p>
  </div>
</div>`;

const cta = (url, label) =>
  `<p style="text-align:center;margin:28px 0">
    <a href="${url}" style="background:${BROWN};color:${CAMEL};text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold">${label}</a>
  </p>`;

export const verifyEmailTemplate = (name, url) =>
  wrapper(`
    <h2 style="color:${BROWN}">Welcome, ${name}! 🌸</h2>
    <p>Thank you for joining MehzHaya. Please verify your email address to activate your account.</p>
    ${cta(url, "Verify Email")}
    <p style="font-size:13px;color:#777">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
  `);

export const resetPasswordTemplate = (name, url) =>
  wrapper(`
    <h2 style="color:${BROWN}">Password Reset Request</h2>
    <p>Hi ${name}, we received a request to reset your password.</p>
    ${cta(url, "Reset Password")}
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
    <h2 style="color:${BROWN}">Order Confirmed! 🎉</h2>
    <p>Hi ${name}, thank you for shopping with MehzHaya. Your order <strong>${order.orderId}</strong> has been placed successfully.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <thead>
        <tr style="background:${CREAM}">
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
    <p style="text-align:right;margin:8px 0;font-size:18px;color:${BROWN}"><strong>Total: ₹${order.totalPrice}</strong></p>
    <p>Payment Method: <strong>${order.paymentMethod}</strong></p>
    <p>We'll notify you when your order ships. 🤎</p>
  `);
};

export const contactInquiryTemplate = (name, email, message, createdAt) =>
  wrapper(`
    <h2 style="color:${BROWN}">New Contact Inquiry Received - MehzHaya 📩</h2>
    <p>A new customer inquiry has been received through the website contact form.</p>
    <div style="background:${CREAM};padding:16px;border-radius:8px;margin:20px 0">
      <p style="margin:4px 0"><strong>Customer Name:</strong> ${name}</p>
      <p style="margin:4px 0"><strong>Customer Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p style="margin:4px 0"><strong>Submitted Date:</strong> ${new Date(createdAt).toLocaleString("en-IN")}</p>
    </div>
    <div style="background:#f9f9f9;border-left:4px solid ${CAMEL};padding:16px;border-radius:4px;margin:20px 0">
      <p style="margin:0 0 6px;font-weight:bold;color:${BROWN}">Message:</p>
      <p style="margin:0;white-space:pre-wrap;color:#444">${message}</p>
    </div>
    <p style="font-size:13px;color:#777">You can manage this message directly inside your MehzHaya Admin Panel.</p>
  `);

export default { verifyEmailTemplate, resetPasswordTemplate, orderConfirmationTemplate, contactInquiryTemplate };
