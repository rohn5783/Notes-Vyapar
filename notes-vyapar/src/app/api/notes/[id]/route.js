import { NextResponse } from "next/server";
import connectDB from "@/infrastructure/database/mongodb";
import Note from "@/domain/entities/Note";
import { authMiddleware } from "@/middleware/auth.middleware";
import {
  deleteCloudinaryAsset,
  PdfUploadError,
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
} from "@/infrastructure/storage/cloudinary-pdf";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const maxDuration = 60;

const parseTags = (value) =>
  String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export async function GET(req, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await connectDB();

  try {
    const note = await Note.findById(id).populate("seller", "name").lean();

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Note fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const authResult = authMiddleware(req);
  if (!authResult.success) return authResult.response;

  await connectDB();

  let uploadedReplacementFileUrl = null;
  let uploadedReplacementThumbnailUrl = null;
  let previousFileUrl = null;
  let previousThumbnailUrl = null;

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.seller.toString() !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const title = String(formData.get("title") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const rawPrice = formData.get("price");
      const price = rawPrice === null || rawPrice === "" ? 0 : Number(rawPrice);
      const category = String(formData.get("category") || "General").trim() || "General";
      const language = String(formData.get("language") || "English").trim() || "English";
      const university = String(formData.get("university") || "").trim();
      const tags = parseTags(formData.get("tags"));
      const isPremium = formData.get("isPremium") === "true";

      if (!title || !subject || !description || Number.isNaN(price) || price < 0) {
        return NextResponse.json({ error: "Missing required fields or invalid price" }, { status: 400 });
      }

      note.title = title;
      note.subject = subject;
      note.description = description;
      note.price = price;
      note.category = category;
      note.tags = tags;
      note.language = language;
      note.university = university;
      note.isPremium = isPremium;
      previousFileUrl = note.fileUrl;
      previousThumbnailUrl = note.thumbnailUrl;

      const file = formData.get("file");
      if (file && file.size > 0) {
        const uploadRes = await uploadPdfToCloudinary(file, title);
        uploadedReplacementFileUrl = uploadRes.fileUrl;
        note.fileUrl = uploadRes.fileUrl;
      }

      const thumbnail = formData.get("thumbnail");
      if (thumbnail && thumbnail.size > 0) {
        const thumbRes = await uploadImageToCloudinary(thumbnail);
        uploadedReplacementThumbnailUrl = thumbRes?.secure_url || null;
        note.thumbnailUrl = uploadedReplacementThumbnailUrl;
      }
    } else {
      const body = await req.json();
      const allowedUpdates = ["title", "subject", "description", "price", "category", "tags", "isPremium", "language", "university"];

      allowedUpdates.forEach((field) => {
        if (body[field] !== undefined) {
          note[field] = body[field];
        }
      });
    }

    await note.save();

    if (uploadedReplacementFileUrl && previousFileUrl) {
      await deleteCloudinaryAsset(previousFileUrl, "raw");
    }

    if (uploadedReplacementThumbnailUrl && previousThumbnailUrl) {
      await deleteCloudinaryAsset(previousThumbnailUrl, "image");
    }

    return NextResponse.json({ success: true, note });
  } catch (error) {
    if (uploadedReplacementFileUrl) {
      await deleteCloudinaryAsset(uploadedReplacementFileUrl, "raw");
    }

    if (uploadedReplacementThumbnailUrl) {
      await deleteCloudinaryAsset(uploadedReplacementThumbnailUrl, "image");
    }

    if (error instanceof PdfUploadError) {
      console.error("Note update validation error:", error.message);
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Note update error:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const authResult = authMiddleware(req);
  if (!authResult.success) return authResult.response;

  await connectDB();

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.seller.toString() !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await deleteCloudinaryAsset(note.fileUrl, "raw");
    await deleteCloudinaryAsset(note.thumbnailUrl, "image");
    await note.deleteOne();

    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Note delete error:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
