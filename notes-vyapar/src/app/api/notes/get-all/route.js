import { getNotes } from "@/lib/getNotes";
import { authMiddleware } from "@/middleware/auth.middleware";
import Payment from "@/domain/entities/Payment";

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const authResult = authMiddleware(req);
  const isAuthenticated = authResult.success;
  const userId = authResult.userId;

  const result = await getNotes({
    search: searchParams.get("search") || undefined,
    type: searchParams.get("type") || undefined,
    sort: searchParams.get("sort") || undefined,
    category: searchParams.get("category") || undefined,
    page: searchParams.get("page") || undefined,
    limit: searchParams.get("limit") || undefined,
  });

  if (isAuthenticated && result.notes.length > 0) {
    // Get payment statuses for all notes
    const noteIds = result.notes.map(note => note._id);
    const payments = await Payment.find({
      userId,
      noteId: { $in: noteIds },
      status: "paid",
    }).select("noteId");

    const purchasedNoteIds = new Set(payments.map(p => p.noteId.toString()));

    // Add isOwner and hasPurchased to each note
    result.notes = result.notes.map(note => ({
      ...note,
      isOwner: note.sellerId === userId,
      hasPurchased: purchasedNoteIds.has(note._id.toString()) || note.price === 0,
    }));
  } else {
    // For unauthenticated users, no ownership or purchases
    result.notes = result.notes.map(note => ({
      ...note,
      isOwner: false,
      hasPurchased: note.price === 0,
    }));
  }

  return Response.json({
    success: true,
    ...result,
  });
}

