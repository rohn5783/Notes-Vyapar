"use client";

import MyNoteCard from "./MyNoteCard";
import styles from "../../../app/(dashboard)/dashboard/notes/notes-dashboard.module.css";

export default function MyNotesList({ notes, onEdit, onDelete }) {
  if (!notes || notes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--toggle-bg)', borderRadius: '1rem' }}>
        <p style={{ color: '#888', marginBottom: '1rem' }}>You haven't uploaded any notes yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.gridCards}>
      {notes.map(note => (
        <MyNoteCard 
          key={note._id} 
          note={note} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
