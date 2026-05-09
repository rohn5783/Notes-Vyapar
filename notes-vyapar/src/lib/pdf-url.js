export function sanitizePdfFilename(value) {
  const fallback = "notes-vyapar-note";

  const cleaned = String(value || fallback)
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${cleaned || fallback}.pdf`;
}

const CLOUDINARY_HOST_SUFFIX = ".cloudinary.com";

function isCloudinaryHost(hostname) {
  return (
    hostname === "res.cloudinary.com" ||
    hostname.endsWith(CLOUDINARY_HOST_SUFFIX)
  );
}

/**
 * Returns a safe direct PDF URL
 * Works for Cloudinary transformed URLs too
 */
export function getDirectPdfUrl(fileUrl) {
  if (!fileUrl) {
    return null;
  }

  try {
    const url = new URL(fileUrl);

    // Allow only http/https
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    // Force https for Cloudinary
    if (url.protocol === "http:" && isCloudinaryHost(url.hostname)) {
      url.protocol = "https:";
    }

    // Strip fl_attachment or any other transformations if present
    if (isCloudinaryHost(url.hostname)) {
      // Remove /fl_attachment:something/ or /fl_attachment/
      url.pathname = url.pathname.replace(/\/fl_[^/]+\//g, "/");
    }

    return url.toString();
  } catch (error) {
    console.error("Invalid PDF URL:", error);
    return null;
  }
}

/**
 * Creates Cloudinary download URL
 * Injects fl_attachment to force the browser to download the file
 */
export function getPdfDownloadUrl(fileUrl) {
  const directUrl = getDirectPdfUrl(fileUrl);
  if (!directUrl) return null;

  try {
    const url = new URL(directUrl);

    // Only apply to Cloudinary URLs
    if (!isCloudinaryHost(url.hostname)) {
      return directUrl;
    }

    const parts = url.pathname.split("/");
    const uploadIndex = parts.findIndex((part) => part === "upload");

    if (uploadIndex !== -1) {
      // Inject fl_attachment right after 'upload' if not already present
      const nextPart = parts[uploadIndex + 1];
      if (!nextPart || !nextPart.startsWith("fl_attachment")) {
        parts.splice(uploadIndex + 1, 0, "fl_attachment");
        url.pathname = parts.join("/");
      }
    }

    return url.toString();
  } catch (error) {
    console.error("Failed to generate PDF download URL:", error);
    return directUrl;
  }
}

/**
 * Creates Cloudinary image preview URL (1st page of PDF)
 * Only works for PDFs uploaded as 'image' resource type
 */
export function getPdfPreviewImageUrl(fileUrl) {
  const directUrl = getDirectPdfUrl(fileUrl);
  if (!directUrl) return null;

  try {
    const url = new URL(directUrl);

    // Only apply to Cloudinary URLs
    if (!isCloudinaryHost(url.hostname)) {
      return directUrl;
    }

    // Convert /raw/ to /image/ just in case, though this only works if actually uploaded as image
    url.pathname = url.pathname.replace("/raw/", "/image/");

    // Change extension to .jpg to generate an image
    url.pathname = url.pathname.replace(/\.pdf$/i, ".jpg");

    const parts = url.pathname.split("/");
    const uploadIndex = parts.findIndex((part) => part === "upload");

    if (uploadIndex !== -1) {
      // Inject pg_1 after upload to explicitly grab the first page
      // Ensure we don't duplicate it
      const nextPart = parts[uploadIndex + 1];
      if (!nextPart || !nextPart.startsWith("pg_1")) {
        parts.splice(uploadIndex + 1, 0, "pg_1");
        url.pathname = parts.join("/");
      }
    }

    return url.toString();
  } catch (error) {
    console.error("Failed to generate PDF preview image URL:", error);
    return directUrl;
  }
}