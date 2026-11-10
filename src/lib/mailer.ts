import nodemailer, { type Transporter } from "nodemailer";

/**
 * Sends email through any SMTP service (Gmail app password, Brevo, Zoho, Resend SMTP...).
 * When SMTP_* is not set, nothing is sent and nothing breaks: the store simply works without emails.
 */
export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transport: Transporter | null = null;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }): Promise<boolean> {
  if (!mailConfigured()) return false;
  try {
    await getTransport().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    return true;
  } catch (e) {
    // A failed email must never fail an order.
    console.error("[mail] could not send:", e instanceof Error ? e.message : e);
    return false;
  }
}
