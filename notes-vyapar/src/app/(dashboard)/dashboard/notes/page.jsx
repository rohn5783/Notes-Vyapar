"use client";

import { useState, useEffect } from "react";
import NoteForm from "../../../../presentation/components/notes/NoteForm";
import MyNotesList from "../../../../presentation/components/notes/MyNotesList";
import styles from "./notes-dashboard.module.css";

export default function DashboardNotesPage() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes?mine=true");
      const data = await res.json();
      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setNotes(notes.filter(note => note._id !== id));
      } else {
        alert(data.error || "Failed to delete note");
      }
    } catch (error) {
      alert("Failed to delete note");
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = (updatedNote) => {
    if (editingNote) {
      setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n));
      setEditingNote(null);
    } else {
      setNotes([updatedNote, ...notes]);
    }
  };

  const totalNotes = notes.length;
  const freeNotes = notes.filter(n => n.price === 0).length;
  const paidNotes = totalNotes - freeNotes;

  return (
    <main className={styles.pageShell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Manage Notes</h1>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div>Total Uploads</div>
          <div className={styles.statValue}>{totalNotes}</div>
        </div>
        <div className={styles.statCard}>
          <div>Free Notes</div>
          <div className={styles.statValue}>{freeNotes}</div>
        </div>
        <div className={styles.statCard}>
          <div>Paid Notes</div>
          <div className={styles.statValue}>{paidNotes}</div>
        </div>
      </section>

      <section className={styles.layoutGrid}>
        <div>
          <NoteForm 
            initialData={editingNote} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setEditingNote(null)} 
          />
        </div>

        <div className={styles.listContainer}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            Your Uploaded Notes
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <span className={styles.spinner}></span>
            </div>
          ) : (
            <MyNotesList 
              notes={notes} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </div>
      </section>
    </main>
  );
}
