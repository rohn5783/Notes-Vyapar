import { getNotes } from "@/lib/getNotes";
import Link from "next/link";
import LibraryNoteCard from "@/presentation/components/notes/LibraryNoteCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Library | Notes Vyapar",
  description: "Browse all uploaded notes on Notes Vyapar."
};

export default async function LibraryPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const notes = await getNotes(resolvedParams);
  const search = resolvedParams?.search || "";

  return (
    <main className="notesPage">
      <div className="notesShell">
        <div className="libraryHeader">
          <div>
            <p className="notesKicker">Library</p>
            <h1 className="notesTitle">
              Uploaded Notes
            </h1>
            <p className="notesSubtitle">
              Discover the latest notes shared by sellers across the marketplace.
            </p>
          </div>

          <form action="/library" className="librarySearch">
            <input
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Search title, subject, or description"
              className="uploadInput"
            />
            <button
              type="submit"
              className="notesButton"
            >
              Search
            </button>
          </form>
        </div>

        {notes.length === 0 ? (
          <section className="notesEmptyState">
            <div>
            <h2>No notes uploaded yet</h2>
            <p>
              Start the library by uploading the first PDF note.
            </p>
            <Link
              href="/upload"
              className="notesButton"
              style={{ marginTop: "2rem" }}
            >
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
