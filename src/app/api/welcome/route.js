import { sendMail, welcomeEmailHtml } from '@/lib/email';

/**
 * POST /api/welcome
 * Body: { email, name, role }
 *
 * Sends a welcome / account-created email with a "Login to Portal" CTA.
 * A mail failure is caught and logged — it NEVER 500s the caller, because
 * sign-up should succeed regardless of whether the email went out.
 */
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const { email, name, role } = body || {};

  if (!email) {
    return Response.json({ success: false, error: 'No recipient email.' }, { status: 400 });
  }

  // Build an absolute login URL from the incoming request origin.
  const origin = getOrigin(req);
  const loginUrl = `${origin}/login`;

  const when = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  try {
    const html = welcomeEmailHtml({ name, role, loginUrl, when });
    const result = await sendMail({
      to: email,
      subject: 'Welcome to the Mountain Top University Portal',
      html,
    });

    // result.sent === false means creds were missing/invalid; we still return
    // a non-error response so the sign-up flow is not blocked.
    return Response.json(
      { success: true, sent: result.sent, previewUrl: result.previewUrl || null },
      { status: 200 },
    );
  } catch (error) {
    // Defensive: should not happen (sendMail swallows its own errors).
    console.error('[api/welcome] Unexpected error:', error && error.message);
    return Response.json({ success: true, sent: false, error: 'Email skipped.' }, { status: 200 });
  }
}

/** Resolve the request origin (protocol + host) for absolute links. */
function getOrigin(req) {
  try {
    const h = req.headers;
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'http';
    if (host) return `${proto}://${host}`;
    return new URL(req.url).origin;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
}
