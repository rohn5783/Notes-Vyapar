export default function EditLibraryNoteLoading() {
  return (
    <main className="notesPage">
      <div className="notesShellNarrow">
        <div className="notesHeader">
          <div className="skeletonLine skeletonKicker" />
          <div className="skeletonLine skeletonTitle" />
          <div className="skeletonLine skeletonSubtitle" />
        </div>
        <div className="uploadCard">
          <div className="uploadGrid">
            <div className="skeletonLine skeletonTitleSmall" />
            <div className="skeletonLine skeletonTitleSmall" />
            <div className="skeletonLine skeletonTitleSmall" />
            <div className="skeletonLine skeletonTitleSmall" />
            <div className="skeletonLine skeletonSubtitle uploadFieldFull" />
            <div className="skeletonLine skeletonSubtitle uploadFieldFull" />
          </div>
        </div>
      </div>
    </main>
  );
}
