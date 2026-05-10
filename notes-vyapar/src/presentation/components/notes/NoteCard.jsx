// src/presentation/components/notes/NoteCard.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import useAuth from "@/presentation/hooks/useAuth";

export default function NoteCard({ note }) {
  const { authFetch } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const isFree = Number(note.price) === 0;
  const isOwner = note.isOwner;
  const hasPurchased = note.hasPurchased;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setIsDeleting(true);
    try {
      const response = await authFetch(`/api/notes/${note._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete note");
      }
    } catch (error) {
      alert("Error deleting note");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="notes-card">
      <div className="notes-card__thumb">
        {note.thumbnailUrl ? (
          <img src={note.thumbnailUrl} alt={`${note.title} thumbnail`} className="notes-card__image" />
        ) : (
          <div className="notes-card__empty-thumb">
            <svg className="notes-card__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        <span className={`notes-card__badge ${isFree ? "notes-card__badge--free" : "notes-card__badge--paid"}`}>
          {isFree ? "Free" : "Paid"}
        </span>
      </div>

      <div className="notes-card__body">
        <span className="notes-card__tag">{note.subject || note.category || "General"}</span>

        <h3 className="notes-card__title">
          <Link href={`/library/${note._id}`} className="notes-card__link">
            {note.title}
          </Link>
        </h3>

        <p className="notes-card__description">{note.description}</p>

        <div className="notes-card__meta-row">
          <span className="notes-card__price">{isFree ? "Free" : `₹${note.price}`}</span>
          <span className="notes-card__date">{new Date(note.createdAt).toLocaleDateString()}</span>
        </div>

        <p className="notes-card__author">By {note.seller?.name || "Anonymous"}</p>

        <div className="notes-card__actions">
          {isOwner ? (
            <>
              <Link href={`/notes/edit/${note._id}`} className="notes-button notes-button--secondary notes-button--full">
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="notes-button notes-button--danger notes-button--full"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </>
          ) : isFree || hasPurchased ? (
            <a href={`/api/pdf/download/${encodeURIComponent(note._id)}`} className="notes-button notes-button--success notes-button--full">
              Download Now
            </a>
          ) : (
            <Link href={`/library/${note._id}`} className="notes-button notes-button--primary notes-button--full">
              Buy Now
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

