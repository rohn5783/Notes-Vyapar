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

export function getNotePdfViewUrl(noteId) {
  return `/api/notes/${noteId}/pdf`;
}

export function getNotePdfDownloadUrl(noteId) {
  return `/api/notes/${noteId}/pdf?download=1`;
}
