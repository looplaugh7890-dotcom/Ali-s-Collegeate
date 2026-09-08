import { Router } from 'express';
import Stripe from 'stripe';
import config from '../config.js';
import { Payment } from '../models/Payment.js';
import { Application } from '../models/Application.js';
import { Student } from '../models/Student.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendEmail, paymentConfirmationEmail } from '../utils/email.js';
import { successResponse, errorResponse, generateUniqueNumber } from '../utils/helpers.js';

const router = Router();

// Lazy Stripe initialization — won't crash if env var is missing
let stripe = null;
function getStripe() {
  if (!stripe && config.stripe.secretKey) {
    stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2026-07-29.dahlia' });
  }
  return stripe;
}

// Create checkout session
router.post('/create-session', async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(503).json(errorResponse('Payment system is not configured. Please try again later.', 503));
    }

    const { amount, applicationId, description, email, studentName } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json(errorResponse('A valid payment amount is required', 400));
    }

    let retries = 3;
    let reference;
    let session;
    let payment;

    while (retries > 0) {
      try {
        reference = generateUniqueNumber('PAY');

        session = await stripeInstance.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'pkr',
              product_data: {
                name: description || "The Ali's Collegiate — Admission Fee",
                description: studentName ? `Payment for ${studentName}` : undefined,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${config.frontendUrl}/admissions/status?payment=success&ref=${reference}`,
          cancel_url: `${config.frontendUrl}/admissions/apply?payment=cancelled`,
          metadata: { applicationId: applicationId || '', reference },
          customer_email: email,
        });

        payment = await Payment.create({
          reference,
          amount,
          currency: 'PKR',
          method: 'stripe',
          status: 'pending',
          application: applicationId || undefined,
          stripeSessionId: session.id,
          description,
        });

        break;
      } catch (err) {
        retries--;
        if (err.code === 11000 && retries > 0) continue;
        throw err;
      }
    }

    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, {
        paymentReference: reference,
        paymentAmount: amount,
        paymentStatus: 'pending',
        stripePaymentIntentId: session.payment_intent,
      }).catch(() => {}); // non-blocking
    }

    res.json(successResponse({
      sessionId: session.id,
      url: session.url,
      reference,
    }, 'Payment session created'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// Stripe webhook
router.post('/webhook', async (req, res) => {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    return res.status(503).json(errorResponse('Payment system not configured', 503));
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || !config.stripe.webhookSecret) {
    return res.status(400).json(errorResponse('Missing webhook signature or secret', 400));
  }

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json(errorResponse(`Webhook Error: ${err.message}`, 400));
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const payment = await Payment.findOne({ stripeSessionId: session.id });
      if (payment) {
        payment.status = 'paid';
        payment.paidAt = new Date();
        payment.stripePaymentIntentId = session.payment_intent;
        await payment.save();
        if (payment.application) {
          await Application.findByIdAndUpdate(payment.application, {
            paymentStatus: 'paid',
            status: 'under-review',
          });
        }
        // Send confirmation email
        if (session.customer_email) {
          sendEmail({
            to: session.customer_email,
            subject: `Payment Confirmation — ${payment.reference}`,
            html: paymentConfirmationEmail(payment, { name: session.customer_details?.name || 'Student' }),
          }).catch(() => {});
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'failed' }
      );
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Stripe retries for DB errors
    res.json({ received: true, error: error.message });
  }
});

// Verify payment
router.get('/verify/:reference', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findOne({ reference: req.params.reference });
    if (!payment) return res.status(404).json(errorResponse('Payment not found', 404));
    res.json(successResponse(payment));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// Payment history for logged-in student
router.get('/history', authenticate, async (req, res) => {
  try {
    // req.user._id is a User ID, need to find the Student first
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      // If user is admin, show all payments
      if (req.user.role === 'admin') {
        const payments = await Payment.find().sort({ createdAt: -1 }).limit(50);
        return res.json(successResponse(payments));
      }
      return res.json(successResponse([]));
    }
    const payments = await Payment.find({ student: student._id }).sort({ createdAt: -1 });
    res.json(successResponse(payments));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
