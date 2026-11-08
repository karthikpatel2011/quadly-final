// Mail delivery adapter. The admin mail center composes mail; delivery
// depends on what is configured:
//   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_FROM in backend/.env
//   → real SMTP delivery via nodemailer.
// Without SMTP credentials, mail is stored as 'queued' in the outbox
// document — visible in the admin mail center, deliverable the moment
// SMTP is added. No Cloudflare routing, no third-party mail service.

const SMTP_READY = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export async function deliverMail({ to, subject, body }) {
  if (!SMTP_READY()) {
    return {
      status: 'queued',
      provider: 'outbox',
      error: 'SMTP is not configured yet — set SMTP_HOST, SMTP_USER and SMTP_PASS in backend/.env to deliver queued mail.',
    };
  }

  try {
    const nodemailer = (await import('nodemailer')).default;
    const port = Number(process.env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: body,
    });
    return { status: 'sent', provider: 'smtp' };
  } catch (err) {
    return { status: 'failed', provider: 'smtp', error: String(err?.message || err).slice(0, 300) };
  }
}
