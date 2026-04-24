import { resetPassword } from "@/application/services/auth.service";
import connectDB from "@/infrastructure/database/mongodb";

const getStatusCode = (message) => {
  switch (message) {
    case "Reset token and password are required":
      return 400;
    case "Password must be at least 8 characters long and include one symbol.":
      return 400;
    case "Invalid reset token. Please request a new password reset link.":
      return 401;
    case "Reset token has expired. Please request a new password reset link.":
      return 401;
    default:
      return 500;
  }
};

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const result = await resetPassword(body);

    return Response.json({
      success: true,
      message: result.message || "Password has been reset successfully."
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
