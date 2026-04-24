import { requestPasswordReset } from "@/application/services/auth.service";
import connectDB from "@/infrastructure/database/mongodb";
import { resolveRequestBaseUrl } from "@/lib/request-url";

const getStatusCode = (message) => {
  switch (message) {
    case "Email is required":
      return 400;
    case "Email service is not configured":
      return 500;
    default:
      return 500;
  }
};

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const appUrl = resolveRequestBaseUrl(req);
    const result = await requestPasswordReset(body, { appUrl });

    return Response.json({
      success: result.success !== false,
      requiresVerification: Boolean(result.requiresVerification),
      message:
        result.message ||
        "If an account exists for this email, password reset instructions have been sent."
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message || "Something went wrong"
      },
      { status: getStatusCode(error.message) }
    );
  }
}

