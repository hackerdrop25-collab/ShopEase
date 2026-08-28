/**
 * ShopEase - Email Utility (Nodemailer)
 *
 * Provides a reusable sendEmail() function for:
 *  - Email verification
 *  - Forgot password / reset password links
 *  - Order confirmation emails
 *
 * Configured via environment variables.
 */

const nodemailer = require('nodemailer');

/**
 * Creates and caches a Nodemailer transporter.
 * In development, uses Mailtrap (or any SMTP sandbox).
 * In production, swap EMAIL_HOST/PORT/USER/PASS for your real provider.
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Sends an email.
 *
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.text    - Plain-text body (for non-HTML clients)
 * @param {string} [options.html]  - HTML body (optional)
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"ShopEase" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV === 'development') {
    console.log(`📧 Email sent to ${to} | Message ID: ${info.messageId}`);
  }

  return info;
};

module.exports = { sendEmail };
