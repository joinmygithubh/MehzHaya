import asyncHandler from "express-async-handler";
import validator from "validator";
import ContactMessage from "../models/ContactMessage.js";
import ApiError from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";
import { contactInquiryTemplate } from "../utils/emailTemplates.js";

// @desc    Submit a contact message
// @route   POST /api/v1/contact
// @access  Public
export const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    throw new ApiError(400, "Please enter a valid name (at least 2 characters)");
  }

  if (!email || typeof email !== "string" || !validator.isEmail(email.trim())) {
    throw new ApiError(400, "Please enter a valid email address");
  }

  if (!message || typeof message !== "string" || message.trim().length < 5) {
    throw new ApiError(400, "Please enter a message (at least 5 characters)");
  }

  if (message.trim().length > 2000) {
    throw new ApiError(400, "Message cannot exceed 2000 characters");
  }

  // Create message in DB first
  const contactMessage = await ContactMessage.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
  });

  // Admin Receiver Email from env or fallback
  const adminReceiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "mehzhaya@gmail.com";

  // Send Email Notification to Admin (Non-blocking)
  sendEmail({
    to: adminReceiverEmail,
    subject: "New Contact Inquiry Received - MehzHaya",
    html: contactInquiryTemplate(
      contactMessage.name,
      contactMessage.email,
      contactMessage.message,
      contactMessage.createdAt
    ),
  })
    .then(() => console.log(`📧 Contact inquiry email sent to ${adminReceiverEmail}`))
    .catch((err) =>
      console.error(`❌ Email notification failed for contact message ${contactMessage._id}:`, err.message)
    );

  res.status(201).json({
    success: true,
    message: "Your message has been received successfully. We will get back to you shortly.",
    data: contactMessage,
  });
});

// @desc    Get all contact messages (Admin)
// @route   GET /api/v1/admin/contact-messages
// @access  Private/Admin
export const getAllContactMessages = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  const filter = {};

  // Status Filter
  if (req.query.status && req.query.status !== "ALL") {
    filter.status = req.query.status.toUpperCase();
  }

  // Search Filter
  if (req.query.search) {
    const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const sanitizedSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (sanitizedSearch) {
      filter.$or = [
        { name: { $regex: sanitizedSearch, $options: "i" } },
        { email: { $regex: sanitizedSearch, $options: "i" } },
        { message: { $regex: sanitizedSearch, $options: "i" } },
      ];
    }
  }

  const total = await ContactMessage.countDocuments(filter);
  const messages = await ContactMessage.find(filter)
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    messages,
  });
});

// @desc    Get single contact message (Admin)
// @route   GET /api/v1/admin/contact-messages/:id
// @access  Private/Admin
export const getContactMessageById = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) {
    throw new ApiError(404, "Contact message not found");
  }

  // Auto-mark NEW messages as READ
  if (message.status === "NEW") {
    message.status = "READ";
    await message.save();
  }

  res.status(200).json({ success: true, message });
});

// @desc    Update contact message status (Admin)
// @route   PATCH /api/v1/admin/contact-messages/:id
// @access  Private/Admin
export const updateContactMessageStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["NEW", "READ", "REPLIED", "RESOLVED"];

  if (!status || !validStatuses.includes(status.toUpperCase())) {
    throw new ApiError(400, `Invalid status. Allowed: ${validStatuses.join(", ")}`);
  }

  const message = await ContactMessage.findById(req.params.id);
  if (!message) {
    throw new ApiError(404, "Contact message not found");
  }

  message.status = status.toUpperCase();
  await message.save();

  res.status(200).json({
    success: true,
    message: "Contact message status updated",
    data: message,
  });
});

// @desc    Delete contact message (Admin)
// @route   DELETE /api/v1/admin/contact-messages/:id
// @access  Private/Admin
export const deleteContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) {
    throw new ApiError(404, "Contact message not found");
  }

  await message.deleteOne();

  res.status(200).json({
    success: true,
    message: "Contact message deleted successfully",
  });
});
