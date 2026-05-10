import { google } from "googleapis";

/**
 * Creates a configured Google OAuth2 client using env variables.
 */
export function createOAuthClient(redirectUriOverride) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = redirectUriOverride || process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing Google OAuth credentials: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI must all be set."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generates the Google consent page URL the user will be redirected to.
 * Uses access_type: "offline" to get a refresh token on first login.
 * prompt: "consent" is ONLY sent if we don't have a refresh token yet for this user,
 * passed in via the `forceConsent` flag.
 */
export function generateAuthUrl(forceConsent = false, redirectUri) {
  const client = createOAuthClient(redirectUri);

  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    // Only force consent screen when we truly need a new refresh token
    ...(forceConsent ? { prompt: "consent" } : {}),
  });
}

/**
 * Exchanges an authorization code for access + refresh tokens.
 */
export async function exchangeCodeForTokens(code, redirectUri) {
  const client = createOAuthClient(redirectUri);
  const { tokens } = await client.getToken(code);
  return tokens;
}

/**
 * Fetches the Google user's profile info using their access token.
 */
export async function fetchGoogleProfile(accessToken) {
  const client = createOAuthClient();
  client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const { data } = await oauth2.userinfo.get();

  return data; // { id, email, name, picture, ... }
}

/**
 * Silently refreshes an expired access token using the stored refresh token.
 * Returns the updated credentials object (which may include a new refresh_token
 * if Google has rotated it).
 *
 * If the refresh token is invalid/revoked, throws an error so the caller can
 * force the user to re-authenticate.
 */
export async function refreshAccessToken(storedRefreshToken) {
  if (!storedRefreshToken) {
    throw new Error("No refresh token available — user must re-authenticate.");
  }

  const client = createOAuthClient();
  client.setCredentials({ refresh_token: storedRefreshToken });

  try {
    const { credentials } = await client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error("[GoogleTokenService] Token refresh failed:", error?.message);
    throw new Error("Google session expired. Please sign in again.");
  }
}
