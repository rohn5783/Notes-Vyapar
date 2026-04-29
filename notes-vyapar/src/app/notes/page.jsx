// src/app/notes/page.jsx
import { getNotes } from "../../lib/getNotes";
import NoteCard from "../../presentation/components/notes/NoteCard";
import NotesFilter from "../../presentation/components/notes/NotesFilter";
import Link from "next/link";

export const metadata = {
  title: "Browse Notes | Notes Vyapar",
  description: "Find the best study notes for your subjects.",
};

export default async function NotesPage({ searchParams }) {
  // Wait for searchParams (Next.js 15 recommendation)
  const resolvedParams = await searchParams;
  const notes = await getNotes(resolvedParams);

  return (
    <div className="notesPage">
      <div className="notesShell">
        <div className="notesHeaderCentered">
          <h1 className="notesTitle">
            Browse Notes
          </h1>
          <p className="notesSubtitle">
            Find the study materials you need to succeed.
          </p>
        </div>

        <NotesFilter />

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="notesEmptyState">
            <div>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3>No notes found</h3>
              <p>
                Try adjusting your search or filters.
              </p>
              <Link
                href="/notes"
                className="notesButton"
                style={{ marginTop: "2rem" }}
              >
                Clear all filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="notesGrid">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
