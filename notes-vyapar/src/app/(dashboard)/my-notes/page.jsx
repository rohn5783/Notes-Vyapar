"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LibraryNoteCard from "@/presentation/components/notes/LibraryNoteCard";
import useAuth from "@/presentation/hooks/useAuth";

export default function MyNotesPage() {
  const { authFetch, isAuthenticated, status } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadMyNotes = async () => {
      if (status === "loading") {
        return;
      }

      if (!isAuthenticated) {
        setLoading(false);
        setMessage("Please sign in to view your uploaded notes.");
        return;
      }

      try {
        const response = await authFetch("/api/notes/my-notes");
        const data = await response.json();

        if (response.ok && data.success) {
          setNotes(data.notes || []);
          setMessage(null);
        } else {
          setMessage(data.message || "Unable to load your notes.");
        }
      } catch (error) {
        console.error(error);
        setMessage("Unable to load your notes.");
      } finally {
        setLoading(false);
      }
    };

    loadMyNotes();
  }, [authFetch, isAuthenticated, status]);

  return (
    <main className="notesPage">
      <div className="notesShellNarrow">
        <div className="notesHeader notesHeaderRow">
          <div>
            <p className="notesKicker">My Notes</p>
            <h1 className="notesTitle">Uploaded Notes</h1>
            <p className="notesSubtitle">
              Manage the notes you've uploaded, edit listings, and remove outdated files.
            </p>
          </div>
          <Link href="/upload" className="notesButtonSecondary">
            Upload New Note
          </Link>
        </div>

        {loading ? (
          <p>Loading your notes…</p>
        ) : message ? (
          <section className="notesEmptyState">
            <div>
              <h2>{message}</h2>
              {isAuthenticated ? null : (
                <Link href="/login" className="notesButton">
                  Sign In
                </Link>
              )}
            </div>
          </section>
        ) : notes.length === 0 ? (
          <section className="notesEmptyState">
            <div>
              <h2>You haven't uploaded any notes yet</h2>
              <p>Upload a PDF to start selling your study material.</p>
              <Link href="/upload" className="notesButton">
                Upload First Note
              </Link>
            </div>
          </section>
        ) : (
          <section className="notesGrid">
            {notes.map((note) => (
              <LibraryNoteCard key={note._id} note={note} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
