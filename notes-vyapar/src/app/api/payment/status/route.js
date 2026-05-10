import { authMiddleware } from "@/middleware/auth.middleware";
import { getPaymentStatus } from "@/application/services/payment.service";

export async function GET(req) {
  const authResult = authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const searchParams = new URL(req.url).searchParams;
    const noteId = String(searchParams.get("noteId") || "").trim();

    if (!noteId) {
      return Response.json(
        {
          success: false,
          message: "Note ID is required to check payment status",
        },
        { status: 400 }
      );
    }

    const result = await getPaymentStatus(authResult.userId, noteId);

    return Response.json({
      success: true,
      notePrice: result.notePrice,
      hasPurchased: result.hasPurchased,
      isFree: result.isFree,
      isOwner: result.isOwner,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message || "Unable to read payment status",
      },
      { status: 500 }
    );
  }
}
