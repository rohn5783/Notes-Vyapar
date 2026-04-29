import { NextResponse } from "next/server";
import connectDB from "@/infrastructure/database/mongodb";
import Note from "@/domain/entities/Note";
import { authMiddleware } from "@/middleware/auth.middleware";
import cloudinary from "@/infrastructure/storage/cloudinary";
import { sanitizePdfFilename } from "@/lib/pdf-url";
import mongoose from "mongoose";

const parseTags = (value) =>
  String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    }).end(buffer);
  });

const uploadFile = async (file, options) => {
  const bytes = await file.arrayBuffer();
  return uploadBufferToCloudinary(Buffer.from(bytes), options);
};

const extractCloudinaryPublicId = (url, resourceFolder) => {
  try {
    const parsedUrl = new URL(url);
    const marker = `/${resourceFolder}/upload/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const afterUpload = parsedUrl.pathname.slice(markerIndex + marker.length);
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    return decodeURIComponent(withoutVersion);
  } catch {
    return null;
  }
};

const deleteCloudinaryAsset = async (url, resourceType) => {
  const publicId = extractCloudinaryPublicId(url, resourceType);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.warn("Cloudinary cleanup failed:", error?.message || error);
  }
};

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

  try {
    const { id } = await params;

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

      const file = formData.get("file");
      if (file && file.size > 0) {
        if (file.type !== "application/pdf") {
          return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
        }

        const pdfFilename = sanitizePdfFilename(file.name || title);
        const pdfPublicId = `${pdfFilename.replace(/\.pdf$/i, "")}-${Date.now()}.pdf`;
        const uploadRes = await uploadFile(file, {
          resource_type: "raw",
          folder: "notes_pdfs",
          public_id: pdfPublicId,
          unique_filename: false,
          use_filename: false,
          filename_override: pdfFilename,
        });

        await deleteCloudinaryAsset(note.fileUrl, "raw");
        note.fileUrl = uploadRes.secure_url;
      }

      const thumbnail = formData.get("thumbnail");
      if (thumbnail && thumbnail.size > 0) {
        if (!thumbnail.type.startsWith("image/")) {
          return NextResponse.json({ error: "Thumbnail must be an image" }, { status: 400 });
        }

        const thumbRes = await uploadFile(thumbnail, { folder: "notes_thumbnails" });
        await deleteCloudinaryAsset(note.thumbnailUrl, "image");
        note.thumbnailUrl = thumbRes.secure_url;
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

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Note update error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const authResult = authMiddleware(req);
  if (!authResult.success) return authResult.response;

  await connectDB();

  try {
    const { id } = await params;
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
    console.error("Note delete error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
