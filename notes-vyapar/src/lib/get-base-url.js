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

  // 4. Local development — derive from request
  return new URL(req.url).origin;
}
