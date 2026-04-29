import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoteById } from "@/lib/getNotes";
import { getDirectPdfUrl, sanitizePdfFilename } from "@/lib/pdf-url";

export const dynamic = "force-dynamic";

const formatDate = (value) => {
  if (!value) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    return {
      title: "Note Not Found | Notes Vyapar"
    };
  }

  return {
    title: `${note.title} | Notes Vyapar`,
    description: note.description
  };
}

export default async function LibraryNotePage({ params }) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    notFound();
  }

  const isFree = Number(note.price) === 0;
  const tags = Array.isArray(note.tags) ? note.tags.filter(Boolean) : [];
  const pdfUrl = getDirectPdfUrl(note.fileUrl);
  const pdfFilename = sanitizePdfFilename(note.title);

  return (
    <main className="notesPage">
      <div className="notesShell">
        <div className="noteViewerHeader">
          <div>
            <p className="notesKicker">Note Viewer</p>
            <h1 className="notesTitle">{note.title}</h1>
            <p className="notesSubtitle">
              {note.subject} notes uploaded by {note.seller?.name || "Anonymous"}.
            </p>
          </div>

          <Link href="/library" className="notesButtonSecondary">
            Back to Library
          </Link>
        </div>

        <section className="noteViewerLayout">
          <div className="pdfPanel">
            <div className="pdfPanelHeader">
              <div>
                <h2>PDF Preview</h2>
                <p>{pdfUrl ? "Scroll inside the viewer to read the note." : "PDF file unavailable"}</p>
              </div>
              {pdfUrl && (
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="notesButtonSecondary">
                  Open in New Tab
                </a>
              )}
            </div>

            {pdfUrl ? (
              <object
                data={pdfUrl}
                type="application/pdf"
                className="pdfFrame"
                aria-label={`${note.title} PDF preview`}
              >
                <iframe
                  src={pdfUrl}
                  title={`${note.title} PDF preview`}
                  className="pdfFrame"
                />
                <div className="pdfMissing">
                  <h2>PDF file unavailable</h2>
                  <p>Your browser could not render this PDF inline. Open it in a new tab instead.</p>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="notesButton">
                    Open PDF
                  </a>
                </div>
              </object>
            ) : (
              <div className="pdfMissing">
                <h2>PDF file unavailable</h2>
                <p>This note does not have a valid uploaded PDF URL attached.</p>
              </div>
            )}
          </div>

          <aside className="noteDetailsCard">
            {note.thumbnailUrl && (
              <img className="noteDetailsThumb" src={note.thumbnailUrl} alt={`${note.title} cover`} />
            )}

            <div className="noteDetailsTop">
              <span className="libraryBadge">{note.subject}</span>
              <span className={`libraryPriceBadge ${isFree ? "libraryPriceFree" : "libraryPricePaid"}`}>
                {isFree ? "Free" : "Paid"}
              </span>
            </div>

            <h2>{note.title}</h2>
            <p className="noteDescription">{note.description}</p>

            <div className="noteDetailList">
              <div>
                <span>Price</span>
                <strong>{isFree ? "Free" : `Rs. ${note.price}`}</strong>
              </div>
              <div>
                <span>Category</span>
                <strong>{note.category || "General"}</strong>
              </div>
              <div>
                <span>Seller</span>
                <strong>{note.seller?.name || "Anonymous"}</strong>
              </div>
              <div>
                <span>Uploaded</span>
                <strong>{formatDate(note.createdAt)}</strong>
              </div>
              {note.language && (
                <div>
                  <span>Language</span>
                  <strong>{note.language}</strong>
                </div>
              )}
              {note.university && (
                <div>
                  <span>University / Semester</span>
                  <strong>{note.university}</strong>
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <div className="noteTags">
                <span>Tags</span>
                <div>
                  {tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="noteActions">
              {pdfUrl && (
                <>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="notesButton">
                    View PDF
                  </a>
                  <a href={pdfUrl} download={pdfFilename} className="notesButtonSecondary">
                    Download PDF
                  </a>
                </>
              )}
              <Link href="/library" className="notesButtonSecondary">
                Back to Library
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
