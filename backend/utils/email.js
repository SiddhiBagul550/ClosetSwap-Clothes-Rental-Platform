const nodemailer = require("nodemailer");

/* Lazy, not created at module load: server.js requires app.js (which pulls
   this module in) before calling dotenv.config(), so reading GMAIL_USER /
   GMAIL_APP_PASSWORD at the top level would always see them as unset. */
let transporter;
const getTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
  }
  return transporter;
};

/* No Gmail credentials means no account is set up yet - fall back to logging
   the email server-side so the flow (signup, verify, password reset) stays
   testable end to end without one. Once GMAIL_USER/GMAIL_APP_PASSWORD are
   added to config.env, real emails go out instead. */
exports.sendEmail = async ({ to, subject, html, text }) => {
  const client = getTransporter();
  if (!client) {
    console.log(`[email] (no GMAIL_USER/GMAIL_APP_PASSWORD set) to=${to} subject="${subject}"\n${text}`);
    return;
  }

  await client.sendMail({
    from: `ClosetSwap <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
};

exports.verificationEmail = (link) => ({
  subject: "Verify your email for ClosetSwap",
  text: `Verify your email: ${link}\n\nThis link expires in 24 hours.`,
  html: `<p>Welcome to ClosetSwap! Verify your email address:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
});

exports.passwordResetEmail = (code) => ({
  subject: "Your ClosetSwap password reset code",
  text: `Your password reset code is ${code}. It expires in 10 minutes.`,
  html: `<p>Your password reset code is <b>${code}</b>.</p><p>It expires in 10 minutes.</p>`,
});
