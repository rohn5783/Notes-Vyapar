import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoteById } from "@/lib/getNotes";
import EditNoteForm from "@/presentation/components/notes/EditNoteForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const note = await getNoteById(id);

  return {
    title: note ? `Edit ${note.title} | Notes Vyapar` : "Edit Note | Notes Vyapar",
  };
}

export default async function EditLibraryNotePage({ params }) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    notFound();
  }

  return (
    <main className="notesPage">
      <div className="notesShellNarrow">
        <div className="notesHeader notesHeaderRow">
          <div>
            <p className="notesKicker">Edit Notes</p>
            <h1 className="notesTitle">Update note details</h1>
            <p className="notesSubtitle">
              Replace files or adjust metadata for this listing.
            </p>
          </div>
          <Link href={`/library/${note._id}`} className="notesButtonSecondary">
            View Notes
          </Link>
        </div>

        <EditNoteForm note={note} />
      </div>
    </main>
  );
}
