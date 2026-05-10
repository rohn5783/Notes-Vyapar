"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LibraryNoteCard from "@/presentation/components/notes/LibraryNoteCard";
import useAuth from "@/presentation/hooks/useAuth";

export default function PurchasesPage() {
  const { authFetch, isAuthenticated, status } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadPurchases = async () => {
      if (status === "loading") {
        return;
      }

      if (!isAuthenticated) {
        setLoading(false);
        setMessage("Please sign in to view your purchases.");
        return;
      }

      try {
        const response = await authFetch("/api/payment/purchases");
        const data = await response.json();

        if (response.ok && data.success) {
          setNotes(data.notes || []);
          setMessage(null);
        } else {
          setMessage(data.message || "Unable to load your purchases.");
        }
      } catch (error) {
        console.error(error);
        setMessage("Unable to load your purchases.");
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [authFetch, isAuthenticated, status]);

  return (
    <main className="notesPage">
      <div className="notesShellNarrow">
        <div className="notesHeader notesHeaderRow">
          <div>
            <p className="notesKicker">My Purchases</p>
            <h1 className="notesTitle">Purchased Notes</h1>
            <p className="notesSubtitle">
              Download the notes you've already purchased or review your library.
            </p>
          </div>
          <Link href="/dashboard" className="notesButtonSecondary">
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading your purchases…</p>
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
              <h2>No purchased notes yet</h2>
              <p>Browse the marketplace to find notes you want to own.</p>
              <Link href="/notes" className="notesButton">
                Visit Marketplace
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
