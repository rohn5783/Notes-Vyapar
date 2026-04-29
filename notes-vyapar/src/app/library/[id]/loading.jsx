export default function LibraryNoteLoading() {
  return (
    <main className="notesPage">
      <div className="notesShell">
        <div className="noteViewerHeader">
          <div>
            <div className="skeletonLine skeletonKicker" />
            <div className="skeletonLine skeletonTitle" />
            <div className="skeletonLine skeletonSubtitle" />
          </div>
          <div className="skeletonButton" />
        </div>

        <section className="noteViewerLayout">
          <div className="pdfPanel">
            <div className="pdfSkeleton" />
          </div>
          <aside className="noteDetailsCard">
            <div className="skeletonLine skeletonTitleSmall" />
            <div className="skeletonLine" />
            <div className="skeletonLine" />
            <div className="skeletonLine skeletonShort" />
          </aside>
        </section>
      </div>
    </main>
  );
}
