// src/app/notes/page.jsx
import { getNotes } from "../../lib/getNotes";
import NoteCard from "../../presentation/components/notes/NoteCard";
import NotesFilter from "../../presentation/components/notes/NotesFilter";
import Link from "next/link";

export const metadata = {
  title: "Browse Notes | Notes Vyapar",
  description: "Find the best study notes for your subjects.",
};

export default async function NotesPage({ searchParams }) {
  // Wait for searchParams (Next.js 15 recommendation)
  const resolvedParams = await searchParams;
  const notes = await getNotes(resolvedParams);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c1324] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
            Browse Notes
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            Find the study materials you need to succeed.
          </p>
        </div>

        <NotesFilter />

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1a2333] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No notes found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filters.
            </p>
            <div className="mt-8">
              <Link
                href="/notes"
                className="inline-flex items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}