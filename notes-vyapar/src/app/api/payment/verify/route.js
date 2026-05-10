import { authMiddleware } from "@/middleware/auth.middleware";
import { verifyPayment } from "@/application/services/payment.service";

export async function POST(req) {
  const authResult = authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const razorpay_order_id = String(body?.razorpay_order_id || "").trim();
    const razorpay_payment_id = String(body?.razorpay_payment_id || "").trim();
    const razorpay_signature = String(body?.razorpay_signature || "").trim();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        {
          success: false,
          message: "Missing payment verification data",
        },
        { status: 400 }
      );
    }

    await verifyPayment(authResult.userId, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return Response.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message || "Unable to verify payment",
      },
      { status: 500 }
    );
  }
}
