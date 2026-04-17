import { registerUser } from "@/application/services/auth.service";
import connectDB from "@/infrastructure/database/mongodb";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { user, emailVerificationSent } = await registerUser(body);

    return Response.json({
      success: true,
      message: emailVerificationSent
        ? "User registered successfully. Verification email sent."
        : "Verification email could not be sent. Please try again.",
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
