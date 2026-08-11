import nodemailer from "nodemailer";

/**
 * Send an email via SMTP (Nodemailer).
 * @param {Object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 */
const sendEmail = async ({ to, subject, html }) => {
  const smtpUser = (process.env.SMTP_USER || "mehzhaya@gmail.com").trim();
  const smtpPass = (process.env.SMTP_PASS || "dggy eebb ntib flyi").trim();
  const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  const isGmail = smtpHost.includes("gmail") || smtpUser.endsWith("@gmail.com");

  const transportOptions = isGmail
    ? {
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
      }
    : {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
      };

  const transporter = nodemailer.createTransport(transportOptions);

  try {
    await transporter.verify();
    console.log("SMTP READY");
  } catch (verifyErr) {
    console.log("SMTP FAILED");
    console.log("[EMAIL ERROR]");
    console.log(verifyErr.message);
    console.log(verifyErr.code);
    throw verifyErr;
  }

  const fromName = (process.env.EMAIL_FROM_NAME || "MehzHaya").trim();
  const fromAddress = (process.env.EMAIL_FROM || smtpUser || "mehzhaya@gmail.com").trim();

  const message = {
    from: `"${fromName}" <${fromAddress}>`,
    to: (to || "").trim(),
    subject,
    html,
  };

  try {
    console.log("[EMAIL] Sending started");
    const info = await transporter.sendMail(message);
    console.log("[EMAIL] Sent successfully");
    console.log(info.messageId);
    return info;
  } catch (error) {
    console.log("[EMAIL ERROR]");
    console.log(error.message);
    console.log(error.code);
    throw error;
  }
};

export default sendEmail;
