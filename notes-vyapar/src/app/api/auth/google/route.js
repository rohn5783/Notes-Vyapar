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
    const { searchParams, origin } = new URL(req.url);
    const forceConsent = searchParams.get("force") === "true";

    // Dynamically derive the redirect URI from the request origin
    // so it works on both localhost and production (Vercel)
    const redirectUri = `${origin}/api/auth/google/callback`;

    const authUrl = generateAuthUrl(forceConsent, redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("[Google OAuth] Failed to generate auth URL:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_config", req.url)
    );
  }
}
