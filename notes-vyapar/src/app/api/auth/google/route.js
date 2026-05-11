import { NextResponse } from "next/server";
import { generateAuthUrl } from "@/infrastructure/services/googleTokenService";

/**
 * GET /api/auth/google
 *
 * Redirects the user to Google's OAuth consent screen.
 * `forceConsent` query param can be passed to force the consent screen
 * (useful when the refresh token has been revoked).
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const forceConsent = searchParams.get("force") === "true";

    // Build a stable redirect URI that doesn't change per Vercel preview deploy.
    // Priority: APP_URL (manual) > VERCEL_PROJECT_PRODUCTION_URL (auto) > request origin (local)
    const baseUrl =
      process.env.APP_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : new URL(req.url).origin);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const authUrl = generateAuthUrl(forceConsent, redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("[Google OAuth] Failed to generate auth URL:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_config", req.url)
    );
  }
}
