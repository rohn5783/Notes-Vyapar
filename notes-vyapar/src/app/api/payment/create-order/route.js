import { authMiddleware } from "@/middleware/auth.middleware";
import { createOrder } from "@/application/services/payment.service";

export async function POST(req) {
  const authResult = authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const noteId = String(body?.noteId || "").trim();

    if (!noteId) {
      return Response.json(
        {
          success: false,
          message: "Note ID is required to create a payment order",
        },
        { status: 400 }
      );
    }

    const result = await createOrder(authResult.userId, noteId);

    if (result.alreadyPurchased) {
      return Response.json({
        success: true,
        alreadyPurchased: true,
        message: "You have already purchased this note.",
      });
    }

    return Response.json({
      success: true,
      message: "Order created successfully",
      order: {
        id: result.order.id,
        amount: result.order.amount,
        currency: result.order.currency,
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message || "Unable to create payment order",
      },
      { status: 500 }
    );
  }
}
