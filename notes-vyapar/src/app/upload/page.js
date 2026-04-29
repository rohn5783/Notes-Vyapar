"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "@/presentation/hooks/useAuth";

export default function UploadPage() {
  const router = useRouter();
  const { authFetch, isAuthenticated, status } = useAuth();
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!isAuthenticated) {
      setFeedback({ type: "error", message: "Please login before uploading notes." });
      return;
    }

    if (!file) {
      setFeedback({ type: "error", message: "Please select a PDF file first." });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("file", file);

    setIsSubmitting(true);

    try {
      const response = await authFetch("/api/notes", {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.error || result.message || "Upload failed");
      }

      setFeedback({ type: "success", message: "Note uploaded successfully." });
      router.push("/library");
      router.refresh();
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Upload failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="notesPage">
      <div className="notesShellNarrow">
        <div className="notesHeader notesHeaderRow">
          <div>
            <p className="notesKicker">Upload Notes</p>
            <h1 className="notesTitle">
              Add a new study resource
            </h1>
          </div>
          <Link
            href="/library"
            className="notesButtonSecondary"
          >
            View Library
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="uploadCard"
        >
          {feedback && (
            <div
              className={`uploadFeedback ${
                feedback.type === "success"
                  ? "uploadFeedbackSuccess"
                  : "uploadFeedbackError"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="uploadGrid">
            <label className="uploadLabel uploadFieldFull">
              <span className="uploadLabelText">Title</span>
              <input
                name="title"
                type="text"
                required
                className="uploadInput"
                placeholder="e.g. Data Structures Complete Notes"
              />
            </label>

            <label className="uploadLabel">
              <span className="uploadLabelText">Subject</span>
              <input
                name="subject"
                type="text"
                required
                className="uploadInput"
                placeholder="Computer Science"
              />
            </label>

            <label className="uploadLabel">
              <span className="uploadLabelText">Price</span>
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                defaultValue="0"
                required
                className="uploadInput"
              />
            </label>

            <label className="uploadLabel">
              <span className="uploadLabelText">Category</span>
              <input
                name="category"
                type="text"
                className="uploadInput"
                placeholder="General"
              />
            </label>

            <label className="uploadLabel">
              <span className="uploadLabelText">Tags</span>
              <input
                name="tags"
                type="text"
                className="uploadInput"
                placeholder="exam, semester, quick revision"
              />
            </label>

            <label className="uploadLabel uploadFieldFull">
              <span className="uploadLabelText">Description</span>
              <textarea
                name="description"
                rows="5"
                required
                className="uploadTextarea"
                placeholder="Describe what students will find in this PDF."
              />
            </label>

            <label className="uploadLabel uploadFieldFull">
              <span className="uploadLabelText">PDF File</span>
              <input
                name="file"
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                required
                className="uploadFile"
              />
            </label>

            <label className="uploadLabel uploadFieldFull">
              <span className="uploadLabelText">Thumbnail Image</span>
              <input
                name="thumbnail"
                type="file"
                accept="image/*"
                className="uploadFile uploadFileMuted"
              />
              <span className="uploadHint">
                Optional cover image for your note card.
              </span>
            </label>
          </div>

          <div className="uploadFooter">
            <p className="uploadFooterText">
              Your note will appear in the library immediately after upload.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || status === "loading"}
              className="notesButton"
            >
              {isSubmitting ? "Uploading..." : "Upload Note"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
