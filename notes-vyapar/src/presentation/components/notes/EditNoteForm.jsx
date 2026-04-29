"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useAuth from "@/presentation/hooks/useAuth";

const tagsToInput = (tags) => (Array.isArray(tags) ? tags.join(", ") : "");

export default function EditNoteForm({ note }) {
  const router = useRouter();
  const { authFetch, status, isAuthenticated } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!isAuthenticated) {
      setFeedback({ type: "error", message: "Please login to edit this note." });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const pdfFile = formData.get("file");
    const thumbnail = formData.get("thumbnail");

    if (pdfFile && pdfFile.size > 0 && pdfFile.type !== "application/pdf") {
      setFeedback({ type: "error", message: "Replacement file must be a PDF." });
      return;
    }

    if (thumbnail && thumbnail.size > 0 && !thumbnail.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Thumbnail must be an image file." });
      return;
    }

    formData.set("isPremium", formData.get("isPremium") === "on" ? "true" : "false");

    setIsSubmitting(true);

    try {
      const response = await authFetch(`/api/notes/${note._id}`, {
        method: "PUT",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.error || result.message || "Update failed");
      }

      setFeedback({ type: "success", message: "Note updated successfully." });
      router.push("/library");
      router.refresh();
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Update failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="uploadCard">
      {feedback && (
        <div className={`uploadFeedback ${feedback.type === "success" ? "uploadFeedbackSuccess" : "uploadFeedbackError"}`}>
          {feedback.message}
        </div>
      )}

      <div className="uploadGrid">
        <label className="uploadLabel uploadFieldFull">
          <span className="uploadLabelText">Title</span>
          <input name="title" type="text" required defaultValue={note.title || ""} className="uploadInput" />
        </label>

        <label className="uploadLabel">
          <span className="uploadLabelText">Subject</span>
          <input name="subject" type="text" required defaultValue={note.subject || ""} className="uploadInput" />
        </label>

        <label className="uploadLabel">
          <span className="uploadLabelText">Price</span>
          <input name="price" type="number" min="0" step="1" required defaultValue={note.price ?? 0} className="uploadInput" />
        </label>

        <label className="uploadLabel">
          <span className="uploadLabelText">Category</span>
          <input name="category" type="text" defaultValue={note.category || "General"} className="uploadInput" />
        </label>

        <label className="uploadLabel">
          <span className="uploadLabelText">Tags</span>
          <input name="tags" type="text" defaultValue={tagsToInput(note.tags)} className="uploadInput" placeholder="exam, semester, quick revision" />
        </label>

        <label className="uploadLabel">
          <span className="uploadLabelText">Language</span>
          <input name="language" type="text" defaultValue={note.language || "English"} className="uploadInput" />
        </label>

        <label className="uploadLabel">
          <span className="uploadLabelText">University / Semester</span>
          <input name="university" type="text" defaultValue={note.university || ""} className="uploadInput" />
        </label>

        <label className="uploadLabel uploadFieldFull">
          <span className="uploadLabelText">Description</span>
          <textarea name="description" rows="5" required defaultValue={note.description || ""} className="uploadTextarea" />
        </label>

        <label className="editToggle uploadFieldFull">
          <input name="isPremium" type="checkbox" defaultChecked={Boolean(note.isPremium)} />
          <span>Mark as premium / paid listing</span>
        </label>

        <label className="uploadLabel uploadFieldFull">
          <span className="uploadLabelText">Replace PDF File</span>
          <input name="file" type="file" accept="application/pdf" className="uploadFile" />
          <span className="uploadHint">Leave empty to keep the current PDF.</span>
        </label>

        <label className="uploadLabel uploadFieldFull">
          <span className="uploadLabelText">Replace Thumbnail Image</span>
          <input name="thumbnail" type="file" accept="image/*" className="uploadFile uploadFileMuted" />
          <span className="uploadHint">Leave empty to keep the current thumbnail.</span>
        </label>
      </div>

      <div className="uploadFooter">
        <p className="uploadFooterText">
          Changes will update this note in the library immediately.
        </p>
        <div className="editFormActions">
          <Link href="/library" className="notesButtonSecondary">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting || status === "loading"} className="notesButton">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
