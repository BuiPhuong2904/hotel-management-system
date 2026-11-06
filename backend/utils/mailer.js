const nodemailer = require('nodemailer');

let transporter = null;

const isConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: String(process.env.SMTP_SECURE ?? (port === 465)) === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const sendMail = async ({ to, subject, text, html, attachments = [] }) => {
  if (!isConfigured()) {
    const err = new Error('Chưa cấu hình SMTP');
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }
  return getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    attachments,
  });
};

module.exports = { isConfigured, sendMail };