import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/infrastructure/database/mongodb";
import User from "@/domain/entities/User";
import {
  exchangeCodeForTokens,
  fetchGoogleProfile,
} from "@/infrastructure/services/googleTokenService";
import { AUTH_COOKIE_NAME } from "@/middleware/auth.middleware";
import { getBaseUrl, getOAuthRedirectUri } from "@/lib/get-base-url";

/**
 * GET /api/auth/google/callback
 *
 * Google redirects here after the user authorizes the app.
 * Steps:
 *   1. Exchange code for tokens
 *   2. Fetch user profile from Google
 *   3. Upsert user in MongoDB (create or update)
 *   4. Store/update refresh & access tokens silently
 *   5. Issue our own JWT and set HttpOnly cookie
 *   6. Redirect to the dashboard
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  // User denied access on Google's consent screen
  if (errorParam) {
    console.warn("[Google Callback] User denied access:", errorParam);
    return NextResponse.redirect(new URL("/login?error=access_denied", req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
  }

  try {
    await connectDB();

    // Use the same stable redirect URI as the initial auth request
    const redirectUri = getOAuthRedirectUri();

    // Step 1: Exchange auth code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate,
    } = tokens;

    if (!accessToken) {
      throw new Error("No access token returned from Google");
    }

    // Step 2: Fetch the user's Google profile
    const profile = await fetchGoogleProfile(accessToken);
    const { id: googleId, email, name, picture } = profile;

    if (!googleId || !email) {
      throw new Error("Incomplete Google profile — missing id or email");
    }

    // Step 3: Upsert the user in MongoDB
    // Try to find by googleId first, then fall back to email
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user already registered with the same email (email/password account)
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (user) {
      // Update existing user's Google tokens
      user.googleId = googleId;
      user.accessToken = accessToken;
      // Only overwrite the refresh token if Google provides a new one
      if (refreshToken) {
        user.refreshToken = refreshToken;
      }
      user.tokenExpiry = expiryDate ? new Date(expiryDate) : null;
      user.isVerified = true; // Google-authenticated emails are considered verified
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
    } else {
      // Create a brand-new user from Google profile
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar: picture || undefined,
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiry: expiryDate ? new Date(expiryDate) : null,
        isVerified: true,
        role: "user",
      });
    }

    await user.save();

    // Step 4: Issue our own JWT (7-day session)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not configured");

    const jwtToken = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Step 5: Redirect to dashboard with HttpOnly auth cookie
    const redirectUrl = new URL("/dashboard", req.url);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set(AUTH_COOKIE_NAME, jwtToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Also return the token in a short-lived readable cookie so the
    // client-side AuthContext can pick it up on first load
    response.cookies.set("notes-vyapar-auth-init", jwtToken, {
      httpOnly: false, // readable by JS
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60, // expires in 60 seconds — only needed for initial hydration
    });

    return response;
  } catch (error) {
    console.error("[Google Callback] OAuth error:", error?.message);
    return NextResponse.redirect(
      new URL(`/login?error=oauth_failed`, req.url)
    );
  }
}
