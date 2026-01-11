/**
 * Vercel Serverless Function: Contact Form Handler
 *
 * Receives contact form submissions and sends emails via Resend.
 * The RESEND_API_KEY is stored server-side and never exposed to the client.
 *
 * Endpoint: POST /api/contact
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface ResendEmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
  reply_to: string;
}

interface ResendSuccessResponse {
  id: string;
}

interface ResendErrorResponse {
  statusCode: number;
  message: string;
  name: string;
}

/**
 * Validates the contact form data
 */
function validateFormData(
  data: unknown
): { valid: true; data: ContactFormData } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { name, email, message } = data as Record<string, unknown>;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valid: false, error: 'Name is required (minimum 2 characters)' };
  }

  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address' };
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return {
      valid: false,
      error: 'Message is required (minimum 10 characters)',
    };
  }

  // Sanitize inputs
  return {
    valid: true,
    data: {
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 254),
      message: message.trim().slice(0, 5000),
    },
  };
}

/**
 * Creates HTML email content
 */
function createEmailHtml(data: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Portfolio Message</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="margin-bottom: 20px;">
            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">From</strong>
            <p style="margin: 5px 0 0; font-size: 16px;">${escapeHtml(data.name)}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</strong>
            <p style="margin: 5px 0 0; font-size: 16px;">
              <a href="mailto:${escapeHtml(data.email)}" style="color: #667eea; text-decoration: none;">${escapeHtml(data.email)}</a>
            </p>
          </div>
          <div style="margin-bottom: 20px;">
            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</strong>
            <div style="margin-top: 10px; padding: 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This message was sent from your portfolio contact form.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers for preflight requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check for required environment variables
  const resendApiKey = process.env.RESEND_API_KEY;
  const recipientEmail = process.env.CONTACT_EMAIL;
  const senderEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable is not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  if (!recipientEmail) {
    console.error('CONTACT_EMAIL environment variable is not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  // Validate form data
  const validation = validateFormData(req.body);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const { name, email, message } = validation.data;

  try {
    // Send email via Resend API
    const emailPayload: ResendEmailPayload = {
      from: senderEmail || 'Portfolio Contact <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `Portfolio Contact: ${name}`,
      html: createEmailHtml({ name, email, message }),
      reply_to: email,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const responseData = (await response.json()) as
      | ResendSuccessResponse
      | ResendErrorResponse;

    if (!response.ok) {
      const errorResponse = responseData as ResendErrorResponse;
      console.error('Resend API error:', errorResponse);
      res.status(response.status).json({
        error: 'Failed to send message. Please try again later.',
      });
      return;
    }

    const successResponse = responseData as ResendSuccessResponse;
    console.log('Email sent successfully:', successResponse.id);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send message. Please try again later.',
    });
  }
}
