import { Router } from 'express';
import { Contact } from '../models/Contact.js';
import { sendEmail } from '../utils/email.js';
import config from '../config.js';
import { successResponse, errorResponse, isValidEmail } from '../utils/helpers.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json(errorResponse('Name, email and message are required', 400));
    }
    if (!isValidEmail(email)) {
      return res.status(400).json(errorResponse('Invalid email format', 400));
    }
    if (message.trim().length < 10) {
      return res.status(400).json(errorResponse('Message must be at least 10 characters', 400));
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      subject: subject?.trim(),
      message: message.trim(),
      type,
    });

    // Send notification email (non-blocking)
    sendEmail({
      to: config.smtp.user,
      subject: `New ${type || 'Contact'}: ${subject || name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0B2855;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
          <p><strong>Message:</strong></p>
          <div style="background: #F7F9FC; padding: 15px; border-radius: 8px;">
            ${message}
          </div>
        </div>
      `,
    }).catch(() => {});

    res.status(201).json(successResponse(
      { id: contact._id },
      'Message sent successfully. We will get back to you soon!',
      201
    ));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

export default router;
