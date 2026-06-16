import { sendMail, loginAlertEmailHtml } from '@/lib/email';

/**
 * POST /api/login-alert
 * Body: { email, name, role }
 *
 * Captures the client IP from request headers, geolocates it via ip-api.com,
 * parses device/browser from the user-agent, then emails a security alert.
 * Every step is guarded — the route never throws and never blocks login.
 */
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const { email, name } = body || {};

  if (!email) {
    return Response.json({ success: false, error: 'No recipient email.' }, { status: 400 });
  }

  try {
    const headers = req.headers;

    // ----- 1. Client IP --------------------------------------------------
    const ip = getClientIp(headers);

    // ----- 2. Geolocation (best-effort) ----------------------------------
    const location = await lookupLocation(ip);

    // ----- 3. Device / browser from User-Agent ---------------------------
    const userAgent = headers.get('user-agent') || '';
    const device = parseUserAgent(userAgent);

    // ----- 4. Timestamp + absolute reset URL -----------------------------
    const when = new Date().toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
    const resetUrl = `${getOrigin(req)}/login`;

    // ----- 5. Send (no-ops gracefully if creds missing) ------------------
    const html = loginAlertEmailHtml({
      name,
      when,
      location,
      device,
      ip: isLoopback(ip) ? `${ip} (local)` : ip,
      resetUrl,
    });

    const result = await sendMail({
      to: email,
      subject: 'Security Alert: New Login to Your MTU Account',
      html,
    });

    return Response.json(
      { success: true, sent: result.sent, previewUrl: result.previewUrl || null, location, device },
      { status: 200 },
    );
  } catch (error) {
    // Never block login on an alerting failure.
    console.error('[api/login-alert] Unexpected error:', error && error.message);
    return Response.json({ success: true, sent: false, error: 'Alert skipped.' }, { status: 200 });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the originating client IP from proxy headers. */
function getClientIp(headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // May be a comma-separated chain; the first entry is the client.
    const first = forwarded.split(',')[0].trim();
    if (first) return normalizeIp(first);
  }
  const real = headers.get('x-real-ip');
  if (real) return normalizeIp(real.trim());

  return '127.0.0.1';
}

/** Strip an IPv6-mapped IPv4 prefix (::ffff:1.2.3.4 -> 1.2.3.4). */
function normalizeIp(ip) {
  if (!ip) return ip;
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  return ip;
}

/** True for localhost / private-range addresses that can't be geolocated. */
function isLoopback(ip) {
  if (!ip) return true;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

/** Geolocate an IP via ip-api.com; returns a human string or 'Location unavailable'. */
async function lookupLocation(ip) {
  if (isLoopback(ip)) return 'Location unavailable';

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`,
      { signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined },
    );
    if (!res.ok) return 'Location unavailable';

    const data = await res.json();
    if (!data || data.status !== 'success') return 'Location unavailable';

    const parts = [data.city, data.regionName, data.country].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Location unavailable';
  } catch (err) {
    console.error('[api/login-alert] Geolocation lookup failed:', err && err.message);
    return 'Location unavailable';
  }
}

/** Parse browser + OS from a User-Agent string into "Browser on OS". */
function parseUserAgent(ua) {
  if (!ua) return 'Unknown device';

  // Browser (order matters: Edge before Chrome, Chrome before Safari).
  let browser = 'Unknown browser';
  if (/\bEdg\/|\bEdge\//i.test(ua)) browser = 'Edge';
  else if (/\bOPR\/|\bOpera\b/i.test(ua)) browser = 'Opera';
  else if (/\bFirefox\//i.test(ua)) browser = 'Firefox';
  else if (/\bChrome\//i.test(ua) && !/\bChromium\//i.test(ua)) browser = 'Chrome';
  else if (/\bChromium\//i.test(ua)) browser = 'Chromium';
  else if (/\bSafari\//i.test(ua) && !/\bChrome\//i.test(ua)) browser = 'Safari';

  // Operating system.
  let os = 'Unknown OS';
  if (/\bWindows\b/i.test(ua)) os = 'Windows';
  else if (/\bAndroid\b/i.test(ua)) os = 'Android'; // before Linux (Android UAs include Linux)
  else if (/\b(iPhone|iPad|iPod)\b/i.test(ua) || /\biOS\b/i.test(ua)) os = 'iOS';
  else if (/\bMac OS X\b|\bMacintosh\b/i.test(ua)) os = 'macOS';
  else if (/\bLinux\b/i.test(ua)) os = 'Linux';

  if (browser === 'Unknown browser' && os === 'Unknown OS') return 'Unknown device';
  return `${browser} on ${os}`;
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
