import { isAdmin } from "@/lib/isAdmin";

export default function NoteCard() {
  return (
    <div className="card">
      <h2>Note Title</h2>

      {isAdmin() && (
        <button className="text-red-500">
          Delete
        </button>
      )}
    </div>
  );
}