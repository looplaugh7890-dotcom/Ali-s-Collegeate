import nodemailer from 'nodemailer';
import config from '../config.js';

let cachedTransporter = null;
let lastVerifyTime = 0;
const REVERIFY_INTERVAL = 5 * 60 * 1000; // re-verify every 5 minutes

function createTransporter() {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    requireTLS: config.smtp.port !== 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

function getTransporter() {
  const now = Date.now();
  if (!cachedTransporter || (now - lastVerifyTime > REVERIFY_INTERVAL)) {
    if (cachedTransporter) {
      cachedTransporter.close().catch(() => {});
    }
    cachedTransporter = createTransporter();
    lastVerifyTime = now;
  }
  return cachedTransporter;
}

export async function verifyEmailConnection() {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error.message);
    console.error('Emails will not be sent. Check SMTP_USER and SMTP_PASS in .env');
    cachedTransporter = null;
    lastVerifyTime = 0;
    return false;
  }
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!config.smtp.user || !config.smtp.pass) {
      console.error('Email not configured: SMTP_USER or SMTP_PASS missing in .env');
      return false;
    }
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: `"The Ali's Collegiate" <${config.emailFrom}>`,
      to,
      subject,
      html,
      text,
      headers: {
        'List-Unsubscribe': `<mailto:info@thealiscollegiate.edu.pk?subject=unsubscribe>`,
        'X-Mailer': 'TheAliCollegiate-Mailer',
        'Precedence': 'bulk',
      },
      replyTo: 'info@thealiscollegiate.edu.pk',
    });
    console.log(`Email sent to ${to}: ${subject} (messageId: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`Email send error to ${to}:`, error.message);
    if (error.code) console.error('Error code:', error.code);
    cachedTransporter = null;
    lastVerifyTime = 0;
    return false;
  }
}

export function applicationConfirmationEmail(application) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0B2855; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">The Ali's Collegiate</h1>
        <p style="margin: 5px 0 0;">Passion for Victory</p>
      </div>
      <div style="padding: 30px; border: 1px solid #eee;">
        <h2 style="color: #0B2855;">Application Submitted Successfully</h2>
        <p>Dear ${application.firstName} ${application.lastName},</p>
        <p>Thank you for applying to The Ali's Collegiate. Your application has been received.</p>
        <div style="background: #F7F9FC; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Application Number:</strong> ${application.applicationNumber}</p>
          <p style="margin: 5px 0;"><strong>Program:</strong> ${application.program}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Submitted</p>
        </div>
        <p>You can track your application status using your application number on our website.</p>
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br/>The Ali's Collegiate Team</p>
      </div>
      <div style="background: #F7F9FC; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>The Ali's Collegiate | Passion for Victory</p>
      </div>
    </div>
  `;
}

export function applicationAcceptedEmail(application, passwordLineOrTempPassword) {
  // Support both raw password string and pre-formatted HTML line
  const passwordHtml = passwordLineOrTempPassword.includes('<')
    ? passwordLineOrTempPassword
    : `<p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${passwordLineOrTempPassword}</code></p>`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0B2855; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">The Ali's Collegiate</h1>
        <p style="margin: 5px 0 0;">Passion for Victory</p>
      </div>
      <div style="padding: 30px; border: 1px solid #eee;">
        <h2 style="color: #16a34a;">Application Accepted!</h2>
        <p>Dear ${application.firstName} ${application.lastName},</p>
        <p>Congratulations! Your admission application has been <strong>accepted</strong>.</p>
        <div style="background: #F7F9FC; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Application Number:</strong> ${application.applicationNumber}</p>
          <p style="margin: 5px 0;"><strong>Program:</strong> ${application.program}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${application.email}</p>
          ${passwordHtml}
        </div>
        <p><strong>Next steps:</strong></p>
        <ol>
          <li>Visit the campus with original documents</li>
          <li>Submit the admission fee (Rs. 6,500)</li>
          <li>Login at <a href="http://localhost:8080/portal/login">the student portal</a> using the email and temporary password above</li>
          <li>Change your password after first login</li>
        </ol>
        <p>Best regards,<br/>The Ali's Collegiate Team</p>
      </div>
      <div style="background: #F7F9FC; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>The Ali's Collegiate | Passion for Victory</p>
      </div>
    </div>
  `;
}

export function applicationRejectedEmail(application) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0B2855; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">The Ali's Collegiate</h1>
        <p style="margin: 5px 0 0;">Passion for Victory</p>
      </div>
      <div style="padding: 30px; border: 1px solid #eee;">
        <h2 style="color: #dc2626;">Application Update</h2>
        <p>Dear ${application.firstName} ${application.lastName},</p>
        <p>Thank you for your interest in The Ali's Collegiate. After careful review, we regret to inform you that your application has not been accepted at this time.</p>
        <div style="background: #F7F9FC; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Application Number:</strong> ${application.applicationNumber}</p>
          <p style="margin: 5px 0;"><strong>Program:</strong> ${application.program}</p>
        </div>
        <p>You may contact the admissions office for more details or apply again next session.</p>
        <p>Best regards,<br/>The Ali's Collegiate Team</p>
      </div>
      <div style="background: #F7F9FC; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>The Ali's Collegiate | Passion for Victory</p>
      </div>
    </div>
  `;
}

export function paymentConfirmationEmail(payment, student) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0B2855; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">The Ali's Collegiate</h1>
        <p style="margin: 5px 0 0;">Passion for Victory</p>
      </div>
      <div style="padding: 30px; border: 1px solid #eee;">
        <h2 style="color: #0B2855;">Payment Confirmation</h2>
        <p>Dear ${student?.name || 'Student'},</p>
        <p>Your payment has been received successfully.</p>
        <div style="background: #F7F9FC; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Reference:</strong> ${payment.reference}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> Rs. ${payment.amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Paid</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Thank you for your payment.</p>
        <p>Best regards,<br/>The Ali's Collegiate Team</p>
      </div>
    </div>
  `;
}
