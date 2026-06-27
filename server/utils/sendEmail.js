import nodemailer from "nodemailer";

/**
 * Send an email via SMTP (Nodemailer).
 * @param {Object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `"${process.env.EMAIL_FROM_NAME || "MehzHaya"}" <${
      process.env.EMAIL_FROM || process.env.SMTP_USER
    }>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(message);
  return info;
};

export default sendEmail;
