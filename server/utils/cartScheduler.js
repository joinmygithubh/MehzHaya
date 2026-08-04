import crypto from "crypto";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import sendEmail from "./sendEmail.js";
import { sendWhatsAppAbandonedCartReminder } from "./whatsappService.js";

/**
 * Background Task: Detect inactive carts (>30 mins), mark as abandoned, and trigger recovery workflows.
 */
export const scanAbandonedCarts = async () => {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find non-empty carts updated before 30 mins ago that are not yet recovered/marked
    const abandonedCarts = await Cart.find({
      updatedAt: { $lte: thirtyMinsAgo },
      "items.0": { $exists: true },
      isAbandoned: false,
    }).populate("user", "name email phone");

    for (const cart of abandonedCarts) {
      if (!cart.user) continue;

      const recoveryToken = crypto.randomBytes(24).toString("hex");
      cart.isAbandoned = true;
      cart.abandonedAt = new Date();
      cart.recoveryToken = recoveryToken;
      cart.recoveryStatus = "Sent";
      await cart.save();

      const storeUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const restoreUrl = `${storeUrl}/cart?restore=${recoveryToken}`;

      // 1. Send Recovery Email
      try {
        const emailHtml = `
          <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; padding: 24px; border-radius: 12px;">
            <h2 style="color: #b8935a;">Did you leave something behind? 🌸</h2>
            <p>Hello ${cart.user.name || "there"},</p>
            <p>We noticed you left items in your shopping cart. Don't worry, we've saved your bag so you can complete your order anytime!</p>
            <p style="margin: 20px 0;"><a href="${restoreUrl}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Restore My Cart & Checkout</a></p>
            <p style="font-size: 12px; color: #666;">If you have any questions, reply to this email or chat with us on WhatsApp.</p>
          </div>
        `;
        await sendEmail({
          email: cart.user.email,
          subject: "Your MehzHaya Shopping Cart is Saved ✦",
          html: emailHtml,
        });
      } catch (emailErr) {
        console.warn("Abandoned cart email error:", emailErr.message);
      }

      // 2. Send WhatsApp Recovery Link
      try {
        await sendWhatsAppAbandonedCartReminder(cart, cart.user, restoreUrl);
      } catch (waErr) {
        console.warn("Abandoned cart WhatsApp error:", waErr.message);
      }
    }
  } catch (err) {
    console.error("Cart scheduler error:", err);
  }
};

export const startCartScheduler = () => {
  // Run scan every 10 minutes
  setInterval(scanAbandonedCarts, 10 * 60 * 1000);
  // Run initial scan after 1 minute of server startup
  setTimeout(scanAbandonedCarts, 60 * 1000);
};
