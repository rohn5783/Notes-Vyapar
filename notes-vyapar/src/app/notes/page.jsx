"use client";

import { isAdmin } from "@/lib/isAdmin";

export default function NoteDetail() {
  return (
    <div>
      <h1>Note Title</h1>

      {/* 🔥 ADMIN ONLY BUTTON */}
      {isAdmin() && (
        <button className="bg-red-500 text-white px-4 py-2">
          Delete Note
        </button>
      )}
    </div>
  );
}