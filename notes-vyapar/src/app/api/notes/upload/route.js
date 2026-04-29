
import { NextResponse } from "next/server";
import cloudinary from "@/infrastructure/storage/cloudinary";
import Note from "@/domain/entities/Note";
import connectDB from "@/infrastructure/database/mongodb";

export async function POST(req) {
  await connectDB();

  const formData = await req.formData();

  const file = formData.get("file") ;
  const title = formData.get("title") ;
  const subject = formData.get("subject");
  const price = Number(formData.get("price"));

  // ✅ YAHI LIKHNA HAI
  if (!file || file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF allowed" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // upload to cloudinary
  const uploadRes = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: "raw" }, // PDF ke liye
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

  // save in DB
  const note = await Note.create({
    title,
    subject,
    price,
    fileUrl: uploadRes.secure_url,
  });

  return NextResponse.json({ note, message: "Uploaded successfully" });
}