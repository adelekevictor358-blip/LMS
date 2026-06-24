import nodemailer from 'nodemailer';

/**
 * Centralised email utility for Mountain Top University.
 *
 * Reads SMTP credentials from environment variables (see the env block below).
 * If no valid credentials are present it falls back to the bundled Ethereal
 * test account so the flow is exercisable in development. When NOTHING usable
 * is configured, sendMail() no-ops gracefully (logs + returns { sent:false }),
 * so callers / API routes never throw on a mail failure.
 *
 * Expected env vars (add to .env.local to send real mail):
 *   SMTP_HOST      e.g. smtp.gmail.com
 *   SMTP_PORT      e.g. 465 (secure) or 587 (STARTTLS)  [default 587]
 *   SMTP_SECURE    'true' to force TLS on connect        [default: port===465]
 *   SMTP_USER      SMTP username / mailbox login
 *   SMTP_PASS      SMTP password / app password
 *   MAIL_FROM      From header, e.g. "Mountain Top University <no-reply@mtu.edu.ng>"
 */

// ---------------------------------------------------------------------------
// Brand tokens (inline only — email clients strip <style>/external CSS)
// ---------------------------------------------------------------------------
const BRAND = {
  green: '#0d6e4f',       // MTU primary green (header / wordmark)
  greenDark: '#0a5a40',   // hover / accents
  ink: '#0f172a',         // primary text
  body: '#334155',        // body text
  muted: '#64748b',       // secondary text
  faint: '#94a3b8',       // footer text
  line: '#e2e8f0',        // borders
  panel: '#f8fafc',       // table / panel background
  danger: '#b91c1c',      // warning text
};

const FALLBACK_FROM = 'Mountain Top University <no-reply@mtu.edu.ng>';

// Built-in Ethereal test credentials used ONLY when no SMTP_* env vars are set.
// They let development preview real rendered mail; they do NOT deliver to inboxes.
const ETHEREAL = {
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'lillian.hegmann58@ethereal.email',
    pass: 'VwGstW4j154xN2c9Kq',
  },
};

/**
 * Build a nodemailer transport from env vars, or fall back to Ethereal.
 * Returns { transporter, usingFallback } or null if nothing is usable.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Real SMTP configured.
  if (host && user && pass) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure =
      typeof process.env.SMTP_SECURE === 'string'
        ? process.env.SMTP_SECURE.toLowerCase() === 'true'
        : port === 465;
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      return { transporter, usingFallback: false };
    } catch (err) {
      console.error('[email] Failed to create SMTP transport:', err && err.message);
      return null;
    }
  }

  // No real creds — use Ethereal so dev still renders/previews mail.
  try {
    const transporter = nodemailer.createTransport(ETHEREAL);
    return { transporter, usingFallback: true };
  } catch (err) {
    console.error('[email] Failed to create fallback transport:', err && err.message);
    return null;
  }
}

/**
 * Send an email. Never throws.
 * @returns {Promise<{ sent:boolean, messageId?:string, previewUrl?:string|null, fallback?:boolean, error?:string }>}
 */
export async function sendMail({ to, subject, html }) {
  if (!to) {
    console.warn('[email] sendMail called without a recipient — skipping.');
    return { sent: false, error: 'No recipient' };
  }

  const result = getTransporter();
  if (!result) {
    console.warn('[email] No usable mail transport — skipping send.');
    return { sent: false, error: 'No transport' };
  }

  const { transporter, usingFallback } = result;
  const from = process.env.MAIL_FROM || FALLBACK_FROM;

  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    const previewUrl = usingFallback ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) {
      console.log('[email] Preview URL (Ethereal): %s', previewUrl);
    }
    return {
      sent: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      fallback: usingFallback,
    };
  } catch (err) {
    // Bad creds, network failure, etc. — log and no-op, never throw.
    console.error('[email] Send failed:', err && err.message);
    return { sent: false, error: err && err.message };
  }
}

// Backwards-compatible alias for any existing callers of sendEmail().
export const sendEmail = sendMail;

// ---------------------------------------------------------------------------
// HTML builders
// ---------------------------------------------------------------------------

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function roleLabel(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'lecturer') return 'Lecturer';
  if (r === 'admin') return 'Administrator';
  return 'Student';
}

/** A single label/value row for the details table. */
function detailRow(label, value) {
  return `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid ${BRAND.line};font-weight:600;color:${BRAND.muted};width:140px;font-size:14px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid ${BRAND.line};color:${BRAND.ink};font-size:14px;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;
}

/** CTA button (table-based for email-client compatibility). */
function ctaButton(label, href) {
  const safeHref = escapeHtml(href || '#');
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
      <tr>
        <td style="border-radius:8px;background-color:${BRAND.green};">
          <a href="${safeHref}" target="_blank"
             style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

/**
 * Wrap inner content in the institutional shell (green header + wordmark + footer).
 */
function shell({ heading, inner }) {
  return `
  <div style="background-color:#f1f5f9;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" align="center"
           style="max-width:600px;width:100%;margin:0 auto;background-color:#ffffff;border:1px solid ${BRAND.line};border-radius:12px;overflow:hidden;">
      <!-- Header / wordmark -->
      <tr>
        <td style="background-color:${BRAND.green};padding:24px 32px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;letter-spacing:0.5px;color:#ffffff;">
            Mountain Top University
          </div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:400;color:#d1fae5;margin-top:4px;letter-spacing:1px;text-transform:uppercase;">
            ${escapeHtml(heading)}
          </div>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          ${inner}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:20px 32px;border-top:1px solid ${BRAND.line};background-color:${BRAND.panel};">
          <p style="margin:0;color:${BRAND.faint};font-size:12px;line-height:1.6;text-align:center;">
            Mountain Top University &bull; Prayer City, Ogun State, Nigeria<br/>
            This is an automated message — please do not reply directly to this email.
          </p>
        </td>
      </tr>
    </table>
  </div>`;
}

/**
 * Welcome email shown to a newly-created account holder.
 * @param {{ name?:string, role?:string, loginUrl?:string, when?:string }} opts
 */
export function welcomeEmailHtml({ name, role, loginUrl, when } = {}) {
  const greetName = name ? escapeHtml(name) : 'there';
  const url = loginUrl || '#';
  const inner = `
    <p style="margin:0 0 16px;color:${BRAND.ink};font-size:18px;font-weight:600;">Welcome aboard, ${greetName}.</p>
    <p style="margin:0 0 20px;color:${BRAND.body};font-size:15px;line-height:1.6;">
      Your Mountain Top University portal account has been created successfully. You can now sign in
      to access your courses, materials, assignments and live classes.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 24px;background-color:${BRAND.panel};border:1px solid ${BRAND.line};border-radius:8px;overflow:hidden;">
      ${detailRow('Account type', roleLabel(role))}
      ${detailRow('Registered', when || new Date().toLocaleString())}
    </table>

    ${ctaButton('Login to Portal', url)}

    <p style="margin:20px 0 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">
      For your security, please change your password after your first sign-in.
      If you did not request this account, or you need assistance, please contact the
      system administrator.
    </p>`;

  return shell({ heading: 'Account Created', inner });
}

/**
 * Security alert email shown when a login is detected on an account.
 * @param {{ name?:string, when?:string, location?:string, device?:string, ip?:string, resetUrl?:string }} opts
 */
export function loginAlertEmailHtml({ name, when, location, device, ip, resetUrl } = {}) {
  const greetName = name ? escapeHtml(name) : 'there';
  const url = resetUrl || '#';
  const inner = `
    <p style="margin:0 0 16px;color:${BRAND.ink};font-size:18px;font-weight:600;">Hello ${greetName},</p>
    <p style="margin:0 0 20px;color:${BRAND.body};font-size:15px;line-height:1.6;">
      A login was detected on your account. Here are the details of that session:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 24px;background-color:${BRAND.panel};border:1px solid ${BRAND.line};border-radius:8px;overflow:hidden;">
      ${detailRow('Date & time', when || new Date().toLocaleString())}
      ${detailRow('Location', location || 'Location unavailable')}
      ${detailRow('Device / browser', device || 'Unknown device')}
      ${detailRow('IP address', ip || 'Unknown')}
    </table>

    <p style="margin:0 0 12px;color:${BRAND.body};font-size:15px;line-height:1.6;">
      If this was you, no action is needed.
    </p>
    <p style="margin:0 0 20px;color:${BRAND.danger};font-size:15px;font-weight:600;line-height:1.6;">
      If you do not recognise this activity, secure your account immediately by resetting your password.
    </p>

    ${ctaButton('Secure My Account', url)}

    <p style="margin:20px 0 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">
      If you continue to see suspicious activity, contact the Mountain Top University IT support team.
    </p>`;

  return shell({ heading: 'Security Alert', inner });
}
