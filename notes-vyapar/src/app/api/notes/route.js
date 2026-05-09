import { NextResponse } from "next/server";
import connectDB from "@/infrastructure/database/mongodb";
import Note from "@/domain/entities/Note";
import { authMiddleware } from "@/middleware/auth.middleware";
import {
  PdfUploadError,
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
} from "@/infrastructure/storage/cloudinary-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  const authResult = authMiddleware(req);
  if (!authResult.success) {
    return authResult.response;
  }

  await connectDB();

  try {
    const formData = await req.formData();
    
    const file = formData.get("file");
    const title = String(formData.get("title") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const rawPrice = formData.get("price");
    const price = rawPrice === null || rawPrice === "" ? 0 : Number(rawPrice);
    const category = String(formData.get("category") || "General").trim() || "General";
    const tagsValue = String(formData.get("tags") || "");
    const tags = tagsValue.split(",").map((tag) => tag.trim()).filter(Boolean);
    const isPremium = formData.get("isPremium") === "true";
    const language = formData.get("language") || "English";
    const university = formData.get("university") || "";

    if (!title || !subject || !description || Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Missing required fields or invalid price" }, { status: 400 });
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    const thumbnail = formData.get("thumbnail");
    if (thumbnail && thumbnail.size > 0 && !thumbnail.type.startsWith("image/")) {
      return NextResponse.json({ error: "Thumbnail must be an image" }, { status: 400 });
    }

    const uploadRes = await uploadPdfToCloudinary(file, title);

    let thumbnailUrl = null;
    if (thumbnail && thumbnail.size > 0) {
      const thumbRes = await uploadImageToCloudinary(thumbnail);
      thumbnailUrl = thumbRes?.secure_url || null;
    }

    const note = await Note.create({
      title,
      subject,
      description,
      price,
      category,
      tags,
      fileUrl: uploadRes.fileUrl,
      thumbnailUrl,
      isPremium,
      language,
      university,
      seller: authResult.userId,
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    if (error instanceof PdfUploadError) {
      console.error("Note upload validation error:", error.message);
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Note upload error:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function GET(req) {
  await connectDB();
  
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");
  const search = searchParams.get("search");
  
  if (mine === "true") {
    const authResult = authMiddleware(req);
    if (!authResult.success) return authResult.response;
    
    try {
      const notes = await Note.find({ seller: authResult.userId }).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, notes });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
  }

  try {
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const notes = await Note.find(query)
      .populate("seller", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error("Public notes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}
