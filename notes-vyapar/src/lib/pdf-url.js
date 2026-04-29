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

export function getDirectPdfUrl(fileUrl) {
  if (!fileUrl) {
    return null;
  }

  try {
    const url = new URL(fileUrl);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    if (url.protocol === "http:" && url.hostname.includes("cloudinary.com")) {
      url.protocol = "https:";
    }

    return url.toString();
  } catch {
    return null;
  }
}
