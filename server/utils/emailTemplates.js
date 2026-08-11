/**
 * Branded HTML email templates for MehzHaya.
 * Palette derived from the brand logo: espresso brown, camel gold, cream.
 */
const BROWN = "#064e3b";
const CAMEL = "#d4af37";
const CREAM = "#f5f5dc";

const PUBLIC_LOGO_URL =
  process.env.PUBLIC_LOGO_URL ||
  "https://res.cloudinary.com/dlyzwbl46/image/upload/v1786430824/mehzhaya/brand/mehzhaya_logo.jpg";

const wrapper = (content) => `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #eee;border-radius:12px;overflow:hidden">
  <div style="background:${BROWN};padding:24px;text-align:center">
    <img src="${PUBLIC_LOGO_URL}" alt="MehzHaya Logo" style="height:65px;max-width:180px;width:auto;border-radius:10px;background:#ffffff;padding:6px;display:inline-block;margin:0 auto;" />
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
  const addr = order.shippingAddress || {};
  const shippingStr = [
    addr.fullName,
    addr.phone ? `Phone: ${addr.phone}` : "",
    addr.line1,
    addr.line2,
    `${addr.city || ""}, ${addr.state || ""} - ${addr.postalCode || ""}`,
    addr.country || "India",
  ]
    .filter(Boolean)
    .join("<br/>");

  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:10px;border-bottom:1px solid #eee;width:55px">
          ${
            i.image
              ? `<img src="${i.image}" alt="${i.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #ddd" />`
              : ""
          }
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee">
          <strong>${i.name}</strong>
          ${i.color || i.size ? `<br/><span style="font-size:12px;color:#666">${i.color || ""}${i.color && i.size ? " | " : ""}${i.size || ""}</span>` : ""}
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">₹${i.price * i.quantity}</td>
      </tr>`
    )
    .join("");

  return wrapper(`
    <h2 style="color:${BROWN}">Order Confirmed! 🎉</h2>
    <p>Hi ${name}, thank you for shopping with MehzHaya. Your order <strong>${order.orderId}</strong> has been placed successfully.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <thead>
        <tr style="background:${CREAM}">
          <th style="padding:8px;text-align:left" colspan="2">Item</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="text-align:right;margin:12px 0 font-size:14px">
      <p style="margin:4px 0">Subtotal: ₹${order.itemsPrice}</p>
      <p style="margin:4px 0">Shipping: ₹${order.shippingPrice}</p>
      ${order.discountPrice > 0 ? `<p style="margin:4px 0;color:#c00">Discount: -₹${order.discountPrice}</p>` : ""}
      <p style="margin:8px 0;font-size:18px;color:${BROWN}"><strong>Total Paid: ₹${order.totalPrice}</strong></p>
    </div>
    <p>Payment Method: <strong>${order.paymentMethod}</strong></p>

    <div style="background:#f9f9f9;border-left:4px solid ${CAMEL};padding:16px;border-radius:4px;margin:20px 0 font-size:14px">
      <h4 style="margin:0 0 6px;color:${BROWN}">Shipping Address</h4>
      <p style="margin:0;line-height:1.5;color:#444">${shippingStr}</p>
    </div>

    <p style="margin-top:20px">We'll notify you when your order ships. 🤎</p>
  `);
};

export const ownerOrderNotificationTemplate = (customerUser = {}, order = {}) => {
  const addr = order.shippingAddress || {};
  const shippingStr = [
    addr.fullName,
    addr.phone ? `Phone: ${addr.phone}` : "",
    addr.line1,
    addr.line2,
    `${addr.city || ""}, ${addr.state || ""} - ${addr.postalCode || ""}`,
    addr.country || "India",
  ]
    .filter(Boolean)
    .join("<br/>");

  const rows = (order.items || [])
    .map(
      (i) => `<tr>
        <td style="padding:10px;border-bottom:1px solid #eee;width:55px">
          ${
            i.image
              ? `<img src="${i.image}" alt="${i.name || "Item"}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #ddd" />`
              : ""
          }
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee">
          <strong>${i.name || "Item"}</strong>
          ${i.color || i.size ? `<br/><span style="font-size:12px;color:#666">${i.color || ""}${i.color && i.size ? " | " : ""}${i.size || ""}</span>` : ""}
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${i.quantity || 1}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">₹${(i.price || 0) * (i.quantity || 1)}</td>
      </tr>`
    )
    .join("");

  const custName = customerUser.name || addr.fullName || "Customer";
  const custEmail = customerUser.email || "N/A";
  const custPhone = addr.phone || customerUser.phone || "N/A";

  return wrapper(`
    <h2 style="color:${BROWN}">New Order Received! 🛍️</h2>
    <p>A new order <strong>${order.orderId || ""}</strong> has been placed on MehzHaya.</p>

    <div style="background:${CREAM};padding:16px;border-radius:8px;margin:20px 0 font-size:14px">
      <h4 style="margin:0 0 8px;color:${BROWN}">Customer Details</h4>
      <p style="margin:2px 0"><strong>Name:</strong> ${custName}</p>
      <p style="margin:2px 0"><strong>Email:</strong> <a href="mailto:${custEmail}">${custEmail}</a></p>
      <p style="margin:2px 0"><strong>Phone:</strong> ${custPhone}</p>
    </div>

    <h4 style="margin:16px 0 8px;color:${BROWN}">Order Items</h4>
    <table style="width:100%;border-collapse:collapse;margin:10px 0">
      <thead>
        <tr style="background:${CREAM}">
          <th style="padding:8px;text-align:left" colspan="2">Item</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="text-align:right;margin:16px 0 font-size:14px">
      <p style="margin:4px 0">Items Subtotal: ₹${order.itemsPrice || 0}</p>
      <p style="margin:4px 0">Shipping Fee: ₹${order.shippingPrice || 0}</p>
      ${(order.discountPrice || 0) > 0 ? `<p style="margin:4px 0;color:#c00">Discount: -₹${order.discountPrice}</p>` : ""}
      <p style="margin:8px 0;font-size:18px;color:${BROWN}"><strong>Total Amount: ₹${order.totalPrice || 0}</strong></p>
      <p style="margin:4px 0">Payment Method: <strong>${order.paymentMethod || "COD"}</strong> (${order.paymentInfo?.status || "Pending"})</p>
    </div>

    <div style="background:#f9f9f9;border-left:4px solid ${CAMEL};padding:16px;border-radius:4px;margin:20px 0 font-size:14px">
      <h4 style="margin:0 0 6px;color:${BROWN}">Shipping Address</h4>
      <p style="margin:0;line-height:1.5;color:#444">${shippingStr}</p>
    </div>
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

export default { verifyEmailTemplate, resetPasswordTemplate, orderConfirmationTemplate, ownerOrderNotificationTemplate, contactInquiryTemplate };
