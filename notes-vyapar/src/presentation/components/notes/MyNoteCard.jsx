"use client";

import { getNotePdfViewUrl } from "@/lib/pdf-url";
import styles from "../../../app/(dashboard)/dashboard/notes/notes-dashboard.module.css";

export default function MyNoteCard({ note, onEdit, onDelete }) {
  const isFree = Number(note.price) === 0;

  return (
    <div className={styles.noteCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className={`${styles.badge} ${isFree ? styles.badgeFree : styles.badgePaid}`}>
          {isFree ? "FREE" : `Rs. ${note.price}`}
        </span>
        {note.isPremium && (
          <span className={styles.badge} style={{ background: "#8b5cf6", color: "white" }}>
            PREMIUM
          </span>
        )}
      </div>

      <h3 className={styles.noteTitle}>{note.title}</h3>
      <p className={styles.noteMeta}>
        {note.subject} - {new Date(note.createdAt).toLocaleDateString()}
      </p>

      <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {note.description}
      </p>

      <div className={styles.cardActions}>
        <a
          href={getNotePdfViewUrl(note._id)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btnSecondary}
          style={{ padding: "0.5rem", textAlign: "center", textDecoration: "none", flex: 1, fontSize: "0.85rem" }}
        >
          View PDF
        </a>
        <button onClick={() => onEdit(note)} className={styles.btnEdit}>
          Edit
        </button>
        <button onClick={() => onDelete(note._id)} className={styles.btnDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
