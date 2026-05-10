import { NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/auth.middleware";
import connectDB from "@/infrastructure/database/mongodb";
import { getNotes } from "@/lib/getNotes";

export async function GET(req) {
  const authResult = authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  await connectDB();

  const result = await getNotes({
    sellerId: authResult.userId,
    page: 1,
    limit: 50,
  });

  return NextResponse.json({
    success: true,
    notes: result.notes,
  });
}
