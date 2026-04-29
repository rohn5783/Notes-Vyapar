import { NextResponse } from "next/server";
import connectDB from "@/infrastructure/database/mongodb";
import Note from "@/domain/entities/Note";
import { authMiddleware } from "@/middleware/auth.middleware";
import cloudinary from "@/infrastructure/storage/cloudinary";
import { sanitizePdfFilename } from "@/lib/pdf-url";

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

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    // Upload PDF to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfFilename = sanitizePdfFilename(file.name || title);
    const pdfPublicId = `${pdfFilename.replace(/\.pdf$/i, "")}-${Date.now()}.pdf`;
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "notes_pdfs",
          public_id: pdfPublicId,
          unique_filename: false,
          use_filename: false,
          filename_override: pdfFilename,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    let thumbnailUrl = null;
    const thumbnail = formData.get("thumbnail");
    if (thumbnail && thumbnail.type.startsWith("image/")) {
      const thumbBytes = await thumbnail.arrayBuffer();
      const thumbBuffer = Buffer.from(thumbBytes);
      const thumbRes = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "notes_thumbnails" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(thumbBuffer);
      });
      thumbnailUrl = thumbRes.secure_url;
    }

    const note = await Note.create({
      title,
      subject,
      description,
      price,
      category,
      tags,
      fileUrl: uploadRes.secure_url,
      thumbnailUrl,
      isPremium,
      language,
      university,
      seller: authResult.userId,
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.error("Note upload error:", error);
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
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}
