export default function NoteDetailPage({ params }) {
  return (
    <div>
      <h1>Note Details</h1>
      <p>Note ID: {params.id}</p>
    </div>
  );
}
