// src/presentation/components/notes/NoteCard.jsx
import Link from "next/link";

export default function NoteCard({ note }) {
  const isFree = Number(note.price) === 0;

  return (
    <div className="bg-white dark:bg-[#1a2333] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full border border-gray-100 dark:border-gray-800">
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
            {note.subject}
          </span>
          <span className={`font-bold text-lg ${isFree ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
            {isFree ? "Free" : `Rs. ${note.price}`}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug">
          {note.title}
        </h3>

        <p className="line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {note.description}
        </p>

        <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-5">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {note.seller?.name || "Anonymous"}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(note.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <Link
            href={`/library/${note._id}`}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm hover:shadow"
          >
            View Notes
          </Link>
        </div>
      </div>
    </div>
  );
}
