import Link from "next/link";

export default function LibraryNoteNotFound() {
  return (
    <main className="notesPage">
      <div className="notesShell">
        <section className="notesEmptyState">
          <div>
            <h2>Note not found</h2>
            <p>The note may have been removed, or the link is no longer valid.</p>
            <Link href="/library" className="notesButton" style={{ marginTop: "2rem" }}>
              Back to Library
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
