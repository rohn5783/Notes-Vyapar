import { NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/auth.middleware";
import connectDB from "@/infrastructure/database/mongodb";
import Payment from "@/domain/entities/Payment";

export async function GET(req) {
  const authResult = authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  await connectDB();

  const payments = await Payment.find({
    userId: authResult.userId,
    status: "paid",
  })
    .populate({ path: "noteId", populate: { path: "seller", select: "name" } })
    .sort({ createdAt: -1 })
    .lean();

  const notes = payments
    .filter((payment) => payment.noteId)
    .map((payment) => {
      const note = payment.noteId;
      return {
        ...note,
        hasPurchased: true,
        isOwner: note.seller?._id?.toString() === authResult.userId,
        sellerId: note.seller?._id?.toString() || note.seller?.toString(),
      };
    });

  return NextResponse.json({ success: true, notes });
}
