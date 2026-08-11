import nodemailer from "nodemailer";

/**
 * Send an email via SMTP (Nodemailer).
 * @param {Object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 */
const sendEmail = async ({ to, subject, html }) => {
  const smtpUser = (process.env.SMTP_USER || "").trim();
  const smtpPass = (process.env.SMTP_PASS || "").trim();
  const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const fromName = (process.env.EMAIL_FROM_NAME || "MehzHaya").trim();
  const fromAddress = (process.env.EMAIL_FROM || smtpUser || "mehzhaya@gmail.com").trim();

  const message = {
    from: `"${fromName}" <${fromAddress}>`,
    to: (to || "").trim(),
    subject,
    html,
  };

  const info = await transporter.sendMail(message);
  return info;
};

export default sendEmail;
