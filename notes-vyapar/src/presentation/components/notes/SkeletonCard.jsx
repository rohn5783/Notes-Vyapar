// src/presentation/components/notes/SkeletonCard.jsx
export default function SkeletonCard() {
  return (
    <article className="notes-card notes-card--skeleton">
      <div className="notes-card__thumb notes-skeleton-block" />
      <div className="notes-card__body">
        <div className="notes-skeleton-block notes-skeleton-block--tag" />
        <div className="notes-skeleton-block notes-skeleton-block--title" />
        <div className="notes-skeleton-block notes-skeleton-block--title notes-skeleton-block--small" />
        <div className="notes-skeleton-block notes-skeleton-block--text" />
        <div className="notes-skeleton-block notes-skeleton-block--text notes-skeleton-block--short" />
        <div className="notes-skeleton-block notes-skeleton-block--text notes-skeleton-block--shorter" />
        <div className="notes-skeleton-block notes-skeleton-block--meta" />
        <div className="notes-skeleton-block notes-skeleton-block--meta notes-skeleton-block--small" />
        <div className="notes-skeleton-block notes-skeleton-block--button" />
      </div>
    </article>
  );
}
