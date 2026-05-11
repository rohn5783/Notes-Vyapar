/**
 * Returns the stable base URL for the application.
 *
 * On Vercel, preview deployments generate a unique URL per deploy
 * (e.g. myapp-abc123-user.vercel.app), which breaks OAuth redirect URIs
 * that must be pre-registered in Google Cloud Console.
 *
 * Resolution order:
 *   1. APP_URL env variable (explicit override)
 *   2. VERCEL_PROJECT_PRODUCTION_URL (auto-provided by Vercel on some plans)
 *   3. Hardcoded production domain (guaranteed fallback for Vercel)
 *   4. Request origin (local development)
 */
export function getBaseUrl(req) {
  // 1. Explicit override — works everywhere
  if (process.env.APP_URL && process.env.APP_URL !== "http://localhost:3000") {
    return process.env.APP_URL;
  }

  // 2. Vercel's auto-provided production URL (no protocol)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 3. We're on Vercel but don't have the production URL variable —
  //    use the hardcoded production domain
  if (process.env.VERCEL) {
    return "https://notes-vyapar.vercel.app";
  }

  // 4. Local development — use request origin
  if (req) {
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    return `${protocol}://${host}`;
  }

  // Fallback for environments without request object
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Returns the OAuth redirect URI for Google OAuth.
 * This should always be a stable, pre-registered URI in Google Cloud Console.
 * For production deployments, use the production domain.
 * For local development, use localhost.
 */
export function getOAuthRedirectUri(req) {
  // Use explicit Google OAuth callback URI if configured
  const configuredRedirectUri = process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (configuredRedirectUri) {
    return configuredRedirectUri.replace(/\/+$/, "");
  }

  // If APP_URL is explicitly configured in Vercel, build the callback from that
  if (process.env.APP_URL && process.env.APP_URL !== "http://localhost:3000") {
    const base = process.env.APP_URL.replace(/\/+$/, "");
    return `${base}/api/auth/google/callback`;
  }

  // If running in a Vercel preview deployment, derive the callback from the current request host
  if (req && process.env.VERCEL && process.env.VERCEL_ENV !== "production") {
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (host) {
      return `${protocol}://${host}/api/auth/google/callback`;
    }
  }

  // In any Vercel production deployment or fallback, use the production callback
  if (process.env.VERCEL || process.env.VERCEL_ENV === "production") {
    return "https://notes-vyapar.vercel.app/api/auth/google/callback";
  }

  // Local development fallback
  return "http://localhost:3000/api/auth/google/callback";
}
