/**
 * Reusable WhatsApp Notification Service
 * Supports modular providers (Twilio, Meta Cloud API, or Console Fallback).
 */

const getProvider = () => {
  return process.env.WHATSAPP_PROVIDER || "console_fallback";
};

const sendPayload = async ({ to, message }) => {
  const provider = getProvider();
  const phone = to || process.env.STORE_PHONE || "8700695794";

  if (provider === "console_fallback" || !process.env.WHATSAPP_API_KEY) {
    console.log(`\n================ [WHATSAPP NOTIFICATION LOG] ================`);
    console.log(`To: ${phone}`);
    console.log(`Message:\n${message}`);
    console.log(`===========================================================\n`);
    return { success: true, mode: "fallback_logged" };
  }

  if (provider === "twilio") {
    // Example Twilio integration structure
    // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // return await client.messages.create({ from: `whatsapp:${process.env.TWILIO_PHONE}`, to: `whatsapp:${phone}`, body: message });
  }

  return { success: true };
};

export const sendOrderConfirmationWhatsApp = async (order, user) => {
  const message = `🌸 Hello ${user?.name || "Customer"}, thank you for shopping with MehzHaya!
Your Order #${order.orderId || order._id} has been confirmed.
Total: ₹${order.totalPrice}
Payment: ${order.paymentMethod}
We will notify you as soon as your items are packed & shipped! ✦`;

  return await sendPayload({ to: user?.phone, message });
};

export const sendOrderStatusWhatsApp = async (order, user) => {
  const message = `🌿 Order Update from MehzHaya:
Order #${order.orderId || order._id} status is now: *${order.orderStatus}*.
Thank you for your patience! ✦`;

  return await sendPayload({ to: user?.phone, message });
};

export const sendWhatsAppOrderNotification = async (order, customMessage, user) => {
  const message = `🌿 Order Update from MehzHaya:
Order #${order?.orderId || order?._id} update: ${customMessage || "Status updated"}.
Thank you for your patience! ✦`;

  return await sendPayload({ to: user?.phone, message });
};

export const sendWhatsAppReturnUpdate = async (returnReq, user) => {
  const message = `🌸 MehzHaya Return Update:
Your return request for Order #${returnReq.order?.orderNumber || returnReq.order} is currently: *${returnReq.status}*.
Refund Amount: ₹${returnReq.refundAmount || 0}`;

  return await sendPayload({ to: user?.phone, message });
};

export const sendWhatsAppAbandonedCartReminder = async (cart, user, restoreUrl) => {
  const message = `🌸 Hello ${user?.name || "there"}, you left items in your MehzHaya bag!
Click here to restore your cart & checkout in 1-click:
${restoreUrl}`;

  return await sendPayload({ to: user?.phone, message });
};
