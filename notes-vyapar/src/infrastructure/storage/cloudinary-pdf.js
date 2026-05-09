import cloudinary from "@/infrastructure/storage/cloudinary";
import { getDirectPdfUrl, sanitizePdfFilename } from "@/lib/pdf-url";

export class PdfUploadError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "PdfUploadError";
    this.status = status;
  }
}

export function assertCloudinaryConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new PdfUploadError("File upload service is not configured", 500);
  }
}

export function isPdfFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return false;
  }

  const name = String(file.name || "").toLowerCase();
  return file.type === "application/pdf" || name.endsWith(".pdf");
}

export async function getPdfBuffer(file) {
  if (!file || file.size === 0) {
    throw new PdfUploadError("PDF file is required", 400);
  }

  if (!isPdfFile(file)) {
    throw new PdfUploadError("Only PDF files are allowed", 400);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.length < 5 || buffer.subarray(0, 5).toString("utf8") !== "%PDF-") {
    throw new PdfUploadError("The selected file is not a valid PDF", 400);
  }

  return buffer;
}

function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    }).end(buffer);
  });
}

export async function uploadPdfToCloudinary(file, title) {
  assertCloudinaryConfigured();

  const buffer = await getPdfBuffer(file);
  const pdfFilename = sanitizePdfFilename(file.name || title);
  const publicId = `${pdfFilename.replace(/\.pdf$/i, "")}-${Date.now()}.pdf`;
  const uploadResult = await uploadBufferToCloudinary(buffer, {
    resource_type: "image",
    type: "upload",
    folder: "notes_pdfs",
    public_id: publicId,
    unique_filename: false,
    use_filename: false,
    overwrite: false,
    filename_override: pdfFilename,
    access_mode: "public",
  });

  const fileUrl = uploadResult?.secure_url;

  if (!fileUrl) {
    if (uploadResult?.public_id) {
      await deleteCloudinaryAsset(uploadResult.secure_url, "raw");
    }

    throw new PdfUploadError("Cloudinary returned an invalid PDF URL", 502);
  }

  return {
    ...uploadResult,
    fileUrl,
  };
}

export async function uploadImageToCloudinary(file) {
  assertCloudinaryConfigured();

  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type?.startsWith("image/")) {
    throw new PdfUploadError("Thumbnail must be an image", 400);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return uploadBufferToCloudinary(buffer, {
    folder: "notes_thumbnails",
    access_mode: "public",
  });
}

export function extractCloudinaryPublicId(url, resourceType) {
  try {
    const parsedUrl = new URL(url);
    const marker = `/${resourceType}/upload/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const afterUpload = parsedUrl.pathname.slice(markerIndex + marker.length);
    const withoutTransformations = afterUpload.replace(/^(?:fl_[^/]+\/)+/, "");
    const withoutVersion = withoutTransformations.replace(/^v\d+\//, "");
    return decodeURIComponent(withoutVersion);
  } catch {
    return null;
  }
}

export async function deleteCloudinaryAsset(url, resourceType) {
  const publicId = extractCloudinaryPublicId(url, resourceType);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.warn("Cloudinary cleanup failed:", error?.message || error);
  }
}
