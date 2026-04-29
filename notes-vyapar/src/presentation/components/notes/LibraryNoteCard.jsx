"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useAuth from "@/presentation/hooks/useAuth";

const formatDate = (value) => {
  if (!value) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export default function LibraryNoteCard({ note }) {
  const router = useRouter();
  const { user, authFetch, isAuthenticated } = useAuth();
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState(null);
  const isFree = Number(note.price) === 0;

  const isOwner = useMemo(() => {
    const sellerId = note.seller?._id || note.seller?.id || note.seller;
    return Boolean(user?.id && sellerId && String(user.id) === String(sellerId));
  }, [note.seller, user?.id]);

  const handleDelete = async () => {
    setMessage(null);

    if (!isAuthenticated) {
      setMessage({ type: "error", text: "Please login to delete this note." });
      return;
    }

    if (!isOwner) {
      setMessage({ type: "error", text: "You can delete only your own notes." });
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this note?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await authFetch(`/api/notes/${note._id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.error || result.message || "Delete failed");
      }

      window.alert("Note deleted successfully");
      setIsDeleted(true);
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Delete failed" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <article className="libraryCard">
      {note.thumbnailUrl && (
        <div className="libraryThumb">
          <img src={note.thumbnailUrl} alt={`${note.title} thumbnail`} />
        </div>
      )}

      <div className="libraryCardTop">
        <span className="libraryBadge">{note.subject}</span>
        <span className={`libraryPriceBadge ${isFree ? "libraryPriceFree" : "libraryPricePaid"}`}>
          {isFree ? "Free" : "Paid"}
        </span>
      </div>

      <h2 className="libraryCardTitle lineClamp2">{note.title}</h2>
      <p className="libraryCardDescription lineClamp3">{note.description}</p>

      <div className="libraryMeta">
        <div className="libraryMetaRow">
          <span>Price</span>
          <strong>{isFree ? "Free" : `Rs. ${note.price}`}</strong>
        </div>
        <div className="libraryMetaRow">
          <span>Seller</span>
          <strong>{note.seller?.name || "Anonymous"}</strong>
        </div>
        <div className="libraryMetaRow">
          <span>Uploaded</span>
          <strong>{formatDate(note.createdAt)}</strong>
        </div>
      </div>

      {message && (
        <p className={`libraryCardMessage ${message.type === "error" ? "libraryCardMessageError" : ""}`}>
          {message.text}
        </p>
      )}

      <div className="libraryActions">
        <Link href={`/library/${note._id}`} className="libraryActionView">
          View Notes
        </Link>
        <Link
          href={`/library/edit/${note._id}`}
          className={`libraryActionEdit ${!isOwner ? "libraryActionDisabled" : ""}`}
          aria-disabled={!isOwner}
          onClick={(event) => {
            if (!isOwner) {
              event.preventDefault();
              setMessage({ type: "error", text: "You can edit only your own notes." });
            }
          }}
        >
          Edit Notes
        </Link>
        <button
          type="button"
          className="libraryActionDelete"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Notes"}
        </button>
      </div>
    </article>
  );
}
