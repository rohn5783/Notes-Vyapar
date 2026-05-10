import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/infrastructure/database/mongodb";
import Note from "@/domain/entities/Note";
import Payment from "@/domain/entities/Payment";
import { getPdfDownloadUrl } from "@/lib/pdf-url";

function getTokenFromRequest(req) {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies?.get?.("notes-vyapar-token")?.value;

  if (authHeader) {
    return authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();
  }

  return cookieToken || null;
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.verify(token, secret);
}

export async function GET(req, { params }) {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "Note not found." }, { status: 404 });
  }

  await connectDB();

  const note = await Note.findById(id).lean();
  if (!note) {
    return NextResponse.json({ success: false, message: "Note not found." }, { status: 404 });
  }

  const token = getTokenFromRequest(req);
  let userId = null;

  if (token) {
    try {
      const decoded = verifyToken(token);
      userId = decoded.userId;
    } catch (error) {
      if (note.price > 0) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired authentication token." },
          { status: 401 }
        );
      }
    }
  }

  const isFree = Number(note.price) === 0;
  const isOwner = userId && note.seller?.toString() === userId;
  let hasPurchased = isFree || isOwner;

  if (!hasPurchased && userId) {
    hasPurchased = Boolean(
      await Payment.exists({
        userId,
        noteId: id,
        status: "paid",
      })
    );
  }

  if (!hasPurchased) {
    return NextResponse.json(
      { success: false, message: "Purchase required to download this note." },
      { status: 403 }
    );
  }

  const downloadUrl = getPdfDownloadUrl(note.fileUrl);

  if (!downloadUrl) {
    return NextResponse.json(
      { success: false, message: "Download URL is unavailable." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(downloadUrl);
}
