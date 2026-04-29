import { NextResponse } from "next/server";
import connectDB from "@/infrastructure/database/mongodb";
import Note from "@/domain/entities/Note";
import { sanitizePdfFilename } from "@/lib/pdf-url";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentDisposition = (mode, filename) => {
  const safeFilename = filename.replace(/"/g, "");
  return `${mode}; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
};

export async function GET(req, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "PDF file unavailable" }, { status: 404 });
  }

  await connectDB();

  const note = await Note.findById(id).select("title fileUrl").lean();

  if (!note?.fileUrl) {
    return NextResponse.json({ error: "PDF file unavailable" }, { status: 404 });
  }

  try {
    const sourceResponse = await fetch(note.fileUrl, {
      cache: "no-store",
    });

    if (!sourceResponse.ok || !sourceResponse.body) {
      return NextResponse.json({ error: "PDF file unavailable" }, { status: 502 });
    }

    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "1";
    const filename = sanitizePdfFilename(note.title);

    return new Response(sourceResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition(isDownload ? "attachment" : "inline", filename),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("PDF proxy error:", error);
    return NextResponse.json({ error: "PDF file unavailable" }, { status: 500 });
  }
}
