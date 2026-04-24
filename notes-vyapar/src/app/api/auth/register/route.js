import { registerUser } from "@/application/services/auth.service";
import connectDB from "@/infrastructure/database/mongodb";
import { resolveRequestBaseUrl } from "@/lib/request-url";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const appUrl = resolveRequestBaseUrl(req);
    const { user, emailVerificationSent } = await registerUser(body, { appUrl });

    return Response.json({
      success: true,
      emailVerificationSent,
      message: emailVerificationSent
        ? "User registered successfully. Verification email sent."
        : "Account created, but verification email could not be sent right now.",
      user
    });
  } catch (error) {
    const status = error.message === "User already exists" ? 409 : 400;

    return Response.json(
      {
        success: false,
        message: error.message || "Something went wrong"
      },
      { status }
    );
  }
}
