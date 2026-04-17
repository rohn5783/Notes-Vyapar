import { authMiddleware } from "@/middleware/auth.middleware";

export async function GET(req) {
  const authResult = authMiddleware(req);

  if (!authResult.success) {
    return authResult.response;
  }

  return Response.json({
    success: true,
    message: "Protected route accessed successfully",
    userId: authResult.userId
  });
}
