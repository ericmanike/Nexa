import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, text, from }: SendEmailArgs) {
  const fromEmail = from || process.env.RESEND_FROM_EMAIL || 'info@nyamekyeloans.com';

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: html || '',
      text: text || '',
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending email via Resend:', error);
    return { success: false, error: error.message || error };
  }
}
